// ==========================================
// --- SISTEMA DI VITTORIA GLOBALE ---
// ==========================================
let hasWonTris = false;
let hasWonSnake = false; // Si vince a 50 punti
let hasWonPong = false;  // Si vince a 3 punti
let bannerShown = false;

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
        hasWonTris = true; // REQUISITO TRIS RAGGIUNTO!
        checkUltimateWin();
        confetti();
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
// --- PONG LOGIC (Ottimizzato con pausa) ---
// ==========================================
const pongCanvas = document.getElementById('pongCanvas'); const pongCtx = pongCanvas.getContext('2d');
const pScoreEl = document.getElementById('pong-score-player'); const cScoreEl = document.getElementById('pong-score-cpu');

const ball = { x: 140, y: 175, r: 8, dx: 0, dy: 0, speed: 5 };
const pw = 60; const ph = 10;
const player = { x: 110, y: 330, score: 0 }; 
const cpu = { x: 110, y: 10, score: 0 };
let pongPaused = false; // Variabile per la pausa di 1 sec

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
    resetBall(true);
    window.requestAnimationFrame(pongLoop);
}

function resetBall(firstStart = false) {
    ball.x = pongCanvas.width / 2; ball.y = pongCanvas.height / 2;
    ball.dx = 0; ball.dy = 0; // Palla ferma
    pongPaused = true;
    
    // Pausa di 1 secondo prima di far partire la palla
    setTimeout(() => {
        if(!isPongActive) return;
        ball.dy = firstStart ? 4 : (Math.random() > 0.5 ? 4 : -4);
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        pongPaused = false;
    }, 1000);
}

function pongLoop() {
    if (!isPongActive) return;
    updatePong();
    drawPong();
    window.requestAnimationFrame(pongLoop); // FPS sbloccati (60fps)
}

function updatePong() {
    // La CPU e il Giocatore possono muoversi anche in pausa
    cpu.x += ((ball.x - (cpu.x + pw/2))) * 0.1;
    cpu.x = Math.max(0, Math.min(cpu.x, pongCanvas.width - pw));

    if (pongPaused) return; // Ferma solo la palla in pausa

    ball.x += ball.dx; ball.y += ball.dy;

    if (ball.x - ball.r < 0 || ball.x + ball.r > pongCanvas.width) ball.dx = -ball.dx;

    // Punti
    if (ball.y - ball.r < 0) {
        player.score++; pScoreEl.innerText = player.score;
        if(player.score >= 3 && !hasWonPong) { // REQUISITO PONG RAGGIUNTO!
            hasWonPong = true; checkUltimateWin();
        }
        confetti(); resetBall();
    } else if (ball.y + ball.r > pongCanvas.height) {
        cpu.score++; cScoreEl.innerText = cpu.score; resetBall();
    }

    // Collisioni Barrette
    if (ball.y + ball.r > player.y && ball.x > player.x && ball.x < player.x + pw) {
        ball.dy = -Math.abs(ball.dy); ball.dx = (ball.x - (player.x + pw/2)) * 0.15;
    }
    if (ball.y - ball.r < cpu.y + ph && ball.x > cpu.x && ball.x < cpu.x + pw) {
        ball.dy = Math.abs(ball.dy); ball.dx = (ball.x - (cpu.x + pw/2)) * 0.15;
    }
}

function drawPong() {
    pongCtx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
    pongCtx.setLineDash([10, 10]); pongCtx.beginPath(); pongCtx.moveTo(0, pongCanvas.height/2); pongCtx.lineTo(pongCanvas.width, pongCanvas.height/2);
    pongCtx.strokeStyle = 'rgba(0,0,0,0.1)'; pongCtx.stroke(); pongCtx.setLineDash([]);
    pongCtx.fillStyle = '#fbc2eb'; pongCtx.beginPath(); pongCtx.roundRect(player.x, player.y, pw, ph, 5); pongCtx.fill();
    pongCtx.fillStyle = '#a6c1ee'; pongCtx.beginPath(); pongCtx.roundRect(cpu.x, cpu.y, pw, ph, 5); pongCtx.fill();
    pongCtx.fillStyle = '#5a5a5a'; pongCtx.beginPath(); pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); pongCtx.fill();
}
