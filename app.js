// --- NAVIGAZIONE ---
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Rimuovi active da tutti
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));
        
        // Aggiungi active al cliccato
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        // Se apriamo lo snake, avvia o fai un reset
        if(target === 'snake') {
            resetSnake();
        }
    });
});

// --- TRIS LOGIC ---
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('tris-status');
const btnResetTris = document.getElementById('reset-tris');

let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let currentPlayer = 'sorella'; // o 'tu'

// PERCORSI DELLE IMMAGINI 
const imgSorella = 'assets/faccia-sorella.jpg'; 
const imgTu = 'assets/faccia-mia.png';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Righe
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonne
    [0, 4, 8], [2, 4, 6]             // Diagonali
];

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
btnResetTris.addEventListener('click', resetTris);

function handleCellClick(e) {
    const cell = e.target.closest('.cell');
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !isGameActive) return;

    board[index] = currentPlayer;
    cell.innerHTML = `<img src="${currentPlayer === 'sorella' ? imgSorella : imgTu}" alt="faccia">`;
    
    checkWin();
}

function checkWin() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        status.innerText = `Ha vinto ${currentPlayer === 'sorella' ? 'la festeggiata!' : 'il fratello!'}`;
        isGameActive = false;
        confetti(); // Lancia i coriandoli!
        return;
    }

    if (!board.includes('')) {
        status.innerText = 'Pareggio!';
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'sorella' ? 'tu' : 'sorella';
    status.innerText = currentPlayer === 'sorella' ? 'Tocca a te!' : 'Tocca a me!';
}

function resetTris() {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'sorella';
    status.innerText = 'Tocca a te!';
    cells.forEach(cell => cell.innerHTML = '');
}

// --- SNAKE LOGIC ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 15;
const tileCount = canvas.width / gridSize;

let snake = [];
let dx = 0;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let gameInterval;

const headImg = new Image();
headImg.src = imgSorella; // Usa la sua faccia per il serpente!

const foodEmojis = ['🎂', '🎁', '🍕', '🎉'];
let currentFoodEmoji = foodEmojis[0];

function resetSnake() {
    snake = [{ x: 10, y: 10 }];
    dx = 0; dy = 0;
    score = 0;
    scoreElement.innerText = score;
    placeFood();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 150); // Velocità del gioco
}

function gameLoop() {
    updateSnake();
    if (checkCollision()) {
        resetSnake();
        return;
    }
    drawSnake();
}

function updateSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    // Fermo all'inizio
    if(dx === 0 && dy === 0) return;

    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.innerText = score;
        placeFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    // Sfondo
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cibo (Emoji)
    ctx.font = "15px Arial";
    ctx.fillText(currentFoodEmoji, foodX * gridSize, foodY * gridSize + 12);

    // Serpente
    snake.forEach((part, index) => {
        if (index === 0) {
            // Disegna la faccia per la testa
            ctx.drawImage(headImg, part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        } else {
            // Corpo del serpente
            ctx.fillStyle = '#ff9a9e';
            ctx.beginPath();
            ctx.arc(part.x * gridSize + gridSize/2, part.y * gridSize + gridSize/2, gridSize/2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    currentFoodEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
}

function checkCollision() {
    const head = snake[0];
    // Muri
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    // Corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

// Controlli Mobile
document.getElementById('up').addEventListener('touchstart', (e) => { e.preventDefault(); if (dy === 0) { dx = 0; dy = -1; }});
document.getElementById('down').addEventListener('touchstart', (e) => { e.preventDefault(); if (dy === 0) { dx = 0; dy = 1; }});
document.getElementById('left').addEventListener('touchstart', (e) => { e.preventDefault(); if (dx === 0) { dx = -1; dy = 0; }});
document.getElementById('right').addEventListener('touchstart', (e) => { e.preventDefault(); if (dx === 0) { dx = 1; dy = 0; }});


// --- PWA: REGISTRAZIONE SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Registrato!"))
    .catch(err => console.error("Errore SW:", err));
}
