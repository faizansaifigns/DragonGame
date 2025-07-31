const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

let gameInterval;
let gameActive = false;

// Dragon properties
const dragon = {
    x: 100,
    y: canvas.height / 2 - 40,
    width: 80,
    height: 70,
    speed: 6,
    dy: 0
};

// Fireballs
const fireballs = [];
const fireballSpeed = 12;

// Obstacles
const obstacles = [];
const obstacleWidth = 40;
const obstacleHeight = 40;
const obstacleSpeed = 5;
let score = 0;

// Controls
const keys = {};

// Draw a more dragon-like dragon
function drawDragon() {
    const { x, y, width, height } = dragon;

    // Draw body (ellipse)
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(-0.1);
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.35, height * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2a9d8f';
    ctx.shadowColor = '#1a4645';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    // Draw tail (zigzag)
    ctx.save();
    ctx.strokeStyle = '#2a9d8f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height * 0.7);
    ctx.lineTo(x - 20, y + height * 0.9);
    ctx.lineTo(x - 8, y + height * 0.85);
    ctx.lineTo(x - 22, y + height * 0.98);
    ctx.stroke();
    ctx.restore();

    // Draw legs
    ctx.save();
    ctx.strokeStyle = '#264653';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height * 0.6);
    ctx.lineTo(x + width * 0.1, y + height * 0.85);
    ctx.moveTo(x + width * 0.35, y + height * 0.6);
    ctx.lineTo(x + width * 0.34, y + height * 0.85);
    ctx.stroke();
    ctx.restore();

    // Draw wings
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, y + height * 0.2);
    ctx.lineTo(x + width * 0.15, y - height * 0.18);
    ctx.lineTo(x + width * 0.5, y + height * 0.05);
    ctx.closePath();
    ctx.fillStyle = '#b5ead7';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw head (circle)
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + width * 0.7, y + height * 0.38, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#2a9d8f';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();

    // Draw eye
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + width * 0.79, y + height * 0.38, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.81, y + height * 0.38, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();

    // Draw nostril
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + width * 0.86, y + height * 0.43, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#264653';
    ctx.fill();
    ctx.restore();

    // Draw horns
    ctx.save();
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.75, y + height * 0.26);
    ctx.lineTo(x + width * 0.83, y + height * 0.14);
    ctx.moveTo(x + width * 0.81, y + height * 0.25);
    ctx.lineTo(x + width * 0.91, y + height * 0.13);
    ctx.stroke();
    ctx.restore();

    // Draw jaw (lower mouth)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + width * 0.81, y + height * 0.47, 12, 5, 0.15, 0, Math.PI);
    ctx.fillStyle = '#e76f51';
    ctx.fill();
    ctx.restore();

    // Draw fire if shooting (when pressing space)
    if (fireActive > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + width * 0.9, y + height * 0.42);
        ctx.quadraticCurveTo(x + width * 1.08, y + height * 0.4, x + width * 1.1, y + height * 0.45);
        ctx.quadraticCurveTo(x + width * 1.05, y + height * 0.5, x + width * 0.9, y + height * 0.44);
        ctx.closePath();
        ctx.fillStyle = "#ffd166";
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Draw fireballs
function drawFireballs() {
    ctx.fillStyle = "#ffa500";
    fireballs.forEach(fb => {
        // Fireball body
        ctx.save();
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, 10, 0, Math.PI * 2);
        ctx.shadowColor = "#f00";
        ctx.shadowBlur = 24;
        ctx.fill();
        // Fireball outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.restore();
    });
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = "#444";
    obstacles.forEach(obs => {
        ctx.save();
        ctx.fillRect(obs.x, obs.y, obstacleWidth, obstacleHeight);
        // Teeth
        ctx.fillStyle = "#fff";
        ctx.fillRect(obs.x + 28, obs.y + 10, 6, 14);
        ctx.restore();
    });
}

// Move dragon
function moveDragon() {
    dragon.y += dragon.dy;
    // Boundaries
    if (dragon.y < 0) dragon.y = 0;
    if (dragon.y + dragon.height > canvas.height) dragon.y = canvas.height - dragon.height;
}

// Move fireballs
function moveFireballs() {
    for (let i = fireballs.length - 1; i >= 0; i--) {
        fireballs[i].x += fireballSpeed;
        if (fireballs[i].x > canvas.width) {
            fireballs.splice(i, 1);
        }
    }
}

// Move obstacles
function moveObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;
        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
            score++;
        }
    }
}

// Collision detection
function checkCollisions() {
    // Dragon and obstacle
    for (let obs of obstacles) {
        if (
            dragon.x < obs.x + obstacleWidth &&
            dragon.x + dragon.width > obs.x &&
            dragon.y < obs.y + obstacleHeight &&
            dragon.y + dragon.height > obs.y
        ) {
            gameOver();
        }
    }
    // Fireball and obstacle
    for (let i = obstacles.length - 1; i >= 0; i--) {
        for (let j = fireballs.length - 1; j >= 0; j--) {
            const obs = obstacles[i];
            const fb = fireballs[j];
            if (
                fb.x > obs.x &&
                fb.x < obs.x + obstacleWidth &&
                fb.y > obs.y &&
                fb.y < obs.y + obstacleHeight
            ) {
                obstacles.splice(i, 1);
                fireballs.splice(j, 1);
                score += 2;
                break;
            }
        }
    }
}

// Spawn obstacles
function spawnObstacle() {
    const y = Math.random() * (canvas.height - obstacleHeight);
    obstacles.push({ x: canvas.width, y });
}

// Draw score
function drawScore() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

let fireActive = 0;

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveDragon();
    moveFireballs();
    moveObstacles();
    checkCollisions();
    drawDragon();
    drawFireballs();
    drawObstacles();
    drawScore();
    if (fireActive > 0) fireActive--;
}

// Handle keys
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'ArrowUp') {
        dragon.dy = -dragon.speed;
    }
    if (e.code === 'ArrowDown') {
        dragon.dy = dragon.speed;
    }
    if (e.code === 'Space' && gameActive && fireCooldown === 0) {
        fireballs.push({
            x: dragon.x + dragon.width * 0.92,
            y: dragon.y + dragon.height * 0.45
        });
        fireActive = 6;
        fireCooldown = 9;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (!keys['ArrowUp'] && !keys['ArrowDown']) {
        dragon.dy = 0;
    }
});

let fireCooldown = 0;

// Start/Restart
startBtn.onclick = startGame;

function startGame() {
    gameActive = true;
    dragon.y = canvas.height / 2 - 40;
    fireballs.length = 0;
    obstacles.length = 0;
    score = 0;
    startBtn.disabled = true;
    startBtn.textContent = "Game Running...";
    fireCooldown = 0;
    gameInterval = setInterval(() => {
        if (Math.random() < 0.025) {
            spawnObstacle();
        }
        if (fireCooldown > 0) fireCooldown--;
        gameLoop();
    }, 1000 / 60);
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(gameInterval);
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = '28px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
    startBtn.disabled = false;
    startBtn.textContent = "Restart Game";
}