import { HtmlJsGame, CloakProfile } from '../types';

export const INITIAL_HTML_GAMES: HtmlJsGame[] = [
  {
    id: 'minimal-pong',
    title: 'Minimal Pong',
    author: 'NovaVault',
    description: 'Crisp, black & white 2-paddle table tennis against AI. Smooth physics & rally counter.',
    tags: ['Classic', '2D', 'Canvas'],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
    canvas { background: #000; border: 1px solid #262626; border-radius: 12px; }
    .hud { margin-top: 14px; font-size: 12px; color: #737373; font-family: monospace; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <canvas id="c" width="640" height="400"></canvas>
  <div class="hud">Controls: W / S or Arrow Keys to move paddle. First to 7 points wins.</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let p1Y = 160, p2Y = 160;
    let ballX = 320, ballY = 200, dx = 4.5, dy = 3;
    let score1 = 0, score2 = 0, rally = 0;
    const paddleH = 75, paddleW = 8;
    const keys = {};

    window.addEventListener('keydown', e => { keys[e.key] = true; if(['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); });
    window.addEventListener('keyup', e => { keys[e.key] = false; });

    function resetBall(winner) {
      ballX = 320; ballY = 200;
      dx = (winner === 1 ? 4.5 : -4.5);
      dy = (Math.random() * 4 - 2);
      rally = 0;
    }

    function loop() {
      // Player
      if (keys['w'] || keys['W'] || keys['ArrowUp']) p1Y = Math.max(10, p1Y - 6.5);
      if (keys['s'] || keys['S'] || keys['ArrowDown']) p1Y = Math.min(canvas.height - paddleH - 10, p1Y + 6.5);

      // AI
      const targetY = ballY - paddleH / 2;
      p2Y += (targetY - p2Y) * 0.085;
      p2Y = Math.max(10, Math.min(canvas.height - paddleH - 10, p2Y));

      ballX += dx;
      ballY += dy;

      if (ballY <= 8 || ballY >= canvas.height - 8) dy = -dy;

      // P1 hit
      if (ballX <= 32 && ballY >= p1Y && ballY <= p1Y + paddleH) {
        dx = Math.min(12, Math.abs(dx) + 0.25);
        dy = (ballY - (p1Y + paddleH/2)) * 0.18;
        rally++;
      }
      // P2 hit
      if (ballX >= canvas.width - 32 && ballY >= p2Y && ballY <= p2Y + paddleH) {
        dx = -Math.min(12, Math.abs(dx) + 0.25);
        dy = (ballY - (p2Y + paddleH/2)) * 0.18;
        rally++;
      }

      if (ballX < 0) { score2++; resetBall(2); }
      if (ballX > canvas.width) { score1++; resetBall(1); }

      // Clear Frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = '#262626';
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores
      ctx.font = '300 48px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(score1, canvas.width / 2 - 80, 65);
      ctx.fillStyle = '#737373';
      ctx.fillText(score2, canvas.width / 2 + 50, 65);

      // Paddles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, p1Y, paddleW, paddleH);
      ctx.fillStyle = '#a3a3a3';
      ctx.fillRect(canvas.width - 20 - paddleW, p2Y, paddleW, paddleH);

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    id: 'minimal-snake',
    title: 'Minimal Snake',
    author: 'NovaVault',
    description: 'Clean monochrome grid snake with instant response and high score tracker.',
    tags: ['Retro', 'Grid', 'Puzzle'],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
    canvas { background: #050505; border: 1px solid #262626; border-radius: 12px; }
    .hud { margin-top: 14px; font-size: 12px; color: #737373; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <canvas id="c" width="440" height="440"></canvas>
  <div class="hud">WASD or Arrow keys to move • SPACE to restart</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const GRID = 20, CELL = 22;
    let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    let dir = {x: 1, y: 0}, nextDir = {x: 1, y: 0};
    let food = {x: 15, y: 10};
    let score = 0, isDead = false;

    function spawnFood() {
      let x, y, hit = true;
      while (hit) {
        x = Math.floor(Math.random() * GRID);
        y = Math.floor(Math.random() * GRID);
        hit = snake.some(s => s.x === x && s.y === y);
      }
      food = {x, y};
    }

    window.addEventListener('keydown', e => {
      if (['ArrowUp','KeyW'].includes(e.code) && dir.y === 0) nextDir = {x: 0, y: -1};
      if (['ArrowDown','KeyS'].includes(e.code) && dir.y === 0) nextDir = {x: 0, y: 1};
      if (['ArrowLeft','KeyA'].includes(e.code) && dir.x === 0) nextDir = {x: -1, y: 0};
      if (['ArrowRight','KeyD'].includes(e.code) && dir.x === 0) nextDir = {x: 1, y: 0};
      if (e.code === 'Space' && isDead) {
        snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
        dir = {x: 1, y: 0}; nextDir = {x: 1, y: 0};
        score = 0; isDead = false; spawnFood();
      }
    });

    let lastTick = 0;
    function loop(time) {
      if (!isDead && time - lastTick > 95) {
        lastTick = time;
        dir = nextDir;
        let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (head.x < 0) head.x = GRID - 1;
        if (head.x >= GRID) head.x = 0;
        if (head.y < 0) head.y = GRID - 1;
        if (head.y >= GRID) head.y = 0;

        if (snake.some(s => s.x === head.x && s.y === head.y)) {
          isDead = true;
        } else {
          snake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            score += 10;
            spawnFood();
          } else {
            snake.pop();
          }
        }
      }

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Grid Dots
      ctx.fillStyle = '#171717';
      for(let x=0; x<GRID; x++) {
        for(let y=0; y<GRID; y++) {
          ctx.fillRect(x*CELL + CELL/2 - 1, y*CELL + CELL/2 - 1, 2, 2);
        }
      }

      // Food
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL/2 - 4, 0, Math.PI*2);
      ctx.fill();

      // Snake
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#ffffff' : '#737373';
        ctx.fillRect(seg.x*CELL + 2, seg.y*CELL + 2, CELL - 4, CELL - 4);
      });

      // Score HUD
      ctx.font = '14px monospace';
      ctx.fillStyle = '#a3a3a3';
      ctx.fillText('SCORE: ' + score, 16, 24);

      if (isDead) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#737373';
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 20);
        ctx.textAlign = 'left';
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`
  },
  {
    id: 'minimal-breakout',
    title: 'Minimal Breakout',
    author: 'NovaVault',
    description: 'Minimal paddle & brick smasher with clean physics and combo counter.',
    tags: ['Arcade', 'Physics'],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
    canvas { background: #030303; border: 1px solid #262626; border-radius: 12px; cursor: ew-resize; }
    .hud { margin-top: 14px; font-size: 12px; color: #737373; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <canvas id="c" width="540" height="420"></canvas>
  <div class="hud">Move mouse or Left/Right arrows to control paddle</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let paddleX = 220, paddleW = 90, paddleH = 8;
    let ballX = 270, ballY = 360, vx = 3.5, vy = -4.5;
    let score = 0, isOver = false;

    const bricks = [];
    for(let r=0; r<5; r++) {
      for(let c=0; c<8; c++) {
        bricks.push({ x: 30 + c*60, y: 40 + r*22, w: 52, h: 14, active: true });
      }
    }

    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      paddleX = Math.max(0, Math.min(canvas.width - paddleW, e.clientX - rect.left - paddleW/2));
    });

    window.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft' || e.key === 'a') paddleX = Math.max(0, paddleX - 25);
      if (e.code === 'ArrowRight' || e.key === 'd') paddleX = Math.min(canvas.width - paddleW, paddleX + 25);
      if (e.code === 'Space' && isOver) location.reload();
    });

    function loop() {
      if (!isOver) {
        ballX += vx;
        ballY += vy;

        if (ballX <= 6 || ballX >= canvas.width - 6) vx = -vx;
        if (ballY <= 6) vy = -vy;

        // Paddle hit
        if (ballY >= canvas.height - 40 - paddleH && ballY <= canvas.height - 30 && ballX >= paddleX && ballX <= paddleX + paddleW) {
          vy = -Math.abs(vy);
          vx = ((ballX - (paddleX + paddleW/2)) / (paddleW/2)) * 4.5;
        }

        // Brick hits
        bricks.forEach(b => {
          if (b.active && ballX >= b.x && ballX <= b.x + b.w && ballY >= b.y && ballY <= b.y + b.h) {
            b.active = false;
            vy = -vy;
            score += 20;
          }
        });

        if (ballY > canvas.height) isOver = true;
      }

      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bricks
      bricks.forEach(b => {
        if (b.active) {
          ctx.fillStyle = '#e5e5e5';
          ctx.fillRect(b.x, b.y, b.w, b.h);
        }
      });

      // Paddle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(paddleX, canvas.height - 40, paddleW, paddleH);

      // Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI*2);
      ctx.fill();

      // HUD
      ctx.fillStyle = '#737373';
      ctx.font = '12px monospace';
      ctx.fillText('SCORE: ' + score, 20, 24);

      if (isOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#737373';
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 25);
        ctx.textAlign = 'left';
      }

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    id: 'minimal-particles',
    title: 'Gravity Particle Sandbox',
    author: 'NovaVault',
    description: 'Interactive black-hole gravity field. Click and drag to spawn orbiting celestial dust.',
    tags: ['Sandbox', 'Physics', 'Interactive'],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; color: #fff; font-family: monospace; overflow: hidden; height: 100vh; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .hint { position: absolute; top: 16px; left: 16px; font-size: 11px; color: #525252; pointer-events: none; }
  </style>
</head>
<body>
  <div class="hint">Click & Drag to spawn particles • Space to clear</div>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let attractor = { x: canvas.width/2, y: canvas.height/2, mass: 1000 };

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      attractor.x = canvas.width/2;
      attractor.y = canvas.height/2;
    });

    let isDown = false;
    window.addEventListener('mousedown', e => { isDown = true; spawn(e.clientX, e.clientY, 15); });
    window.addEventListener('mouseup', () => { isDown = false; });
    window.addEventListener('mousemove', e => { if (isDown) spawn(e.clientX, e.clientY, 4); });
    window.addEventListener('keydown', e => { if (e.code === 'Space') particles = []; });

    function spawn(x, y, count = 10) {
      for(let i=0; i<count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          decay: Math.random() * 0.003 + 0.001
        });
      }
    }

    // Initial burst
    spawn(canvas.width/2, canvas.height/2 - 100, 80);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center attractor dot
      ctx.strokeStyle = '#262626';
      ctx.beginPath();
      ctx.arc(attractor.x, attractor.y, 8, 0, Math.PI*2);
      ctx.stroke();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = attractor.x - p.x;
        const dy = attractor.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy) + 12;
        const force = (attractor.mass / (dist * dist)) * 0.45;

        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      ctx.globalAlpha = 1;

      if (particles.length < 50) {
        spawn(Math.random() * canvas.width, Math.random() * canvas.height, 2);
      }

      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>`
  }
];

export const CLOAK_PROFILES: CloakProfile[] = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    tabTitle: 'Classes - Google Classroom',
    favicon: 'https://ssl.gstatic.com/classroom/favicon.png',
    previewDomain: 'classroom.google.com',
    disguiseType: 'classroom',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    tabTitle: 'Untitled document - Google Docs',
    favicon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    previewDomain: 'docs.google.com',
    disguiseType: 'docs',
  },
  {
    id: 'calculator',
    name: 'Desmos Scientific Calculator',
    tabTitle: 'Desmos | Scientific Calculator',
    favicon: 'https://www.desmos.com/favicon.ico',
    previewDomain: 'desmos.com/scientific',
    disguiseType: 'calculator',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Article',
    tabTitle: 'Linear algebra - Wikipedia',
    favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    previewDomain: 'en.wikipedia.org',
    disguiseType: 'wikipedia',
  },
];
