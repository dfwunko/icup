import { CustomGame } from '../types';

export const SAMPLE_CUSTOM_GAMES: CustomGame[] = [
  {
    id: 'pong-classic',
    title: 'Neon Ping Pong DX',
    author: 'ArcadeMaster',
    description: 'Classic 2-player or vs AI neon table tennis with smooth paddle physics, spin, and particle trails.',
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #050510; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { background: #0b0c16; border: 2px solid #00ffcc; border-radius: 8px; box-shadow: 0 0 20px rgba(0,255,204,0.3); }
    .hint { margin-top: 10px; color: #888; font-size: 13px; font-family: monospace; }
  </style>
</head>
<body>
  <canvas id="c" width="600" height="400"></canvas>
  <div class="hint">Controls: W/S or UP/DOWN Arrow keys to move paddle. First to 7 wins!</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let p1Y = 160, p2Y = 160, ballX = 300, ballY = 200, dx = 4, dy = 3;
    let p1Score = 0, p2Score = 0;
    const paddleH = 70, paddleW = 12;
    const keys = {};

    window.addEventListener('keydown', e => { keys[e.key] = true; if(['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); });
    window.addEventListener('keyup', e => { keys[e.key] = false; });

    function resetBall(winner) {
      ballX = 300; ballY = 200;
      dx = (winner === 1 ? 4 : -4);
      dy = (Math.random() * 4 - 2);
    }

    function loop() {
      // Player controls
      if (keys['w'] || keys['W'] || keys['ArrowUp']) p1Y = Math.max(0, p1Y - 6);
      if (keys['s'] || keys['S'] || keys['ArrowDown']) p1Y = Math.min(canvas.height - paddleH, p1Y + 6);

      // AI controls
      const targetY = ballY - paddleH / 2;
      p2Y += (targetY - p2Y) * 0.085;
      p2Y = Math.max(0, Math.min(canvas.height - paddleH, p2Y));

      // Move ball
      ballX += dx;
      ballY += dy;

      if (ballY <= 0 || ballY >= canvas.height) dy = -dy;

      // P1 hit
      if (ballX <= 30 && ballY >= p1Y && ballY <= p1Y + paddleH) {
        dx = Math.abs(dx) + 0.2;
        dy += (ballY - (p1Y + paddleH/2)) * 0.15;
      }
      // P2 hit
      if (ballX >= canvas.width - 30 && ballY >= p2Y && ballY <= p2Y + paddleH) {
        dx = -Math.abs(dx) - 0.2;
        dy += (ballY - (p2Y + paddleH/2)) * 0.15;
      }

      // Scoring
      if (ballX < 0) { p2Score++; resetBall(2); }
      if (ballX > canvas.width) { p1Score++; resetBall(1); }

      // Render
      ctx.fillStyle = '#0b0c16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Net
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(300, 0); ctx.lineTo(300, 400);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#00ffcc';
      ctx.fillText(p1Score, 240, 50);
      ctx.fillStyle = '#ff0055';
      ctx.fillText(p2Score, 330, 50);

      // Paddles
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffcc';
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(15, p1Y, paddleW, paddleH);

      ctx.shadowColor = '#ff0055';
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(canvas.width - 27, p2Y, paddleW, paddleH);

      // Ball
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    id: 'matrix-gravity',
    title: 'Neon Gravity Sandbox',
    author: 'QuantumDev',
    description: 'Interactive gravitational particle simulator. Click & drag to spawn orbital bodies, black holes, and nebula fireworks.',
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #030712; color: #fff; font-family: monospace; overflow: hidden; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .ui { position: absolute; top: 12px; left: 16px; background: rgba(0,0,0,0.6); padding: 8px 14px; border-radius: 6px; border: 1px solid #00f2ff; font-size: 12px; pointer-events: none; }
  </style>
</head>
<body>
  <div class="ui">CLICK/DRAG to spawn particles | SPACE to clear | DOUBLE-CLICK for Black Hole</div>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    let blackHoles = [];
    const colors = ['#00ffff', '#ff007f', '#ffe600', '#00ff66', '#a855f7'];

    class Particle {
      constructor(x, y, vx, vy) {
        this.x = x; this.y = y;
        this.vx = vx || (Math.random() - 0.5) * 4;
        this.vy = vy || (Math.random() - 0.5) * 4;
        this.radius = Math.random() * 2.5 + 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 1;
        this.decay = Math.random() * 0.003 + 0.001;
      }
      update() {
        for (let bh of blackHoles) {
          let dx = bh.x - this.x;
          let dy = bh.y - this.y;
          let dist = Math.sqrt(dx*dx + dy*dy) + 10;
          let force = (bh.mass / (dist * dist)) * 0.5;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      }
      draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
      }
    }

    let isDown = false;
    window.addEventListener('mousedown', e => { isDown = true; spawnCluster(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { isDown = false; });
    window.addEventListener('mousemove', e => { if(isDown) spawnCluster(e.clientX, e.clientY, 3); });
    window.addEventListener('dblclick', e => {
      blackHoles.push({ x: e.clientX, y: e.clientY, mass: 1500 });
      if (blackHoles.length > 3) blackHoles.shift();
    });
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') { particles = []; blackHoles = []; }
    });

    function spawnCluster(x, y, count = 10) {
      for(let i=0; i<count; i++) {
        particles.push(new Particle(x, y));
      }
    }

    // default center attractor
    blackHoles.push({ x: canvas.width/2, y: canvas.height/2, mass: 800 });

    function animate() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let bh of blackHoles) {
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, 16, 0, Math.PI*2);
        ctx.stroke();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0 || particles[i].x < -100 || particles[i].x > canvas.width + 100 || particles[i].y < -100 || particles[i].y > canvas.height + 100) {
          particles.splice(i, 1);
        }
      }

      if (particles.length < 150) {
        spawnCluster(Math.random() * canvas.width, Math.random() * canvas.height, 2);
      }

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`
  }
];
