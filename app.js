// ==========================================
// 1. CONFIGURAZIONE FILE E RECORD
// ==========================================
const imgSorella = 'assets/faccia_sorella.jpg'; 
const imgTu = 'assets/faccia_mia.jpg';

let highScores = {
    tris: parseInt(localStorage.getItem('trisWins')) || 0,
    navale: parseInt(localStorage.getItem('navaleWins')) || 0,
    snake: parseInt(localStorage.getItem('snakeHighScore')) || 0,
    pong: parseInt(localStorage.getItem('pongHighScore')) || 0
};

document.getElementById('tris-wins').innerText = highScores.tris;
document.getElementById('navale-wins').innerText = highScores.navale;
document.getElementById('snake-highscore').innerText = highScores.snake;
document.getElementById('pong-highscore').innerText = highScores.pong;

// ==========================================
// 2. SISTEMA VITTORIA GLOBALE
// ==========================================
let hasWonTris = false;
let hasWonNavale = false;
let hasWonSnake = false; 
let hasWonPong = false;  
let bannerShown = false;

function checkUltimateWin() {
    if (hasWonTris && hasWonNavale && hasWonSnake && hasWonPong && !bannerShown) {
        bannerShown = true;
        document.getElementById('ultimate-banner').classList.add('show');
        confetti({ particleCount: 200, spread: 160, origin: { y: 0.4 } });
    }
}
document.getElementById('close-banner').addEventListener('click', () => {
    document.getElementById('ultimate-banner').classList.remove('show');
});

// ==========================================
// 3. NAVIGAZIONE
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
let isSnakeActive = false;
let isPongActive = false;

document.getElementById('go-to-music').addEventListener('click', () => {
    document.querySelector('.nav-item[data-target="musica"]').click();
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));
        
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        isSnakeActive = (target === 'snake');
        isPongActive = (target === 'pong');

        if(isSnakeActive) resetSnake();
        if(isPongActive) resetPong();
    });
});

// ==========================================
// 4. TRIS
// ==========================================
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('tris-status');
let board = ['', '', '', '', '', '', '', '', ''];
let isTrisActive = true;
let currentPlayer = 'sorella'; 
const winCond = [ [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6] ];

cells.forEach(cell => cell.addEventListener('click', (e) => {
    const index = e.target.closest('.cell').getAttribute('data-index');
    if (board[index] !== '' || !isTrisActive) return;

    board[index] = currentPlayer;
    e.target.closest('.cell').innerHTML = `<img src="${currentPlayer === 'sorella' ? imgSorella : imgTu}">`;
    
    let roundWon = winCond.some(combo => board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[0]] === board[combo[2]]);
    
    if (roundWon) {
        statusText.innerText = `Ha vinto ${currentPlayer === 'sorella' ? 'la festeggiata!' : 'il fratello!'}`;
        isTrisActive = false; hasWonTris = true; checkUltimateWin(); confetti();
        
        if(currentPlayer === 'sorella') {
            highScores.tris++; localStorage.setItem('trisWins', highScores.tris);
            document.getElementById('tris-wins').innerText = highScores.tris;
        }
        return;
    }
    if (!board.includes('')) { statusText.innerText = 'Pareggio!'; isTrisActive = false; return; }

    currentPlayer = currentPlayer === 'sorella' ? 'tu' : 'sorella';
    statusText.innerText = currentPlayer === 'sorella' ? 'Tocca a te!' : 'Tocca a me!';
}));

document.getElementById('reset-tris').addEventListener('click', () => {
    board = ['', '', '', '', '', '', '', '', ''];
    isTrisActive = true; currentPlayer = 'sorella'; statusText.innerText = 'Tocca a te!';
    cells.forEach(cell => cell.innerHTML = '');
});


// ==========================================
// 5. BATTAGLIA NAVALE
// ==========================================
let p1Grid = [], p2Grid = [], p1Rev = [], p2Rev = [];
let turnNavale = 'sorella';
let navaleHits1 = 0, navaleHits2 = 0;
let isNavaleActive = false;
const navaleShips = [3, 2, 2]; // 3 Navi: Lunghezze 3, 2 e 2. Totale 7 hit.

function initNavale() {
    p1Grid = Array(36).fill(0); p2Grid = Array(36).fill(0);
    p1Rev = Array(36).fill(false); p2Rev = Array(36).fill(false);
    placeShips(p1Grid); placeShips(p2Grid);
    turnNavale = 'sorella'; navaleHits1 = 0; navaleHits2 = 0;
    isNavaleActive = true;
    document.getElementById('navale-status').innerText = 'Tocca a Sorella (Colpisci le navi del Fratello!)';
    renderNavaleBoard();
}

function placeShips(grid) {
    navaleShips.forEach(len => {
        let placed = false;
        while(!placed) {
            let isHoriz = Math.random() > 0.5;
            let start = Math.floor(Math.random() * 36);
            let x = start % 6; let y = Math.floor(start / 6);
            if (isHoriz && x + len > 6) continue;
            if (!isHoriz && y + len > 6) continue;

            let valid = true;
            for(let i=0; i<len; i++) {
                let idx = isHoriz ? start + i : start + (i * 6);
                if (grid[idx] !== 0) valid = false;
            }
            if (valid) {
                for(let i=0; i<len; i++) grid[isHoriz ? start + i : start + (i * 6)] = 1;
                placed = true;
            }
        }
    });
}

function renderNavaleBoard() {
    const board = document.getElementById('board-navale');
    board.innerHTML = '';
    let currentGrid = turnNavale === 'sorella' ? p2Grid : p1Grid; // Vedi la griglia avversaria
    let currentRev = turnNavale === 'sorella' ? p2Rev : p1Rev;

    for(let i=0; i<36; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell-navale';
        if (currentRev[i]) {
            if (currentGrid[i] === 1) {
                // COLPO (Mostra faccia avversario)
                cell.innerHTML = `<img src="${turnNavale === 'sorella' ? imgTu : imgSorella}">`;
                cell.style.background = '#ff9a9e';
            } else {
                // ACQUA
                cell.innerText = '💧';
                cell.classList.add('miss');
            }
        } else {
            cell.addEventListener('click', () => handleNavaleClick(i));
        }
        board.appendChild(cell);
    }
}

function handleNavaleClick(idx) {
    if (!isNavaleActive) return;
    let currentGrid = turnNavale === 'sorella' ? p2Grid : p1Grid;
    let currentRev = turnNavale === 'sorella' ? p2Rev : p1Rev;
    
    currentRev[idx] = true;
    renderNavaleBoard();

    let isHit = currentGrid[idx] === 1;
    if (isHit) {
        if (turnNavale === 'sorella') navaleHits1++; else navaleHits2++;
        if (navaleHits1 === 7 || navaleHits2 === 7) {
            document.getElementById('navale-status').innerText = `Ha vinto ${turnNavale === 'sorella' ? 'la festeggiata!' : 'il fratello!'}`;
            isNavaleActive = false; confetti();
            if(turnNavale === 'sorella') {
                highScores.navale++; localStorage.setItem('navaleWins', highScores.navale);
                document.getElementById('navale-wins').innerText = highScores.navale;
                if(!hasWonNavale) { hasWonNavale = true; checkUltimateWin(); }
            }
            return;
        }
    }

    // Passaggio Turno
    setTimeout(() => {
        if(!isNavaleActive) return;
        turnNavale = turnNavale === 'sorella' ? 'tu' : 'sorella';
        document.getElementById('navale-overlay-text').innerText = turnNavale === 'sorella' ? "Passa a Sorella!" : "Passa al Fratello!";
        document.getElementById('navale-overlay').style.display = 'flex';
    }, 800); // Piccola pausa per far vedere cosa ha colpito
}

document.getElementById('btn-navale-ready').addEventListener('click', () => {
    document.getElementById('navale-overlay').style.display = 'none';
    document.getElementById('navale-status').innerText = turnNavale === 'sorella' ? 'Tocca a Sorella (Colpisci le navi del Fratello!)' : 'Tocca al Fratello (Colpisci le navi di Sorella!)';
    renderNavaleBoard();
});
document.getElementById('reset-navale').addEventListener('click', initNavale);
initNavale(); // Inizializza al caricamento


// ==========================================
// 6. SNAKE
// ==========================================
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gridSize = 14; const tileCount = 20;

let snake = []; let dx = 0; let dy = 0; let foodX, foodY, snakeScore = 0;
let lastSnakeTime = 0;
const headImg = new Image(); headImg.src = imgSorella;
const foodEmojis = ['🎂', '🎁', '🍕', '🎉']; let currentFoodEmoji = foodEmojis[0];

function resetSnake() {
    snake = [{ x: 10, y: 10 }]; dx = 0; dy = 0; snakeScore = 0;
    scoreElement.innerText = snakeScore; placeFood();
    window.requestAnimationFrame(snakeLoop);
}
function snakeLoop(timestamp) {
    if (!isSnakeActive) return;
    window.requestAnimationFrame(snakeLoop);
    if (timestamp - lastSnakeTime < 150) return;
    lastSnakeTime = timestamp; updateSnake(); drawSnake();
}
function updateSnake() {
    if (dx === 0 && dy === 0) return;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(p => p.x === head.x && p.y === head.y)) { resetSnake(); return; }
    
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        snakeScore += 10; scoreElement.innerText = snakeScore;
        if(snakeScore > highScores.snake) {
            highScores.snake = snakeScore; localStorage.setItem('snakeHighScore', highScores.snake);
            document.getElementById('snake-highscore').innerText = highScores.snake;
        }
        if (snakeScore >= 50 && !hasWonSnake) { hasWonSnake = true; checkUltimateWin(); }
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
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1 && isSnakeActive) e.preventDefault();
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
// 7. PONG
// ==========================================
const pongCanvas = document.getElementById('pongCanvas'); const pongCtx = pongCanvas.getContext('2d');
const pScoreEl = document.getElementById('pong-score-player'); const cScoreEl = document.getElementById('pong-score-cpu');
const btnPongPause = document.getElementById('btn-pong-pause');

const ball = { x: 140, y: 175, r: 12, dx: 0, dy: 0 };
const pw = 60; const ph = 10;
const player = { x: 110, y: 330, score: 0 }; 
const cpu = { x: 110, y: 10, score: 0 };
let pongPaused = true; 

btnPongPause.addEventListener('click', () => {
    pongPaused = !pongPaused;
    btnPongPause.innerHTML = pongPaused ? '<i class="fa-solid fa-play"></i> Start' : '<i class="fa-solid fa-pause"></i> Pausa';
    if (!pongPaused && ball.dx === 0 && ball.dy === 0) { ball.dy = 4; ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1); }
});

function movePaddle(e) {
    if (!isPongActive) return;
    let clientX = e.type.includes('mouse') ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
    let newX = clientX - pongCanvas.getBoundingClientRect().left - pw / 2;
    player.x = Math.max(0, Math.min(newX, pongCanvas.width - pw));
}
pongCanvas.addEventListener('touchmove', e => { e.preventDefault(); movePaddle(e); }, {passive: false});
pongCanvas.addEventListener('mousemove', movePaddle);

function resetPong() {
    player.score = 0; cpu.score = 0; pScoreEl.innerText = '0'; cScoreEl.innerText = '0';
    pongPaused = true; btnPongPause.innerHTML = '<i class="fa-solid fa-play"></i> Start'; resetBall();
    window.requestAnimationFrame(pongLoop);
}
function resetBall() {
    ball.x = pongCanvas.width / 2; ball.y = pongCanvas.height / 2; ball.dx = 0; ball.dy = 0; 
    pongPaused = true; btnPongPause.innerHTML = '<i class="fa-solid fa-play"></i> Start';
}
function pongLoop() { if (!isPongActive) return; updatePong(); drawPong(); window.requestAnimationFrame(pongLoop); }

function updatePong() {
    let targetX = pongPaused ? (pongCanvas.width/2 - pw/2) : (ball.x - pw/2);
    cpu.x += (targetX - cpu.x) * 0.1; cpu.x = Math.max(0, Math.min(cpu.x, pongCanvas.width - pw));
    if (pongPaused) return; 

    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.x - ball.r < 0 || ball.x + ball.r > pongCanvas.width) ball.dx = -ball.dx;

    if (ball.y - ball.r < 0) {
        player.score++; pScoreEl.innerText = player.score;
        if(player.score > highScores.pong) {
            highScores.pong = player.score; localStorage.setItem('pongHighScore', highScores.pong);
            document.getElementById('pong-highscore').innerText = highScores.pong;
        }
        if(player.score >= 3 && !hasWonPong) { hasWonPong = true; checkUltimateWin(); }
        confetti(); resetBall();
    } else if (ball.y + ball.r > pongCanvas.height) { cpu.score++; cScoreEl.innerText = cpu.score; resetBall(); }

    if (ball.y + ball.r > player.y && ball.x > player.x && ball.x < player.x + pw) { ball.dy = -Math.abs(ball.dy); ball.dx = (ball.x - (player.x + pw/2)) * 0.15; }
    if (ball.y - ball.r < cpu.y + ph && ball.x > cpu.x && ball.x < cpu.x + pw) { ball.dy = Math.abs(ball.dy); ball.dx = (ball.x - (cpu.x + pw/2)) * 0.15; }
}
function drawPong() {
    pongCtx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
    pongCtx.setLineDash([10, 10]); pongCtx.beginPath(); pongCtx.moveTo(0, pongCanvas.height/2); pongCtx.lineTo(pongCanvas.width, pongCanvas.height/2);
    pongCtx.strokeStyle = 'rgba(0,0,0,0.1)'; pongCtx.stroke(); pongCtx.setLineDash([]);
    pongCtx.fillStyle = '#fbc2eb'; pongCtx.beginPath(); pongCtx.roundRect(player.x, player.y, pw, ph, 5); pongCtx.fill();
    pongCtx.fillStyle = '#a6c1ee'; pongCtx.beginPath(); pongCtx.roundRect(cpu.x, cpu.y, pw, ph, 5); pongCtx.fill();
    
    pongCtx.save(); pongCtx.beginPath(); pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true); pongCtx.closePath(); pongCtx.clip(); 
    pongCtx.drawImage(headImg, ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2); 
    pongCtx.beginPath(); pongCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true); pongCtx.strokeStyle = '#fff'; pongCtx.lineWidth = 2; pongCtx.stroke();
    pongCtx.restore();
}

// ==========================================
// 8. MUSICA NATIVA
// ==========================================
const playlist = [ { title: "Canzone 1", src: "assets/brano1.mp3" }, { title: "Canzone 2", src: "assets/brano2.mp3" } ];
let currentTrackIndex = 0; const bgAudio = new Audio(); bgAudio.volume = 0.5; bgAudio.loop = false; 
const btnPlayPause = document.getElementById('play-pause-btn'); const trackTitle = document.getElementById('track-title'); const recordCover = document.getElementById('record-cover');

function loadTrack(index) { bgAudio.src = playlist[index].src; trackTitle.innerText = playlist[index].title; }
loadTrack(currentTrackIndex);
function toggleAudio() {
    if (bgAudio.paused) { bgAudio.play(); btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>'; recordCover.classList.add('playing'); } 
    else { bgAudio.pause(); btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>'; recordCover.classList.remove('playing'); }
}
function nextTrack() { currentTrackIndex = (currentTrackIndex + 1) % playlist.length; loadTrack(currentTrackIndex); if (!bgAudio.paused) bgAudio.play(); }
function prevTrack() { currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length; loadTrack(currentTrackIndex); if (!bgAudio.paused) bgAudio.play(); }

bgAudio.addEventListener('ended', nextTrack);
btnPlayPause.addEventListener('click', toggleAudio);
document.getElementById('next-track').addEventListener('click', nextTrack);
document.getElementById('prev-track').addEventListener('click', prevTrack);