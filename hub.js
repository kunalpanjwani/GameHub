// hub.js
document.addEventListener('DOMContentLoaded', () => {
// hub.js
document.addEventListener('DOMContentLoaded', () => {
    const puzzlesContainer = document.getElementById('puzzles-container');
    const errorMessage = document.getElementById('error-message');
    const startPlayingBtn = document.getElementById('start-playing-btn');
    const randomPuzzleBtn = document.getElementById('random-puzzle-btn');
    const puzzleGallerySection = document.getElementById('puzzle-gallery');
    const filterChips = document.querySelectorAll('.filter-chip');

    let allPuzzles = [];
    let activeFilter = 'all';

    // Smooth scroll for "Start Playing" button
    if (startPlayingBtn) {
        startPlayingBtn.addEventListener('click', () => {
            puzzleGallerySection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Random Puzzle functionality
    if (randomPuzzleBtn) {
        randomPuzzleBtn.addEventListener('click', () => {
            if (allPuzzles.length > 0) {
                const randomIndex = Math.floor(Math.random() * allPuzzles.length);
                window.location.href = allPuzzles[randomIndex].path;
            } else {
                // Fallback if no puzzles are loaded (shouldn't happen if error handling works)
                alert('No puzzles available to play randomly!');
            }
        });
    }

    // Function to render puzzle cards
    const renderPuzzles = (puzzlesToRender) => {
        puzzlesContainer.innerHTML = ''; // Clear existing content
        if (puzzlesToRender.length === 0) {
            errorMessage.classList.remove('hidden');
            errorMessage.querySelector('h3').textContent = 'No puzzles found matching your criteria.';
            errorMessage.querySelector('p').textContent = 'Try adjusting your filters or check back later for new challenges.';
            return;
        } else {
            errorMessage.classList.add('hidden');
        }

        puzzlesToRender.forEach((puzzle, index) => {
            const puzzleCard = document.createElement('a');
            puzzleCard.href = puzzle.path;
            puzzleCard.className = 'puzzle-card';
            puzzleCard.style.setProperty('--animation-order', index); // For staggered animation

            const difficultyClass = puzzle.difficulty ? puzzle.difficulty.toLowerCase() : 'unknown';
            puzzleCard.dataset.difficulty = difficultyClass; // Add data-difficulty attribute

            puzzleCard.innerHTML = `
                <h3 class="puzzle-card-title">${puzzle.title}</h3>
                <p class="puzzle-card-description">${puzzle.description}</p>
                <div class="puzzle-card-meta">
                    <span class="difficulty-badge ${difficultyClass}">${puzzle.difficulty || 'Unknown'}</span>
                </div>
            `;
            puzzlesContainer.appendChild(puzzleCard);

            // Staggered fade-in animation
            setTimeout(() => {
                puzzleCard.classList.add('show');
            }, 100 * index); // Adjust delay as needed
        });
    };

    // Filter functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.dataset.filter;

            const filteredPuzzles = allPuzzles.filter(puzzle => {
                return activeFilter === 'all' || puzzle.difficulty.toLowerCase() === activeFilter;
            });
            renderPuzzles(filteredPuzzles);
        });
    });

    // Fetch puzzles
    fetch('puzzles-index.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(puzzles => {
            allPuzzles = puzzles;
            renderPuzzles(allPuzzles);
        })
        .catch(error => {
            console.error('Error loading puzzles:', error);
            puzzlesContainer.innerHTML = ''; // Clear any loading indicators
            errorMessage.classList.remove('hidden'); // Show error message
            errorMessage.querySelector('h3').textContent = 'Oops! Puzzles Lost in the Chrono-Stream.';
            errorMessage.querySelector('p').textContent = 'It seems we couldn't load the puzzle library. Please check your connection or try again later.';
        });
});
