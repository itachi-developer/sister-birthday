// ==========================================
// --- SISTEMA DI VITTORIA GLOBALE ---
// ==========================================
let hasWonTris = false;
let hasWonSnake = false; // Si vince a 50 punti
let hasWonPong = false;  // Si vince a 3 punti
let bannerShown = false;

// ==========================================
// --- SISTEMA SALVATAGGIO RECORD (LocalStorage) ---
// ==========================================
let highScores = {
    tris: parseInt(localStorage.getItem('trisWins')) || 0,
    snake: parseInt(localStorage.getItem('snakeHighScore')) || 0,
    pong: parseInt(localStorage.getItem('pongHighScore')) || 0
};

// Mostra subito i record salvati
document.getElementById('tris-wins').innerText = highScores.tris;
document.getElementById('snake-highscore').innerText = highScores.snake;
document.getElementById('pong-highscore').innerText = highScores.pong;

// Tasto rapido dalla Home alla Playlist
document.getElementById('go-to-music').addEventListener('click', () => {
    document.querySelector('.nav-item[data-target="musica"]').click();
});

function checkUltimateWin() {
    if (hasWonTris && hasWonSnake && hasWonPong && !bannerShown) {
        bannerShown = true;
        document.getElementById('ultimate-banner').classList.add('show');
        confetti({ particleCount: 200, spread: 160, origin: { y: 0.4 } });
    }
}

document.getElementById('close-banner').addEventListener('click', () => {
    document.getElementById('ultimate-banner').classList.remove('show');
});


// ==========================================
// --- NAVIGAZIONE ---
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
let isSnakeActive = false;
let isPongActive = false;

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));
        
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        // Gestione stati dei giochi
        isSnakeActive = (target === 'snake');
        isPongActive = (target === 'pong');

        if(isSnakeActive) resetSnake();
        if(isPongActive) resetPong();
    });
});

// ==========================================
// --- TRIS LOGIC ---
// ==========================================
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('tris-status');
const btnResetTris = document.getElementById('reset-tris');
let board = ['', '', '', '', '', '', '', '', ''];
let isTrisActive = true;
let currentPlayer = 'sorella'; 

const imgSorella = 'assets/faccia_sorella.jpg'; // CONTROLLA IL NOME!
const imgTu = 'assets/faccia_mia.jpg';          // CONTROLLA IL NOME!

const winCond = [ [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6] ];

cells.forEach(cell => cell.addEventListener('click', (e) => {
    const index = e.target.closest('.cell').getAttribute('data-index');
    if (board[index] !== '' || !isTrisActive) return;

    board[index] = currentPlayer;
    e.target.closest('.cell').innerHTML = `<img src="${currentPlayer === 'sorella' ? imgSorella : imgTu}" alt="faccia">`;
    
    let roundWon = winCond.some(combo => board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[0]] === board[combo[2]]);
    
    if (roundWon) {
    status.innerText = `Ha vinto ${currentPlayer === 'sorella' ? 'la festeggiata!' : 'il fratello!'}`;
    isTrisActive = false;
    hasWonTris = true; 
    checkUltimateWin();
    confetti();

    // AGGIUNGI QUESTO: Salva vittoria
    if(currentPlayer === 'sorella') {
        highScores.tris++;
        localStorage.setItem('trisWins', highScores.tris);
        document.getElementById('tris-wins').innerText = highScores.tris;
    }
    return;
}
    if (!board.includes('')) { status.innerText = 'Pareggio!'; isTrisActive = false; return; }

    currentPlayer = currentPlayer === 'sorella' ? 'tu' : 'sorella';
    status.innerText = currentPlayer === 'sorella' ? 'Tocca a te!' : 'Tocca a me!';
}));

btnResetTris.addEventListener('click', () => {
    board = ['', '', '', '', '', '', '', '', ''];
    isTrisActive = true; currentPlayer = 'sorella';
    status.innerText = 'Tocca a te!';
    cells.forEach(cell => cell.innerHTML = '');
});

// ==========================================
// --- SNAKE LOGIC (Ottimizzato) ---
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gridSize = 14; const tileCount = 20;

let snake = []; let dx = 0; let dy = 0; let foodX, foodY, score = 0;
let lastSnakeTime = 0;

const headImg = new Image(); headImg.src = imgSorella;
const foodEmojis = ['🎂', '🎁', '🍕', '🎉']; let currentFoodEmoji = foodEmojis[0];

function resetSnake() {
    snake = [{ x: 10, y: 10 }]; dx = 0; dy = 0; score = 0;
    scoreElement.innerText = score; placeFood();
    window.requestAnimationFrame(snakeLoop);
}

function snakeLoop(timestamp) {
    if (!isSnakeActive) return;
    window.requestAnimationFrame(snakeLoop);
    
    // Controlla la velocità (circa 150ms)
    if (timestamp - lastSnakeTime < 150) return;
    lastSnakeTime = timestamp;

    updateSnake();
    drawSnake();
}

function updateSnake() {
    if (dx === 0 && dy === 0) return;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Muri o corpo (Sconfitta)
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(p => p.x === head.x && p.y === head.y)) {
        resetSnake(); return;
    }
    
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
    score += 10; scoreElement.innerText = score;

    // AGGIUNGI QUESTO: Salva Record Snake
    if(score > highScores.snake) {
        highScores.snake = score;
        localStorage.setItem('snakeHighScore', highScores.snake);
        document.getElementById('snake-highscore').innerText = highScores.snake;
    }

    if (score >= 50 && !hasWonSnake) { hasWonSnake = true; checkUltimateWin(); }
    placeFood();
}
        if (score >= 50 && !hasWonSnake) { // REQUISITO SNAKE RAGGIUNTO!
            hasWonSnake = true; checkUltimateWin();
        }
        placeFood();
    } else { snake.pop(); }
}

function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px Arial"; ctx.fillText(currentFoodEmoji, foodX * gridSize, foodY * gridSize + 12);
    snake.forEach((part, i) => {
        if (i === 0) ctx.drawImage(headImg, part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        else { ctx.fillStyle = '#fbc2eb'; ctx.beginPath(); ctx.arc(part.x*gridSize+gridSize/2, part.y*gridSize+gridSize/2, gridSize/2.2, 0, Math.PI*2); ctx.fill(); }
    });
}
function placeFood() { foodX = Math.floor(Math.random() * tileCount); foodY = Math.floor(Math.random() * tileCount); currentFoodEmoji = foodEmojis[Math.floor(Math.random()*foodEmojis.length)]; }

function changeDirection(newDx, newDy) {
    if (dx === 0 && dy === 0) { dx = newDx; dy = newDy; return; }
    if (dx !== 0 && newDx !== 0) return; if (dy !== 0 && newDy !== 0) return;
    dx = newDx; dy = newDy;
}
document.addEventListener('keydown', (e) => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) e.preventDefault();
    if (e.key === 'ArrowUp') changeDirection(0, -1); if (e.key === 'ArrowDown') changeDirection(0, 1);
    if (e.key === 'ArrowLeft') changeDirection(-1, 0); if (e.key === 'ArrowRight') changeDirection(1, 0);
});
['click', 'touchstart'].forEach(evt => {
    document.getElementById('up').addEventListener(evt, e => { e.preventDefault(); changeDirection(0,-1); });
    document.getElementById('down').addEventListener(evt, e => { e.preventDefault(); changeDirection(0,1); });
    document.getElementById('left').addEventListener(evt, e => { e.preventDefault(); changeDirection(-1,0); });
    document.getElementById('right').addEventListener(evt, e => { e.preventDefault(); changeDirection(1,0); });
});


// ==========================================
// --- PONG LOGIC (Aggiornato con Start/Pausa, Record e Faccia) ---
// ==========================================
const pongCanvas = document.getElementById('pongCanvas'); const pongCtx = pongCanvas.getContext('2d');
const pScoreEl = document.getElementById('pong-score-player'); const cScoreEl = document.getElementById('pong-score-cpu');
const btnPongPause = document.getElementById('btn-pong-pause');

// Pallina più grande per far vedere la faccia
const ball = { x: 140, y: 175, r: 12, dx: 0, dy: 0 };
const pw = 60; const ph = 10;
const player = { x: 110, y: 330, score: 0 }; 
const cpu = { x: 110, y: 10, score: 0 };
let pongPaused = true; // All'inizio è fermo, aspetta lo Start

// Bottone Start / Pausa
btnPongPause.addEventListener('click', () => {
    pongPaused = !pongPaused;
    btnPongPause.innerHTML = pongPaused ? '<i class="fa-solid fa-play"></i> Start' : '<i class="fa-solid fa-pause"></i> Pausa';
    
    // Se era fermo a centro campo senza velocità, fagli iniziare il movimento
    if (!pongPaused && ball.dx === 0 && ball.dy === 0) {
        ball.dy = 4;
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
});

function movePaddle(e) {
    if (!isPongActive) return;
    let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    let newX = clientX - pongCanvas.getBoundingClientRect().left - pw / 2;
    player.x = Math.max(0, Math.min(newX, pongCanvas.width - pw));
}
pongCanvas.addEventListener('touchmove', e => { e.preventDefault(); movePaddle(e); }, {passive: false});
pongCanvas.addEventListener('mousemove', movePaddle);

function resetPong() {
    player.score = 0; cpu.score = 0; pScoreEl.innerText = '0'; cScoreEl.innerText = '0';
    pongPaused = true;
    btnPongPause.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    resetBall();
    window.requestAnimationFrame(pongLoop);
}

function resetBall() {
    ball.x = pongCanvas.width / 2; ball.y = pongCanvas.height / 2;
    ball.dx = 0; ball.dy = 0; // Ferma in attesa di Start
    pongPaused = true;
    btnPongPause.innerHTML = '<i class="fa-solid fa-play"></i> Start';
}

function pongLoop() {
    if (!isPongActive) return;
    updatePong();
    drawPong();
    window.requestAnimationFrame(pongLoop);
}

function updatePong() {
    // La CPU cerca di riposizionarsi al centro se il gioco è in pausa, altrimenti insegue la palla
    let targetX = pongPaused ? (pongCanvas.width/2 - pw/2) : (ball.x - pw/2);
    cpu.x += (targetX - cpu.x) * 0.1;
    cpu.x = Math.max(0, Math.min(cpu.x, pongCanvas.width - pw));

    if (pongPaused) return; 

    ball.x += ball.dx; ball.y += ball.dy;

    // Rimbalzi sui muri laterali
    if (ball.x - ball.r < 0 || ball.x + ball.r > pongCanvas.width) ball.dx = -ball.dx;

    // Punti
    if (ball.y - ball.r < 0) {
        player.score++; pScoreEl.innerText = player.score;
        
        // Salvataggio Record Pong
        if(player.score > highScores.pong) {
            highScores.pong = player.score;
            localStorage.setItem('pongHighScore', highScores.pong);
            document.getElementById('pong-highscore').innerText = highScores.pong;
        }

        if(player.score >= 3 && !hasWonPong) { hasWonPong = true; checkUltimateWin(); }
        confetti(); resetBall();
    } else if (ball.y + ball.r > pongCanvas.height) {
        cpu.score++; cScoreEl.innerText = cpu.score; resetBall();
    }

    // Collisioni Barrette (Effetto curva)
    if (ball.y + ball.r > player.y && ball.x > player.x && ball.x < player.x + pw) {
        ball.dy = -Math.abs(ball.dy); ball.dx = (ball.x - (player.x + pw/2)) * 0.15;
    }
    if (ball.y - ball.r < cpu.y + ph && ball.x > cpu.x && ball.x < cpu.x + pw) {
        ball.dy = Math.abs(ball.dy); ball.dx = (ball.x - (cpu.x + pw/2)) * 0.15;
    }
}

function drawPong() {
    pongCtx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
    
    // Rete
    pongCtx.setLineDash([10, 10]); pongCtx.beginPath(); pongCtx.moveTo(0, pongCanvas.height/2); pongCtx.lineTo(pongCanvas.width, pongCanvas.height/2);
    pongCtx.strokeStyle = 'rgba(0,0,0,0.1)'; pongCtx.stroke(); pongCtx.setLineDash([]);
    
    // Barrette
    pongCtx.fillStyle = '#fbc2eb'; pongCtx.beginPath(); pongCtx.roundRect(player.x, player.y, pw, ph, 5); pongCtx.fill();
    pongCtx.fillStyle = '#a6c1ee'; pongCtx.beginPath(); pongCtx.roundRect(cpu.x, cpu.y, pw, ph, 5); pongCtx.fill();
    
    // DISEGNO DELLA PALLINA COME FACCIA
    pongCtx.save();
    pongCtx.beginPath();
    pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true); // Crea un percorso circolare
    pongCtx.closePath();
    pongCtx.clip(); // Ritaglia l'immagine successiva dentro a questo cerchio
    
    // headImg è già definita in Snake e contiene la faccia di tua sorella!
    pongCtx.drawImage(headImg, ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2); 
    
    // Bordo della pallina (Opzionale, rende l'immagine più staccata dallo sfondo)
    pongCtx.beginPath();
    pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true);
    pongCtx.strokeStyle = '#fff';
    pongCtx.lineWidth = 2;
    pongCtx.stroke();
    
    pongCtx.restore();
}
