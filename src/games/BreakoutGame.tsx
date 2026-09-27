import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause, Zap } from 'lucide-react';

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const BRICK_ROWS = 6;
  const BRICK_COLS = 10;

  const stateRef = useRef({
    paddle: { x: 260, y: 450, width: 100, height: 14, vx: 0, laserTimer: 0 },
    balls: [] as Array<{ x: number; y: number; vx: number; vy: number; radius: number; isFireball?: boolean }>,
    bricks: [] as Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      hp: number;
      color: string;
      powerup?: 'multiball' | 'laser' | 'expand' | 'fireball';
    }>,
    powerups: [] as Array<{ x: number; y: number; vy: number; type: 'multiball' | 'laser' | 'expand' | 'fireball' }>,
    lasers: [] as Array<{ x: number; y: number; vy: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    keys: { left: false, right: false, fire: false },
    score: 0,
    lives: 3,
    level: 1,
    combo: 1,
  });

  const bestScore = highScores['brick-smasher'] || 0;

  const buildBricks = useCallback((lvl: number) => {
    const s = stateRef.current;
    s.bricks = [];
    const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
    const brickW = 54;
    const brickH = 20;
    const padding = 6;
    const offsetTop = 40;
    const offsetLeft = 20;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const rand = Math.random();
        let powerup: 'multiball' | 'laser' | 'expand' | 'fireball' | undefined = undefined;
        if (rand < 0.08) powerup = 'multiball';
        else if (rand < 0.15) powerup = 'laser';
        else if (rand < 0.22) powerup = 'expand';
        else if (rand < 0.28) powerup = 'fireball';

        s.bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          width: brickW,
          height: brickH,
          hp: r === 0 && lvl > 1 ? 2 : 1,
          color: colors[r % colors.length],
          powerup,
        });
      }
    }
    setLevel(lvl);
  }, []);

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.paddle = { x: 250, y: 450, width: 100, height: 14, vx: 0, laserTimer: 0 };
    s.balls = [{ x: 300, y: 430, vx: 3.5 * gameModSpeed, vy: -5 * gameModSpeed, radius: 7 }];
    s.powerups = [];
    s.lasers = [];
    s.particles = [];
    s.score = 0;
    s.lives = 3;
    s.level = 1;
    s.combo = 1;

    setScore(0);
    setLives(3);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    buildBricks(1);
  }, [buildBricks, gameModSpeed]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) s.keys.left = true;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) s.keys.right = true;
      if (e.code === 'Space') {
        if (!hasStarted) setHasStarted(true);
        s.keys.fire = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) s.keys.left = false;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) s.keys.right = false;
      if (e.code === 'Space') s.keys.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasStarted]);

  // Mouse Move Control on Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const s = stateRef.current;
    s.paddle.x = Math.max(0, Math.min(canvas.width - s.paddle.width, mouseX - s.paddle.width / 2));
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !isGameOver) {
        // Keyboard paddle movement
        if (s.keys.left) s.paddle.x = Math.max(0, s.paddle.x - 8);
        if (s.keys.right) s.paddle.x = Math.min(canvas.width - s.paddle.width, s.paddle.x + 8);

        // Paddle Laser Blaster
        if (s.paddle.laserTimer > 0) {
          s.paddle.laserTimer--;
          if (s.paddle.laserTimer % 18 === 0) {
            soundEngine.playLaser();
            s.lasers.push({ x: s.paddle.x + 10, y: s.paddle.y, vy: -10 });
            s.lasers.push({ x: s.paddle.x + s.paddle.width - 10, y: s.paddle.y, vy: -10 });
          }
        }

        // Update Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.y += l.vy;
          if (l.y < 0) {
            s.lasers.splice(i, 1);
            continue;
          }

          for (let j = s.bricks.length - 1; j >= 0; j--) {
            const br = s.bricks[j];
            if (l.x >= br.x && l.x <= br.x + br.width && l.y >= br.y && l.y <= br.y + br.height) {
              s.lasers.splice(i, 1);
              br.hp--;
              soundEngine.playHit();
              if (br.hp <= 0) {
                s.score += 20;
                setScore(s.score);
                s.bricks.splice(j, 1);
              }
              break;
            }
          }
        }

        // Update Balls
        for (let i = s.balls.length - 1; i >= 0; i--) {
          const ball = s.balls[i];
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounces
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
            soundEngine.playClick();
          } else if (ball.x + ball.radius >= canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -Math.abs(ball.vx);
            soundEngine.playClick();
          }

          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
            soundEngine.playClick();
          }

          // Paddle bounce
          if (
            ball.y + ball.radius >= s.paddle.y &&
            ball.y - ball.radius <= s.paddle.y + s.paddle.height &&
            ball.x >= s.paddle.x &&
            ball.x <= s.paddle.x + s.paddle.width &&
            ball.vy > 0
          ) {
            soundEngine.playJump();
            // Angle based on hit offset from paddle center
            const hitOffset = (ball.x - (s.paddle.x + s.paddle.width / 2)) / (s.paddle.width / 2);
            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = hitOffset * speed * 0.9;
            ball.vy = -Math.sqrt(Math.max(16, speed * speed - ball.vx * ball.vx));
            s.combo = 1;
          }

          // Fall off bottom
          if (ball.y > canvas.height + 20) {
            s.balls.splice(i, 1);
            continue;
          }

          // Brick collision
          for (let j = s.bricks.length - 1; j >= 0; j--) {
            const br = s.bricks[j];
            if (
              ball.x + ball.radius >= br.x &&
              ball.x - ball.radius <= br.x + br.width &&
              ball.y + ball.radius >= br.y &&
              ball.y - ball.radius <= br.y + br.height
            ) {
              if (!ball.isFireball) {
                ball.vy = -ball.vy;
              }
              br.hp--;
              soundEngine.playHit();

              if (br.hp <= 0) {
                s.score += 15 * s.combo;
                s.combo++;
                setScore(s.score);

                // Spawn particles
                for (let p = 0; p < 10; p++) {
                  s.particles.push({
                    x: br.x + br.width / 2,
                    y: br.y + br.height / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 1,
                    color: br.color,
                  });
                }

                // Powerup drop
                if (br.powerup) {
                  s.powerups.push({
                    x: br.x + br.width / 2,
                    y: br.y + br.height / 2,
                    vy: 2.2,
                    type: br.powerup,
                  });
                }

                s.bricks.splice(j, 1);
              }
              break;
            }
          }
        }

        // Check if all balls lost
        if (s.balls.length === 0) {
          if (!isPracticeMode) {
            s.lives--;
            setLives(s.lives);
            soundEngine.playGameOver();

            if (s.lives <= 0) {
              saveHighScore('brick-smasher', s.score);
              setIsGameOver(true);
            } else {
              s.balls.push({
                x: s.paddle.x + s.paddle.width / 2,
                y: s.paddle.y - 15,
                vx: 3.5 * gameModSpeed,
                vy: -5 * gameModSpeed,
                radius: 7,
              });
            }
          } else {
            s.balls.push({
              x: s.paddle.x + s.paddle.width / 2,
              y: s.paddle.y - 15,
              vx: 3.5 * gameModSpeed,
              vy: -5 * gameModSpeed,
              radius: 7,
            });
          }
        }

        // Powerups update
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const pu = s.powerups[i];
          pu.y += pu.vy;

          if (
            pu.y >= s.paddle.y &&
            pu.y <= s.paddle.y + s.paddle.height &&
            pu.x >= s.paddle.x &&
            pu.x <= s.paddle.x + s.paddle.width
          ) {
            soundEngine.playPowerup();
            if (pu.type === 'multiball') {
              const b = s.balls[0] || { x: 300, y: 300, radius: 7 };
              s.balls.push({ x: b.x, y: b.y, vx: -4, vy: -5, radius: 7 });
              s.balls.push({ x: b.x, y: b.y, vx: 4, vy: -5, radius: 7 });
            } else if (pu.type === 'laser') {
              s.paddle.laserTimer = 350;
            } else if (pu.type === 'expand') {
              s.paddle.width = Math.min(160, s.paddle.width + 30);
            } else if (pu.type === 'fireball') {
              s.balls.forEach(b => (b.isFireball = true));
            }

            s.powerups.splice(i, 1);
            continue;
          }

          if (pu.y > canvas.height + 20) {
            s.powerups.splice(i, 1);
          }
        }

        // Level Clear Check
        if (s.bricks.length === 0) {
          s.level++;
          soundEngine.playPowerup();
          buildBricks(s.level);
          s.balls = [{
            x: s.paddle.x + s.paddle.width / 2,
            y: s.paddle.y - 15,
            vx: 4 * gameModSpeed,
            vy: -5.5 * gameModSpeed,
            radius: 7,
          }];
        }
      }

      // Render
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Bricks
      for (const br of s.bricks) {
        ctx.fillStyle = br.color;
        ctx.shadowColor = br.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(br.x, br.y, br.width, br.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Brick top shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(br.x + 2, br.y + 2, br.width - 4, 3);
      }

      // Draw Powerups
      for (const pu of s.powerups) {
        ctx.fillStyle = pu.type === 'multiball' ? '#06b6d4' : pu.type === 'laser' ? '#f43f5e' : '#eab308';
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      // Draw Lasers
      for (const l of s.lasers) {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillRect(l.x - 2, l.y, 4, 12);
        ctx.shadowBlur = 0;
      }

      // Draw Paddle
      ctx.fillStyle = s.paddle.laserTimer > 0 ? '#f43f5e' : '#38bdf8';
      ctx.shadowColor = s.paddle.laserTimer > 0 ? '#f43f5e' : '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(s.paddle.x, s.paddle.y, s.paddle.width, s.paddle.height, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Balls
      for (const b of s.balls) {
        ctx.fillStyle = b.isFireball ? '#f97316' : '#ffffff';
        ctx.shadowColor = b.isFireball ? '#f97316' : '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isPaused, isGameOver, isPracticeMode, gameModSpeed, saveHighScore, buildBricks]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top Bar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-amber-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">LEVEL</span>
            <span className="text-lg font-bold font-mono text-amber-300">{level}</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  i < lives ? 'bg-amber-400 shadow-[0_0_8px_#facc15]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={480}
          onMouseMove={handleMouseMove}
          className="w-full max-w-xl aspect-5/4 rounded-2xl border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)] bg-slate-950 cursor-ew-resize"
        />

        {!hasStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">HYPER BREAKOUT DX</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Move paddle with mouse or arrow keys. Catch falling powerups: Multiballs, Laser Cannons, and Fireballs!
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              LAUNCH BALL [SPACE]
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-amber-500 mb-2">GAME OVER</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Final Score: <span className="text-amber-400 font-bold">{score}</span></p>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
