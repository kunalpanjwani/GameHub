// Game Data: Chronicles of the Time Library
const gameData = {
    categories: {
        librarian: ['Elara', 'Kael', 'Seraphina', 'Orion'],
        era: ['Ancient Egypt', 'Victorian London', 'Future Metropolis', 'Renaissance Italy'],
        device: ['Chronometer', 'Temporal Compass', 'Aetheric Lens', 'Quantum Key']
    },
    clues: [
        "Elara was not in Ancient Egypt, nor did she use the Quantum Key.",
        "The Temporal Compass was used in Victorian London, but not by Orion.",
        "Seraphina's incident occurred in the Future Metropolis, but she didn't use the Chronometer.",
        "The Aetheric Lens was employed in Renaissance Italy, but not by Kael.",
        "The Librarian who caused the paradox in Ancient Egypt used the Aetheric Lens.",
        "Orion was not in Victorian London, and he did not use the Temporal Compass.",
        "Kael's paradox was not in the Future Metropolis, and he did not use the Quantum Key.",
        "The Chronometer was used by the Librarian in Renaissance Italy.",
        "The Librarian who used the Quantum Key was not Seraphina.",
        "Elara's incident did not involve the Temporal Compass."
    ],
    solution: {
        librarian: {
            'Elara': { era: 'Victorian London', device: 'Temporal Compass' },
            'Kael': { era: 'Ancient Egypt', device: 'Aetheric Lens' },
            'Seraphina': { era: 'Future Metropolis', device: 'Quantum Key' },
            'Orion': { era: 'Renaissance Italy', device: 'Chronometer' }
        },
        era: {
            'Ancient Egypt': { librarian: 'Kael', device: 'Aetheric Lens' },
            'Victorian London': { librarian: 'Elara', device: 'Temporal Compass' },
            'Future Metropolis': { librarian: 'Seraphina', device: 'Quantum Key' },
            'Renaissance Italy': { librarian: 'Orion', device: 'Chronometer' }
        },
        device: {
            'Chronometer': { librarian: 'Orion', era: 'Renaissance Italy' },
            'Temporal Compass': { librarian: 'Elara', era: 'Victorian London' },
            'Aetheric Lens': { librarian: 'Kael', era: 'Ancient Egypt' },
            'Quantum Key': { librarian: 'Seraphina', era: 'Future Metropolis' }
        }
    }
};

// Game State
// gridStates will store the player's selections for each grid
// Structure: { 'librarian-era': { 'LibrarianName': { 'EraName': 'TRUE' | 'FALSE' | 'UNKNOWN' } } }
let gridStates = {};
let hintsUsed = 0;
const MAX_HINTS = 3;

// UI Elements
const connectionBoard = document.getElementById('connection-board');
const cluesList = document.getElementById('clues-list');
const checkSolutionBtn = document.getElementById('check-solution-btn');
const resetPuzzleBtn = document.getElementById('reset-puzzle-btn');
const feedbackMessage = document.getElementById('feedback-message');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const showHintBtn = document.getElementById('show-hint-btn');
const hintText = document.getElementById('hint-text');
const solutionSummary = document.getElementById('solution-summary');
const revealSolutionBtn = document.getElementById('reveal-solution-btn');

// Initialize the puzzle
document.addEventListener('DOMContentLoaded', () => {
    initializeGridStates();
    renderGrids();
    renderClues();
    resetGame();
    updateProgressBar();
});

// Helper to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize gridStates with UNKNOWN for all cells
function initializeGridStates() {
    const categories = Object.keys(gameData.categories);
    const gridPairs = [
        ['librarian', 'era'],
        ['librarian', 'device'],
        ['era', 'device']
    ];

    gridPairs.forEach(([cat1, cat2]) => {
        const gridId = `grid-${cat1}-${cat2}`;
        gridStates[gridId] = {};
        gameData.categories[cat1].forEach(item1 => {
            gridStates[gridId][item1] = {};
            gameData.categories[cat2].forEach(item2 => {
                gridStates[gridId][item1][item2] = 'UNKNOWN';
            });
        });
    });
}

// Render the three logic grids
function renderGrids() {
    const gridPairs = [
        ['librarian', 'era'],
        ['librarian', 'device'],
        ['era', 'device']
    ];

    gridPairs.forEach(([cat1, cat2]) => {
        const gridId = `grid-${cat1}-${cat2}`;
        const gridContainer = document.getElementById(gridId);
        if (!gridContainer) return;

        gridContainer.innerHTML = `<h4>${capitalizeFirstLetter(cat1)} ↔ ${capitalizeFirstLetter(cat2)}</h4>`;

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Header Row (Category 2 items)
        const headerRow = document.createElement('tr');
        const emptyTh = document.createElement('th');
        headerRow.appendChild(emptyTh); // Empty corner cell
        gameData.categories[cat2].forEach(item2 => {
            const th = document.createElement('th');
            th.textContent = item2;
            th.dataset.category = cat2;
            th.dataset.entity = item2;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body Rows (Category 1 items and cells)
        gameData.categories[cat1].forEach(item1 => {
            const row = document.createElement('tr');
            const rowHeader = document.createElement('th');
            rowHeader.textContent = item1;
            rowHeader.dataset.category = cat1;
            rowHeader.dataset.entity = item1;
            row.appendChild(rowHeader);

            gameData.categories[cat2].forEach(item2 => {
                const cell = document.createElement('td');
                cell.dataset.cat1 = cat1;
                cell.dataset.item1 = item1;
                cell.dataset.cat2 = cat2;
                cell.dataset.item2 = item2;
                cell.classList.add(`state-${gridStates[gridId][item1][item2].toLowerCase()}`);
                cell.innerHTML = getCellIcon(gridStates[gridId][item1][item2]);
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('mouseenter', handleCellHover);
                cell.addEventListener('mouseleave', clearHighlights);
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        gridContainer.appendChild(table);
    });
}

// Get icon for cell state
function getCellIcon(state) {
    switch (state) {
        case 'TRUE': return '<span class="icon">✔</span>';
        case 'FALSE': return '<span class="icon">✖</span>';
        case 'UNKNOWN': return '<span class="icon">?</span>';
        default: return '';
    }
}

// Handle cell click to cycle state
function handleCellClick(event) {
    const cell = event.target.closest('td');
    if (!cell) return;

    const { cat1, item1, cat2, item2 } = cell.dataset;
    const gridId = `grid-${cat1}-${cat2}`;

    let currentState = gridStates[gridId][item1][item2];
    let newState;

    switch (currentState) {
        case 'UNKNOWN': newState = 'TRUE'; break;
        case 'TRUE': newState = 'FALSE'; break;
        case 'FALSE': newState = 'UNKNOWN'; break;
        default: newState = 'UNKNOWN';
    }

    gridStates[gridId][item1][item2] = newState;
    cell.className = ''; // Clear existing classes
    cell.classList.add(`state-${newState.toLowerCase()}`);
    cell.innerHTML = getCellIcon(newState);
    updateProgressBar();
}

// Handle cell hover to highlight headers
function handleCellHover(event) {
    const cell = event.target.closest('td');
    if (!cell) return;

    const { cat1, item1, cat2, item2 } = cell.dataset;

    // Highlight row header
    const rowHeader = cell.parentNode.querySelector(`th[data-category="${cat1}"][data-entity="${item1}"]`);
    if (rowHeader) rowHeader.classList.add('hover-highlight');

    // Highlight column header
    const colHeader = cell.closest('table').querySelector(`thead th[data-category="${cat2}"][data-entity="${item2}"]`);
    if (colHeader) colHeader.classList.add('hover-highlight');
}

// Clear all highlights
function clearHighlights() {
    document.querySelectorAll('.hover-highlight').forEach(el => el.classList.remove('hover-highlight'));
    document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
    document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
}

// Render Clues
function renderClues() {
    cluesList.innerHTML = '';
    gameData.clues.forEach((clue, index) => {
        const li = document.createElement('li');
        li.textContent = clue;
        li.dataset.clueIndex = index;
        li.addEventListener('mouseenter', () => highlightEntitiesForClue(clue));
        li.addEventListener('mouseleave', clearHighlights);
        cluesList.appendChild(li);
    });
}

// Dynamic Clue Highlighting for grids
function highlightEntitiesForClue(clue) {
    clearHighlights(); // Clear previous highlights

    // Dim all headers first
    document.querySelectorAll('.logic-grid th').forEach(el => el.classList.add('dimmed'));

    // Find entities mentioned in the clue and highlight them
    for (const cat in gameData.categories) {
        gameData.categories[cat].forEach(entity => {
            if (clue.includes(entity)) {
                document.querySelectorAll(`th[data-category="${cat}"][data-entity="${entity}"]`).forEach(el => {
                    el.classList.remove('dimmed');
                    el.classList.add('highlighted');
                });
            }
        });
    }
}

// Progress Bar
function updateProgressBar() {
    let correctTrueConnections = 0;
    let totalPossibleTrueConnections = 0;

    // Calculate total possible true connections from the solution
    const solutionTrueConnections = getSolutionTrueConnections();
    totalPossibleTrueConnections = Object.keys(solutionTrueConnections).length;

    // Compare player's TRUE states with solution
    for (const gridId in gridStates) {
        for (const item1 in gridStates[gridId]) {
            for (const item2 in gridStates[gridId][item1]) {
                if (gridStates[gridId][item1][item2] === 'TRUE') {
                    const key = generateConnectionKeyFromGrid(gridId, item1, item2);
                    if (solutionTrueConnections[key]) {
                        correctTrueConnections++;
                    }
                }
            }
        }
    }

    const progressPercentage = totalPossibleTrueConnections > 0 ?
        Math.round((correctTrueConnections / totalPossibleTrueConnections) * 100) : 0;

    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${progressPercentage}% Resolved`;
}

// Helper to generate a consistent key for connections from grid data
function generateConnectionKeyFromGrid(gridId, item1, item2) {
    const [_, cat1, cat2] = gridId.split('-');
    const pair1 = `${cat1}:${item1}`;
    const pair2 = `${cat2}:${item2}`;
    return [pair1, pair2].sort().join('--');
}

// Helper to get all true connections from the solution
function getSolutionTrueConnections() {
    const solutionTrueConnections = {};
    const categories = Object.keys(gameData.categories);

    // Iterate through the solution to find all TRUE relationships
    categories.forEach(cat1 => {
        gameData.categories[cat1].forEach(ent1 => {
            const solutionForEnt1 = gameData.solution[cat1][ent1];
            if (solutionForEnt1) {
                for (const cat2 in solutionForEnt1) {
                    const ent2 = solutionForEnt1[cat2];
                    // Ensure cat1 and cat2 are different for a valid connection
                    if (cat1 !== cat2) {
                        const key = generateConnectionKeyFromEntities(cat1, ent1, cat2, ent2);
                        solutionTrueConnections[key] = true;
                    }
                }
            }
        });
    });
    return solutionTrueConnections;
}

// Helper to generate a consistent key for connections from entity names
function generateConnectionKeyFromEntities(cat1, ent1, cat2, ent2) {
    const pair1 = `${cat1}:${ent1}`;
    const pair2 = `${cat2}:${ent2}`;
    return [pair1, pair2].sort().join('--');
}

// Check Solution
checkSolutionBtn.addEventListener('click', () => {
    let totalCorrectCells = 0;
    let totalIncorrectCells = 0;
    let totalSolutionTrue = 0;
    let totalPlayerTrueCorrect = 0;
    let totalPlayerTrueIncorrect = 0;
    let totalPlayerFalseCorrect = 0;
    let totalPlayerFalseIncorrect = 0;

    const solutionMap = getFullSolutionMap(); // Get a map of all true/false solution states

    // Clear previous feedback
    document.querySelectorAll('.logic-grid td').forEach(cell => {
        cell.classList.remove('feedback-correct', 'feedback-incorrect');
    });

    for (const gridId in gridStates) {
        const [_, cat1, cat2] = gridId.split('-');
        for (const item1 in gridStates[gridId]) {
            for (const item2 in gridStates[gridId][item1]) {
                const playerState = gridStates[gridId][item1][item2];
                const solutionState = solutionMap[gridId]?.[item1]?.[item2] || 'UNKNOWN'; // Default to UNKNOWN if not in solution map

                const cell = document.querySelector(`td[data-cat1="${cat1}"][data-item1="${item1}"][data-cat2="${cat2}"][data-item2="${item2}"]`);
                if (!cell) continue;

                if (playerState === solutionState) {
                    totalCorrectCells++;
                    if (playerState !== 'UNKNOWN') { // Only mark if player made a decision
                        cell.classList.add('feedback-correct');
                    }
                    if (playerState === 'TRUE') totalPlayerTrueCorrect++;
                    if (playerState === 'FALSE') totalPlayerFalseCorrect++;
                } else {
                    totalIncorrectCells++;
                    if (playerState !== 'UNKNOWN') { // Only mark if player made a decision
                        cell.classList.add('feedback-incorrect');
                    }
                    if (playerState === 'TRUE') totalPlayerTrueIncorrect++;
                    if (playerState === 'FALSE') totalPlayerFalseIncorrect++;
                }
                if (solutionState === 'TRUE') totalSolutionTrue++;
            }
        }
    }

    let allTrueConnectionsFound = (totalPlayerTrueCorrect === totalSolutionTrue) && (totalPlayerTrueIncorrect === 0);
    let allFalseConnectionsCorrect = (totalPlayerFalseIncorrect === 0);

    if (totalIncorrectCells === 0 && allTrueConnectionsFound && allFalseConnectionsCorrect) {
        showFeedback('Congratulations, Chrono-Librarian! The paradox is resolved!', 'success');
        displaySolutionSummary(true);
        showSolutionOverlay();
    } else {
        showFeedback('Temporal anomaly detected. Your deductions are not yet aligned with history.', 'error');
        displaySolutionSummary(false, totalPlayerTrueCorrect, totalPlayerTrueIncorrect, totalPlayerFalseCorrect, totalPlayerFalseIncorrect);
    }
});

// Helper to get a comprehensive map of the full solution (TRUE/FALSE for all cells)
function getFullSolutionMap() {
    const solutionMap = {};
    const categories = Object.keys(gameData.categories);
    const gridPairs = [
        ['librarian', 'era'],
        ['librarian', 'device'],
        ['era', 'device']
    ];

    gridPairs.forEach(([cat1, cat2]) => {
        const gridId = `grid-${cat1}-${cat2}`;
        solutionMap[gridId] = {};

        gameData.categories[cat1].forEach(item1 => {
            solutionMap[gridId][item1] = {};
            gameData.categories[cat2].forEach(item2 => {
                let isTrue = false;
                // Check if item1 is true with item2
                if (gameData.solution[cat1][item1] && gameData.solution[cat1][item1][cat2] === item2) {
                    isTrue = true;
                }
                // Also check the reverse if categories are symmetric (e.g., era-device)
                if (!isTrue && gameData.solution[cat2][item2] && gameData.solution[cat2][item2][cat1] === item1) {
                    isTrue = true;
                }
                solutionMap[gridId][item1][item2] = isTrue ? 'TRUE' : 'FALSE';
            });
        });
    });
    return solutionMap;
}


// Display Solution Summary
function displaySolutionSummary(isSolved, correctTrue = 0, incorrectTrue = 0, correctFalse = 0, incorrectFalse = 0) {
    solutionSummary.innerHTML = '';
    solutionSummary.classList.remove('hidden');

    if (isSolved) {
        solutionSummary.innerHTML = '<h4>Solution Status: <span class="correct-feedback">All deductions are correct!</span></h4>';
    } else {
        let summaryHtml = '<h4>Solution Status:</h4>';
        summaryHtml += `<p>True Connections: <span class="${incorrectTrue > 0 ? 'incorrect-feedback' : 'correct-feedback'}">${correctTrue} Correct, ${incorrectTrue} Incorrect</span></p>`;
        summaryHtml += `<p>False Connections: <span class="${incorrectFalse > 0 ? 'incorrect-feedback' : 'correct-feedback'}">${correctFalse} Correct, ${incorrectFalse} Incorrect</span></p>`;
        summaryHtml += '<p>Review your connections and clues carefully.</p>';
        solutionSummary.innerHTML = summaryHtml;
    }
}

// Reset Puzzle
resetPuzzleBtn.addEventListener('click', () => {
    resetGame();
    showFeedback('', ''); // Clear feedback
    solutionSummary.classList.add('hidden'); // Hide summary
    updateProgressBar();
    hintText.classList.add('hidden');
    showHintBtn.textContent = `Show Hint (${MAX_HINTS - hintsUsed} left)`;
    showHintBtn.disabled = false;
});

// Helper to reset game state
function resetGame() {
    initializeGridStates(); // Reset all grid states to UNKNOWN
    renderGrids(); // Re-render grids to reflect UNKNOWN state
    hintsUsed = 0;
    clearHighlights();
    // Clear all feedback classes from cells
    document.querySelectorAll('.logic-grid td').forEach(cell => {
        cell.classList.remove('feedback-correct', 'feedback-incorrect', 'revealed-correct', 'revealed-incorrect', 'revealed-fixed');
    });
}

// Show Feedback Message
function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message hidden'; // Reset classes
    if (message) {
        feedbackMessage.classList.remove('hidden');
        feedbackMessage.classList.add(type);
    }
}

// Solution Overlay
function showSolutionOverlay() {
    const overlay = document.getElementById('solution-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');

    overlayTitle.textContent = 'Paradox Resolved!';
    overlayMessage.textContent = 'You have successfully restored the timeline. The Time Library is safe!';

    overlay.classList.add('show');

    closeOverlayBtn.onclick = () => {
        overlay.classList.remove('show');
        resetGame();
        showFeedback('', '');
        updateProgressBar();
        solutionSummary.classList.add('hidden');
    };
}

// Hint System
const hints = [
    "Consider the Librarian who was NOT in Ancient Egypt or using the Quantum Key. What does that tell you about their other connections?",
    "The Temporal Compass was used in Victorian London. This directly links an Era and a Device. Who couldn't have been there?",
    "Focus on Seraphina. Her incident was in the Future Metropolis. What device is left for her if she didn't use the Chronometer?"
];

showHintBtn.addEventListener('click', () => {
    if (hintsUsed < MAX_HINTS) {
        hintText.textContent = hints[hintsUsed];
        hintText.classList.remove('hidden');
        hintsUsed++;
        showHintBtn.textContent = `Show Hint (${MAX_HINTS - hintsUsed} left)`;
        if (hintsUsed === MAX_HINTS) {
            showHintBtn.disabled = true;
        }
    } else {
        showFeedback('No more hints available, Chrono-Librarian. Trust your deductions!', 'error');
    }
});

// Reveal Full Solution
revealSolutionBtn.addEventListener('click', () => {
    const solutionMap = getFullSolutionMap();
    let totalCells = 0;
    let playerCorrectBeforeReveal = 0;

    for (const gridId in gridStates) {
        const [_, cat1, cat2] = gridId.split('-');
        for (const item1 in gridStates[gridId]) {
            for (const item2 in gridStates[gridId][item1]) {
                totalCells++;
                const playerState = gridStates[gridId][item1][item2];
                const solutionState = solutionMap[gridId][item1][item2];

                const cell = document.querySelector(`td[data-cat1="${cat1}"][data-item1="${item1}"][data-cat2="${cat2}"][data-item2="${item2}"]`);
                if (!cell) continue;

                // Apply solution state
                gridStates[gridId][item1][item2] = solutionState;
                cell.className = ''; // Clear existing classes
                cell.classList.add(`state-${solutionState.toLowerCase()}`);
                cell.innerHTML = getCellIcon(solutionState);

                // Add feedback classes based on player's previous state
                if (playerState === solutionState && playerState !== 'UNKNOWN') {
                    cell.classList.add('revealed-fixed'); // Player had this correct
                    playerCorrectBeforeReveal++;
                } else if (playerState !== 'UNKNOWN' && playerState !== solutionState) {
                    cell.classList.add('revealed-incorrect'); // Player had this incorrect
                } else {
                    cell.classList.add('revealed-correct'); // Solution revealed, player had UNKNOWN or correct UNKNOWN
                }
            }
        }
    }

    showFeedback('Full solution revealed. Analyze the timeline!', 'info');
    solutionSummary.classList.add('hidden'); // Hide summary when full solution is revealed
    updateProgressBar(); // Update progress bar to 100%
});
