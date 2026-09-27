import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause } from 'lucide-react';

export const DinoRunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const stateRef = useRef({
    dino: { x: 80, y: 280, vy: 0, width: 36, height: 44, isDucking: false, jumpsLeft: 2, onGround: true },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: 'cactus' | 'bird' | 'laser' }>,
    groundOffset: 0,
    speed: 7,
    score: 0,
    spawnTimer: 0,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
  });

  const bestScore = highScores['dino-cyber'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.dino = { x: 80, y: 280, vy: 0, width: 36, height: 44, isDucking: false, jumpsLeft: 2, onGround: true };
    s.obstacles = [];
    s.groundOffset = 0;
    s.speed = 7 * gameModSpeed;
    s.score = 0;
    s.spawnTimer = 0;
    s.particles = [];

    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, [gameModSpeed]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (isGameOver) {
      initGame();
      setHasStarted(true);
      return;
    }
    if (!hasStarted) {
      setHasStarted(true);
    }
    if (s.dino.jumpsLeft > 0) {
      s.dino.vy = -11;
      s.dino.jumpsLeft--;
      s.dino.onGround = false;
      soundEngine.playJump();

      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: s.dino.x + 10,
          y: s.dino.y + s.dino.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2,
          life: 0.6,
          color: '#14b8a6',
        });
      }
    }
  }, [hasStarted, initGame, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['Space', 'ArrowUp', 'KeyW', 'w', 'W'].includes(e.code || e.key)) {
        e.preventDefault();
        jump();
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code || e.key)) {
        s.dino.isDucking = true;
        s.dino.height = 24;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code || e.key)) {
        s.dino.isDucking = false;
        s.dino.height = 44;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump]);

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
        // Dino gravity physics
        s.dino.vy += 0.65;
        s.dino.y += s.dino.vy;

        const groundLevel = 280;
        if (s.dino.y >= groundLevel) {
          s.dino.y = groundLevel;
          s.dino.vy = 0;
          s.dino.onGround = true;
          s.dino.jumpsLeft = 2;
        }

        // Speed acceleration
        s.speed = Math.min(18, s.speed + 0.0015);
        s.score += s.speed * 0.03;
        setScore(Math.floor(s.score));

        // Obstacles spawn
        s.spawnTimer++;
        if (s.spawnTimer > Math.max(45, 90 - Math.floor(s.score / 50))) {
          s.spawnTimer = 0;
          const rand = Math.random();
          if (rand < 0.6) {
            // Cyber Cactus
            s.obstacles.push({
              x: canvas.width + 20,
              y: groundLevel + 44 - 38,
              width: 24,
              height: 38,
              type: 'cactus',
            });
          } else {
            // Flying Cyber Drone
            s.obstacles.push({
              x: canvas.width + 20,
              y: groundLevel - 25,
              width: 30,
              height: 20,
              type: 'bird',
            });
          }
        }

        // Obstacles update & collision
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          // AABB Hitbox
          const dinoRight = s.dino.x + s.dino.width - 6;
          const dinoLeft = s.dino.x + 6;
          const dinoTop = s.dino.y + (s.dino.isDucking ? 20 : 6);
          const dinoBottom = s.dino.y + s.dino.height;

          const obsRight = obs.x + obs.width - 4;
          const obsLeft = obs.x + 4;
          const obsTop = obs.y + 4;
          const obsBottom = obs.y + obs.height;

          if (dinoRight > obsLeft && dinoLeft < obsRight && dinoBottom > obsTop && dinoTop < obsBottom) {
            if (!isPracticeMode) {
              soundEngine.playExplosion();
              soundEngine.playGameOver();
              saveHighScore('dino-cyber', Math.floor(s.score));
              setIsGameOver(true);
            }
          }

          if (obs.x < -50) {
            s.obstacles.splice(i, 1);
          }
        }

        s.groundOffset += s.speed;
      }

      // Render
      ctx.fillStyle = '#060a15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground Line
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 324);
      ctx.lineTo(canvas.width, 324);
      ctx.stroke();

      // Ground texture dots
      ctx.fillStyle = '#0d9488';
      for (let i = 0; i < canvas.width; i += 25) {
        const gx = (i - (s.groundOffset % 25));
        ctx.fillRect(gx, 330, 8, 2);
        ctx.fillRect((gx + 12) % canvas.width, 336, 4, 2);
      }

      // Draw Obstacles
      for (const obs of s.obstacles) {
        if (obs.type === 'cactus') {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillRect(obs.x - 6, obs.y + 10, 6, 12);
          ctx.fillRect(obs.x + obs.width, obs.y + 6, 6, 12);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width, obs.y + obs.height / 2);
          ctx.lineTo(obs.x, obs.y);
          ctx.lineTo(obs.x + 8, obs.y + obs.height / 2);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Dino
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 12;

      if (s.dino.isDucking) {
        ctx.fillRect(s.dino.x, s.dino.y + 20, s.dino.width + 12, s.dino.height);
      } else {
        ctx.fillRect(s.dino.x, s.dino.y, s.dino.width, s.dino.height);
        // Dino Head
        ctx.fillRect(s.dino.x + 12, s.dino.y - 10, 26, 18);
        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(s.dino.x + 28, s.dino.y - 6, 4, 4);
      }
      ctx.shadowBlur = 0;

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
  }, [hasStarted, isPaused, isGameOver, isPracticeMode, saveHighScore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top HUD */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-teal-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-teal-400 block">DISTANCE</span>
            <span className="text-2xl font-black font-mono text-white">{score}m</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">BEST</span>
            <span className="text-lg font-bold font-mono text-teal-300">{bestScore}m</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-teal-500 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-teal-500 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={650}
          height={380}
          className="w-full max-w-xl aspect-13/8 rounded-2xl border-2 border-teal-500/40 shadow-[0_0_35px_rgba(20,184,166,0.2)] bg-slate-950"
        />

        {!hasStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">CHROME DINO 2099</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Press SPACE or UP to jump (tap twice for DOUBLE JUMP), and DOWN to duck under drones!
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_25px_rgba(20,184,166,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              RUN [SPACE]
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-teal-400 mb-2">COLLISION DETECTED</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Distance: <span className="text-teal-400 font-bold">{score}m</span></p>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center justify-between w-full max-w-sm mt-4 px-6">
        <button
          onTouchStart={() => {
            stateRef.current.dino.isDucking = true;
            stateRef.current.dino.height = 24;
          }}
          onTouchEnd={() => {
            stateRef.current.dino.isDucking = false;
            stateRef.current.dino.height = 44;
          }}
          className="w-24 h-14 bg-slate-900 border border-teal-500/40 rounded-xl text-teal-300 font-bold"
        >
          DUCK ▼
        </button>
        <button
          onTouchStart={jump}
          className="w-24 h-14 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-300 font-bold"
        >
          JUMP ▲
        </button>
      </div>
    </div>
  );
};
