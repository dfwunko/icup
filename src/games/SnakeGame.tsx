import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause, Zap } from 'lucide-react';

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [activePowerup, setActivePowerup] = useState<string | null>(null);

  const GRID_SIZE = 20;
  const CELL_SIZE = 25;

  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10, type: 'regular' as 'regular' | 'gold' | 'speed' | 'ghost' },
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    powerTimer: 0,
    powerType: null as 'ghost' | 'freeze' | null,
    lastTick: 0,
    speed: 110,
    score: 0,
    isTurbo: false,
  });

  const bestScore = highScores['snake-neon'] || 0;

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    let newX: number, newY: number;
    let collision = true;
    while (collision) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      collision = s.snake.some(seg => seg.x === newX && seg.y === newY);
    }
    const rand = Math.random();
    let type: 'regular' | 'gold' | 'speed' | 'ghost' = 'regular';
    if (rand < 0.15) type = 'gold';
    else if (rand < 0.25) type = 'ghost';
    else if (rand < 0.35) type = 'speed';

    s.food = { x: newX!, y: newY!, type };
  }, []);

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.particles = [];
    s.powerTimer = 0;
    s.powerType = null;
    s.speed = 110 / gameModSpeed;
    s.score = 0;
    s.isTurbo = false;
    spawnFood();
    setScore(0);
    setMultiplier(1);
    setActivePowerup(null);
    setIsGameOver(false);
    setIsPaused(false);
  }, [gameModSpeed, spawnFood]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code || e.key) && s.dir.y === 0) {
        s.nextDir = { x: 0, y: -1 };
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code || e.key) && s.dir.y === 0) {
        s.nextDir = { x: 0, y: 1 };
      } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key) && s.dir.x === 0) {
        s.nextDir = { x: -1, y: 0 };
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key) && s.dir.x === 0) {
        s.nextDir = { x: 1, y: 0 };
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
        s.isTurbo = true;
        if (!hasStarted) {
          setHasStarted(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
        stateRef.current.isTurbo = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasStarted]);

  // Main game tick and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !isGameOver) {
        const interval = s.isTurbo ? s.speed * 0.45 : s.speed;

        if (timestamp - s.lastTick > interval) {
          s.lastTick = timestamp;
          s.dir = s.nextDir;

          // Head movement
          let headX = s.snake[0].x + s.dir.x;
          let headY = s.snake[0].y + s.dir.y;

          // Screen wrap-around
          if (headX < 0) headX = GRID_SIZE - 1;
          if (headX >= GRID_SIZE) headX = 0;
          if (headY < 0) headY = GRID_SIZE - 1;
          if (headY >= GRID_SIZE) headY = 0;

          // Self collision
          const hitSelf = s.snake.some(seg => seg.x === headX && seg.y === headY);
          if (hitSelf && s.powerType !== 'ghost' && !isPracticeMode) {
            soundEngine.playExplosion();
            soundEngine.playGameOver();
            saveHighScore('snake-neon', s.score);
            setIsGameOver(true);
          } else {
            const newHead = { x: headX, y: headY };
            s.snake.unshift(newHead);

            // Food check
            if (headX === s.food.x && headY === s.food.y) {
              soundEngine.playCoin();
              let points = 10;
              if (s.food.type === 'gold') points = 35;
              if (s.food.type === 'ghost') {
                s.powerType = 'ghost';
                s.powerTimer = 35;
                setActivePowerup('GHOST MODE (Invincible)');
                soundEngine.playPowerup();
              }
              if (s.food.type === 'speed') {
                s.speed = Math.max(50, s.speed - 12);
                soundEngine.playPowerup();
              }

              s.score += points;
              setScore(s.score);

              // Spawn particles
              for (let i = 0; i < 15; i++) {
                s.particles.push({
                  x: headX * CELL_SIZE + CELL_SIZE / 2,
                  y: headY * CELL_SIZE + CELL_SIZE / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 1,
                  color: s.food.type === 'gold' ? '#eab308' : '#10b981',
                });
              }

              spawnFood();
            } else {
              s.snake.pop();
            }

            // Powerup countdown
            if (s.powerTimer > 0) {
              s.powerTimer--;
              if (s.powerTimer === 0) {
                s.powerType = null;
                setActivePowerup(null);
              }
            }
          }
        }
      }

      // Drawing
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw Food
      const fx = s.food.x * CELL_SIZE + CELL_SIZE / 2;
      const fy = s.food.y * CELL_SIZE + CELL_SIZE / 2;
      ctx.shadowBlur = 15;
      if (s.food.type === 'gold') {
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
      } else if (s.food.type === 'ghost') {
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
      } else if (s.food.type === 'speed') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
      } else {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
      }
      ctx.beginPath();
      ctx.arc(fx, fy, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Snake
      s.snake.forEach((seg, idx) => {
        const isHead = idx === 0;
        const sx = seg.x * CELL_SIZE;
        const sy = seg.y * CELL_SIZE;

        if (s.powerType === 'ghost') {
          ctx.fillStyle = isHead ? '#c084fc' : '#e9d5ff';
          ctx.globalAlpha = 0.7;
        } else {
          ctx.fillStyle = isHead ? '#34d399' : '#059669';
          ctx.shadowBlur = isHead ? 15 : 0;
          ctx.shadowColor = '#10b981';
        }

        ctx.beginPath();
        ctx.roundRect(sx + 2, sy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Draw cute snake eyes on head
        if (isHead) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx + 8, sy + 8, 3, 0, Math.PI * 2);
          ctx.arc(sx + CELL_SIZE - 8, sy + 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

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
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isPaused, isGameOver, isPracticeMode, saveHighScore, spawnFood]);

  const changeDirTouch = (dx: number, dy: number) => {
    const s = stateRef.current;
    if ((dx !== 0 && s.dir.x === 0) || (dy !== 0 && s.dir.y === 0)) {
      s.nextDir = { x: dx, y: dy };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-emerald-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-slate-400 block">RECORD</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{bestScore}</span>
          </div>
          {activePowerup && (
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
              {activePowerup}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full max-w-lg aspect-square rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)] bg-slate-950"
        />

        {!hasStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">NEON SNAKE 2.0</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Collect glowing energy orbs, grab golden bonuses, and hold SPACE/SHIFT to activate Turbo sprint!
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              START GAME [SPACE]
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-red-400 mb-2">GAME OVER</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Final Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* D-PAD for Mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden w-48">
        <div />
        <button
          onClick={() => changeDirTouch(0, -1)}
          className="h-12 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-center"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => changeDirTouch(-1, 0)}
          className="h-12 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-center"
        >
          ◄
        </button>
        <button
          onClick={() => changeDirTouch(0, 1)}
          className="h-12 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-center"
        >
          ▼
        </button>
        <button
          onClick={() => changeDirTouch(1, 0)}
          className="h-12 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-center"
        >
          ►
        </button>
      </div>
    </div>
  );
};
