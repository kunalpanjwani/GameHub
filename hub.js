// hub.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('puzzles-index.json')
        .then(response => response.json())
        .then(puzzles => {
            const gameList = document.getElementById('game-list');
            puzzles.forEach(puzzle => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.innerHTML = `
                    <h2>${puzzle.name}</h2>
                    <p>${puzzle.description}</p>
                    <a href="${puzzle.path}">Play Now</a>
                `;
                gameList.appendChild(gameCard);
            });
        })
        .catch(error => console.error('Error loading puzzles:', error));
});