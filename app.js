// --- NAVIGAZIONE ---
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));
        
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        // Gestione giochi attivi
        if(target === 'snake') {
            resetSnake();
            isPongActive = false; // Mette in pausa Pong
        } else if (target === 'pong') {
            resetPong();
            clearInterval(gameInterval); // Mette in pausa Snake
        } else {
            clearInterval(gameInterval); // Mette in pausa tutto se sei in Home/Musica
            isPongActive = false;
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
const imgSorella = 'assets/faccia_sorella.jpg'; 
const imgTu = 'assets/faccia_mia.jpg';

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

// --- CONTROLLI SNAKE UNIVERSALI (PC + MOBILE) ---

// Funzione per cambiare direzione in sicurezza (evita di tornare indietro su se stessi)
function changeDirection(newDx, newDy) {
    // Se non si sta muovendo, partiamo subito
    if (dx === 0 && dy === 0) {
        dx = newDx; dy = newDy; return;
    }
    // Evita l'inversione a U sull'asse X
    if (dx !== 0 && newDx !== 0) return; 
    // Evita l'inversione a U sull'asse Y
    if (dy !== 0 && newDy !== 0) return;
    
    dx = newDx;
    dy = newDy;
}

// 1. Controlli per Tastiera (se la testa da PC)
document.addEventListener('keydown', (e) => {
    // Impedisce alla pagina di scrollare quando si usano le frecce
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    
    if (e.key === 'ArrowUp') changeDirection(0, -1);
    if (e.key === 'ArrowDown') changeDirection(0, 1);
    if (e.key === 'ArrowLeft') changeDirection(-1, 0);
    if (e.key === 'ArrowRight') changeDirection(1, 0);
});

// 2. Controlli per Bottoni a schermo (Mouse Click + Touch su Mobile)
const btnUp = document.getElementById('up');
const btnDown = document.getElementById('down');
const btnLeft = document.getElementById('left');
const btnRight = document.getElementById('right');

['click', 'touchstart'].forEach(eventType => {
    btnUp.addEventListener(eventType, (e) => { e.preventDefault(); changeDirection(0, -1); });
    btnDown.addEventListener(eventType, (e) => { e.preventDefault(); changeDirection(0, 1); });
    btnLeft.addEventListener(eventType, (e) => { e.preventDefault(); changeDirection(-1, 0); });
    btnRight.addEventListener(eventType, (e) => { e.preventDefault(); changeDirection(1, 0); });
});

// --- PWA: REGISTRAZIONE SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Registrato!"))
    .catch(err => console.error("Errore SW:", err));
}

// ==========================================
// --- PONG LOGIC ---
// ==========================================
const pongCanvas = document.getElementById('pongCanvas');
const pongCtx = pongCanvas.getContext('2d');
const playerPongScore = document.getElementById('pong-score-player');
const cpuPongScore = document.getElementById('pong-score-cpu');

let pongInterval;
let isPongActive = false;

// Variabili del gioco
const ball = { x: 140, y: 175, r: 8, dx: 3, dy: 4, speed: 4 };
const paddleWidth = 60;
const paddleHeight = 10;
const player = { x: 110, y: 330, score: 0 }; // Barra rosa (in basso)
const cpu = { x: 110, y: 10, score: 0 };     // Barra blu (in alto)

// --- CONTROLLI PONG (Touch e Mouse) ---
function movePaddle(e) {
    if (!isPongActive) return;
    const rect = pongCanvas.getBoundingClientRect();
    let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    let touchX = clientX - rect.left;
    
    // Mantiene la barra dentro il campo
    let newX = touchX - paddleWidth / 2;
    if (newX < 0) newX = 0;
    if (newX + paddleWidth > pongCanvas.width) newX = pongCanvas.width - paddleWidth;
    
    player.x = newX;
}

pongCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); movePaddle(e); }, {passive: false});
pongCanvas.addEventListener('mousemove', movePaddle);

// --- FUNZIONI DI GIOCO ---
function resetPong() {
    player.score = 0; cpu.score = 0;
    updatePongScore();
    resetBall();
    isPongActive = true;
    clearInterval(pongInterval);
    pongInterval = setInterval(updatePong, 1000/60); // 60 FPS
}

function resetBall() {
    ball.x = pongCanvas.width / 2;
    ball.y = pongCanvas.height / 2;
    ball.dy = -ball.dy; // Cambia direzione
    ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function updatePongScore() {
    playerPongScore.innerText = player.score;
    cpuPongScore.innerText = cpu.score;
}

function updatePong() {
    if(!isPongActive) return;

    // Intelligenza Artificiale (CPU)
    // Insegue la palla ma con un leggero ritardo (0.1) per non renderla imbattibile
    cpu.x += ((ball.x - (cpu.x + paddleWidth/2))) * 0.1;
    if (cpu.x < 0) cpu.x = 0;
    if (cpu.x + paddleWidth > pongCanvas.width) cpu.x = pongCanvas.width - paddleWidth;

    // Muove la palla
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collisione con i muri laterali
    if(ball.x - ball.r < 0 || ball.x + ball.r > pongCanvas.width) {
        ball.dx = -ball.dx;
    }

    // Punto Segnato (top/bottom)
    if(ball.y - ball.r < 0) {
        player.score++; updatePongScore(); resetBall(); confetti();
    } else if(ball.y + ball.r > pongCanvas.height) {
        cpu.score++; updatePongScore(); resetBall();
    }

    // Collisione con la Barra GIOCATORE (in basso)
    if(ball.y + ball.r > player.y && ball.x > player.x && ball.x < player.x + paddleWidth) {
        ball.dy = -Math.abs(ball.dy); // Forza verso l'alto
        // Aggiunge un po' di effetto (angolo) in base a dove colpisce la barra
        ball.dx = (ball.x - (player.x + paddleWidth/2)) * 0.15;
    }
    
    // Collisione con la Barra CPU (in alto)
    if(ball.y - ball.r < cpu.y + paddleHeight && ball.x > cpu.x && ball.x < cpu.x + paddleWidth) {
        ball.dy = Math.abs(ball.dy); // Forza verso il basso
        ball.dx = (ball.x - (cpu.x + paddleWidth/2)) * 0.15;
    }

    drawPong();
}

function drawPong() {
    // Sfondo del campo (Trasparente con effetto vetro)
    pongCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    pongCtx.fillRect(0, 0, pongCanvas.width, pongCanvas.height);
    
    // Rete centrale
    pongCtx.setLineDash([10, 10]);
    pongCtx.beginPath();
    pongCtx.moveTo(0, pongCanvas.height/2);
    pongCtx.lineTo(pongCanvas.width, pongCanvas.height/2);
    pongCtx.strokeStyle = 'rgba(0,0,0,0.1)';
    pongCtx.stroke();
    pongCtx.setLineDash([]); // Resetta

    // Barra Giocatore (Rosa, usa il colore del tema)
    pongCtx.fillStyle = '#fbc2eb';
    pongCtx.beginPath();
    pongCtx.roundRect(player.x, player.y, paddleWidth, paddleHeight, 5); // Bordi arrotondati
    pongCtx.fill();

    // Barra CPU (Azzurra)
    pongCtx.fillStyle = '#a6c1ee';
    pongCtx.beginPath();
    pongCtx.roundRect(cpu.x, cpu.y, paddleWidth, paddleHeight, 5);
    pongCtx.fill();

    // Pallina
    pongCtx.fillStyle = '#5a5a5a';
    pongCtx.beginPath();
    pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    pongCtx.fill();
}
