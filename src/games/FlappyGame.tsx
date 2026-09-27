import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause } from 'lucide-react';

export const FlappyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const stateRef = useRef({
    bird: { y: 220, vy: 0, radius: 14, angle: 0, shield: 0 },
    pipes: [] as Array<{ x: number; topH: number; bottomY: number; passed: boolean }>,
    coins: [] as Array<{ x: number; y: number; collected: boolean }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    pipeTimer: 0,
    score: 0,
    bgOffset: 0,
  });

  const bestScore = highScores['flappy-cyber'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.bird = { y: 220, vy: 0, radius: 14, angle: 0, shield: isPracticeMode ? 999 : 0 };
    s.pipes = [];
    s.coins = [];
    s.particles = [];
    s.pipeTimer = 0;
    s.score = 0;
    s.bgOffset = 0;

    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, [isPracticeMode]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const flap = useCallback(() => {
    if (isGameOver) {
      initGame();
      setHasStarted(true);
      return;
    }
    if (!hasStarted) {
      setHasStarted(true);
    }
    const s = stateRef.current;
    s.bird.vy = -6.5 * gameModSpeed;
    soundEngine.playJump();

    // Thruster smoke
    for (let i = 0; i < 6; i++) {
      s.particles.push({
        x: 120,
        y: s.bird.y + 6,
        vx: -2 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 2,
        life: 0.7,
        color: '#ec4899',
      });
    }
  }, [hasStarted, initGame, isGameOver, gameModSpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !isGameOver) {
        // Bird physics
        s.bird.vy += 0.32;
        s.bird.y += s.bird.vy;
        s.bird.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, s.bird.vy * 0.08));

        // Floor / Ceiling check
        if (s.bird.y - s.bird.radius < 0) {
          s.bird.y = s.bird.radius;
          s.bird.vy = 0;
        }
        if (s.bird.y + s.bird.radius > canvas.height - 30) {
          if (!isPracticeMode) {
            soundEngine.playGameOver();
            saveHighScore('flappy-cyber', s.score);
            setIsGameOver(true);
          } else {
            s.bird.y = canvas.height - 30 - s.bird.radius;
            s.bird.vy = 0;
          }
        }

        // Spawn Pipes
        s.pipeTimer++;
        if (s.pipeTimer > 100 / gameModSpeed) {
          s.pipeTimer = 0;
          const gap = 125;
          const minH = 50;
          const maxH = canvas.height - gap - minH - 40;
          const topH = Math.floor(Math.random() * (maxH - minH)) + minH;

          s.pipes.push({
            x: canvas.width + 10,
            topH,
            bottomY: topH + gap,
            passed: false,
          });

          // Spawn coin in gap
          if (Math.random() < 0.6) {
            s.coins.push({
              x: canvas.width + 10 + 30,
              y: topH + gap / 2,
              collected: false,
            });
          }
        }

        // Move Pipes & Check Collisions
        const birdX = 120;
        const pipeSpeed = 3 * gameModSpeed;

        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= pipeSpeed;

          // Score check
          if (!p.passed && p.x + 50 < birdX) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            soundEngine.playCoin();
          }

          // Hit check
          if (birdX + s.bird.radius > p.x && birdX - s.bird.radius < p.x + 50) {
            if (s.bird.y - s.bird.radius < p.topH || s.bird.y + s.bird.radius > p.bottomY) {
              if (!isPracticeMode) {
                soundEngine.playExplosion();
                soundEngine.playGameOver();
                saveHighScore('flappy-cyber', s.score);
                setIsGameOver(true);
              }
            }
          }

          if (p.x < -60) {
            s.pipes.splice(i, 1);
          }
        }

        // Move Coins
        for (let i = s.coins.length - 1; i >= 0; i--) {
          const c = s.coins[i];
          c.x -= pipeSpeed;

          if (!c.collected) {
            const dist = Math.hypot(c.x - birdX, c.y - s.bird.y);
            if (dist < s.bird.radius + 12) {
              c.collected = true;
              s.score += 3;
              setScore(s.score);
              soundEngine.playPowerup();
            }
          }

          if (c.x < -30) {
            s.coins.splice(i, 1);
          }
        }

        s.bgOffset += 0.8;
      }

      // Render
      ctx.fillStyle = '#070a16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber City Parallax Silhouette
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < canvas.width / 40 + 2; i++) {
        const h = 80 + ((i * 37) % 100);
        ctx.fillRect(i * 40 - (s.bgOffset % 40), canvas.height - 30 - h, 36, h);
      }

      // Ground
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      ctx.lineTo(canvas.width, canvas.height - 30);
      ctx.stroke();

      // Draw Pipes
      for (const p of s.pipes) {
        // Top Pipe
        ctx.fillStyle = '#db2777';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x, 0, 50, p.topH);
        ctx.fillRect(p.x - 4, p.topH - 16, 58, 16);

        // Bottom Pipe
        ctx.fillRect(p.x, p.bottomY, 50, canvas.height - 30 - p.bottomY);
        ctx.fillRect(p.x - 4, p.bottomY, 58, 16);
        ctx.shadowBlur = 0;
      }

      // Draw Coins
      for (const c of s.coins) {
        if (c.collected) continue;
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Thruster Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.04;
        if (pt.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw Cyber Wing Bird
      ctx.save();
      ctx.translate(120, s.bird.y);
      ctx.rotate(s.bird.angle);

      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, s.bird.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wing
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.ellipse(-4, 2, 8, 5, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Beak / Thruster Visor
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(18, 2);
      ctx.lineTo(10, 6);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isPaused, isGameOver, isPracticeMode, gameModSpeed, saveHighScore]);

  return (
    <div
      onClick={flap}
      className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4 cursor-pointer"
    >
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-pink-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-pink-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">BEST</span>
            <span className="text-lg font-bold font-mono text-pink-300">{bestScore}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-pink-500 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-pink-500 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={450}
          height={500}
          className="w-full max-w-md aspect-9/10 rounded-2xl border-2 border-pink-500/40 shadow-[0_0_35px_rgba(236,72,153,0.2)] bg-slate-950"
        />

        {!hasStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">CYBER WING FLAP</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Click or press SPACE to fire your thrusters and glide between neon towers!
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-xl text-base shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TAP TO FLY
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-pink-500 mb-2">CRASHED!</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Final Score: <span className="text-pink-400 font-bold">{score}</span></p>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-xl text-base shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
