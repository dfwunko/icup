import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause, Zap, Shield } from 'lucide-react';

export const SlopeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Game state in ref for 60fps canvas loop
  const stateRef = useRef({
    ballX: 0,
    ballY: 0,
    ballZ: 0,
    ballSpeedX: 0,
    speed: 12,
    score: 0,
    platforms: [] as Array<{
      z: number;
      x: number;
      width: number;
      length: number;
      tilt: number;
      obstacles: Array<{ x: number; z: number; width: number; height: number }>;
      crystals: Array<{ x: number; z: number; collected: boolean }>;
    }>,
    keys: { left: false, right: false, space: false },
    particles: [] as Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: string }>,
    cameraZ: -50,
    onGround: true,
    invincibleTimer: 0,
    isDead: false,
  });

  const bestScore = highScores['slope-3d'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.ballX = 0;
    s.ballY = 0;
    s.ballZ = 0;
    s.ballSpeedX = 0;
    s.speed = 14 * gameModSpeed;
    s.score = 0;
    s.cameraZ = -60;
    s.onGround = true;
    s.invincibleTimer = isPracticeMode ? 999999 : 0;
    s.isDead = false;
    s.particles = [];
    s.platforms = [];

    // Generate initial flat runway
    let currentZ = 0;
    for (let i = 0; i < 15; i++) {
      const length = 180 + Math.random() * 80;
      const width = i < 3 ? 160 : 120 - Math.min(40, i * 2);
      const x = i < 3 ? 0 : (Math.random() - 0.5) * 80;
      const tilt = i < 3 ? 0 : (Math.random() - 0.5) * 0.4;

      const obstacles: Array<{ x: number; z: number; width: number; height: number }> = [];
      const crystals: Array<{ x: number; z: number; collected: boolean }> = [];

      if (i >= 2) {
        // Add obstacles
        const numObs = Math.floor(Math.random() * 2) + 1;
        for (let o = 0; o < numObs; o++) {
          obstacles.push({
            x: (Math.random() - 0.5) * (width * 0.7),
            z: currentZ + 40 + Math.random() * (length - 80),
            width: 26,
            height: 28,
          });
        }
        // Add crystals
        crystals.push({
          x: (Math.random() - 0.5) * (width * 0.6),
          z: currentZ + length * 0.5,
          collected: false,
        });
      }

      s.platforms.push({
        z: currentZ,
        x,
        width,
        length,
        tilt,
        obstacles,
        crystals,
      });

      currentZ += length + (i < 3 ? 0 : Math.random() * 25);
    }

    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsNewHigh(false);
  }, [gameModSpeed, isPracticeMode]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
        stateRef.current.keys.left = true;
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
        stateRef.current.keys.right = true;
      }
      if (e.code === 'Space') {
        stateRef.current.keys.space = true;
        if (!hasStarted) {
          setHasStarted(true);
        }
        if (stateRef.current.isDead) {
          initGame();
          setHasStarted(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
        stateRef.current.keys.left = false;
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
        stateRef.current.keys.right = false;
      }
      if (e.code === 'Space') {
        stateRef.current.keys.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasStarted, initGame]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !s.isDead) {
        // Accelerate forward
        s.speed = Math.min(32, s.speed + 0.002 * gameModSpeed);
        s.ballZ += s.speed;
        s.cameraZ = s.ballZ - 80;

        // Steer left/right
        if (s.keys.left) s.ballSpeedX = Math.max(-12, s.ballSpeedX - 1.2);
        else if (s.keys.right) s.ballSpeedX = Math.min(12, s.ballSpeedX + 1.2);
        else s.ballSpeedX *= 0.88;

        s.ballX += s.ballSpeedX;

        // Find platform beneath ball
        let currentPlat = null;
        for (const p of s.platforms) {
          if (s.ballZ >= p.z && s.ballZ <= p.z + p.length) {
            currentPlat = p;
            break;
          }
        }

        if (currentPlat) {
          const platHalfW = currentPlat.width / 2;
          const relativeX = s.ballX - currentPlat.x;

          // Check if fallen off side
          if (Math.abs(relativeX) > platHalfW + 6) {
            if (!isPracticeMode) {
              s.isDead = true;
              soundEngine.playHit();
              soundEngine.playGameOver();
              const isHigh = saveHighScore('slope-3d', Math.floor(s.score));
              setIsNewHigh(isHigh);
              setIsGameOver(true);
            }
          }

          // Check obstacles
          for (const obs of currentPlat.obstacles) {
            const dz = Math.abs(s.ballZ - obs.z);
            const dx = Math.abs(s.ballX - (currentPlat.x + obs.x));
            if (dz < 15 && dx < obs.width / 2 + 10) {
              if (!isPracticeMode) {
                s.isDead = true;
                soundEngine.playExplosion();
                soundEngine.playGameOver();
                const isHigh = saveHighScore('slope-3d', Math.floor(s.score));
                setIsNewHigh(isHigh);
                setIsGameOver(true);
                // Particle blast
                for (let i = 0; i < 30; i++) {
                  s.particles.push({
                    x: s.ballX,
                    y: s.ballY,
                    z: s.ballZ,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    vz: (Math.random() - 0.5) * 15,
                    life: 1,
                    color: '#ff0055',
                  });
                }
              }
            }
          }

          // Check crystals
          for (const cry of currentPlat.crystals) {
            if (!cry.collected) {
              const dz = Math.abs(s.ballZ - cry.z);
              const dx = Math.abs(s.ballX - (currentPlat.x + cry.x));
              if (dz < 20 && dx < 20) {
                cry.collected = true;
                s.score += 50;
                soundEngine.playCoin();
                for (let i = 0; i < 15; i++) {
                  s.particles.push({
                    x: s.ballX,
                    y: s.ballY - 10,
                    z: s.ballZ,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    vz: (Math.random() - 0.5) * 10,
                    life: 1,
                    color: '#00ffff',
                  });
                }
              }
            }
          }
        } else {
          // In gap between platforms!
          if (!isPracticeMode) {
            s.isDead = true;
            soundEngine.playGameOver();
            const isHigh = saveHighScore('slope-3d', Math.floor(s.score));
            setIsNewHigh(isHigh);
            setIsGameOver(true);
          }
        }

        // Add distance score
        s.score += s.speed * 0.05;
        setScore(Math.floor(s.score));

        // Recycle / spawn new platforms forward
        const lastPlat = s.platforms[s.platforms.length - 1];
        if (lastPlat && lastPlat.z - s.ballZ < 2000) {
          const length = 200 + Math.random() * 120;
          const width = Math.max(70, 120 - (s.score / 200));
          const x = (Math.random() - 0.5) * 140;
          const tilt = (Math.random() - 0.5) * 0.5;

          const obstacles: Array<{ x: number; z: number; width: number; height: number }> = [];
          const crystals: Array<{ x: number; z: number; collected: boolean }> = [];

          const numObs = Math.floor(Math.random() * 3) + 1;
          for (let o = 0; o < numObs; o++) {
            obstacles.push({
              x: (Math.random() - 0.5) * (width * 0.7),
              z: lastPlat.z + lastPlat.length + 30 + Math.random() * (length - 60),
              width: 24,
              height: 26,
            });
          }

          crystals.push({
            x: (Math.random() - 0.5) * (width * 0.5),
            z: lastPlat.z + lastPlat.length + length * 0.5,
            collected: false,
          });

          s.platforms.push({
            z: lastPlat.z + lastPlat.length + 15 + Math.random() * 20,
            x,
            width,
            length,
            tilt,
            obstacles,
            crystals,
          });
        }

        // Prune old platforms behind camera
        if (s.platforms.length > 25) {
          s.platforms = s.platforms.filter(p => p.z + p.length > s.cameraZ - 100);
        }

        // Spawn ball trail particles
        if (Math.random() < 0.6) {
          s.particles.push({
            x: s.ballX + (Math.random() - 0.5) * 4,
            y: s.ballY + 6,
            z: s.ballZ - 6,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: -2,
            life: 0.8,
            color: '#00f0ff',
          });
        }
      }

      // 3D Projection Helper
      const fov = 340;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 50;

      const project = (x: number, y: number, z: number) => {
        const relativeZ = z - s.cameraZ;
        if (relativeZ <= 5) return null;
        const scale = fov / relativeZ;
        return {
          px: cx + x * scale,
          py: cy + y * scale,
          scale,
        };
      };

      // Clear Frame with Dark Space / Cyber Grid
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Starfield / Horizon
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, cy);
        ctx.lineTo(i * 1.5 - canvas.width * 0.25, canvas.height);
        ctx.stroke();
      }

      // Draw Platforms (back to front sorting)
      const sortedPlatforms = [...s.platforms].sort((a, b) => b.z - a.z);

      for (const p of sortedPlatforms) {
        if (p.z + p.length < s.cameraZ || p.z - s.cameraZ > 1400) continue;

        const p1 = project(p.x - p.width / 2, 15, p.z);
        const p2 = project(p.x + p.width / 2, 15, p.z);
        const p3 = project(p.x + p.width / 2, 15, p.z + p.length);
        const p4 = project(p.x - p.width / 2, 15, p.z + p.length);

        if (p1 && p2 && p3 && p4) {
          // Platform surface
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.lineTo(p3.px, p3.py);
          ctx.lineTo(p4.px, p4.py);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, p1.py, 0, p3.py);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#0284c7');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = Math.max(1, p1.scale * 1.5);
          ctx.stroke();

          // Obstacles on platform
          for (const obs of p.obstacles) {
            const op1 = project(p.x + obs.x - obs.width / 2, 15, obs.z);
            const op2 = project(p.x + obs.x + obs.width / 2, 15, obs.z);
            const top1 = project(p.x + obs.x - obs.width / 2, 15 - obs.height, obs.z);
            const top2 = project(p.x + obs.x + obs.width / 2, 15 - obs.height, obs.z);

            if (op1 && op2 && top1 && top2) {
              ctx.fillStyle = '#f43f5e';
              ctx.shadowColor = '#f43f5e';
              ctx.shadowBlur = 12;

              ctx.beginPath();
              ctx.moveTo(op1.px, op1.py);
              ctx.lineTo(op2.px, op2.py);
              ctx.lineTo(top2.px, top2.py);
              ctx.lineTo(top1.px, top1.py);
              ctx.closePath();
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }

          // Crystals
          for (const cry of p.crystals) {
            if (cry.collected) continue;
            const cp = project(p.x + cry.x, 2, cry.z);
            if (cp) {
              const r = Math.max(3, 8 * cp.scale);
              ctx.fillStyle = '#06b6d4';
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(cp.px, cp.py, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;
        pt.life -= 0.03;

        if (pt.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        const proj = project(pt.x, pt.y, pt.z);
        if (proj) {
          ctx.globalAlpha = Math.max(0, pt.life);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, Math.max(1.5, 4 * proj.scale), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Draw Player Ball
      if (!s.isDead) {
        const bp = project(s.ballX, s.ballY, s.ballZ);
        if (bp) {
          const ballRadius = Math.max(6, 15 * bp.scale);

          // Glow shadow
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 18;

          // Ball body gradient
          const ballGrad = ctx.createRadialGradient(
            bp.px - ballRadius * 0.3,
            bp.py - ballRadius * 0.3,
            ballRadius * 0.1,
            bp.px,
            bp.py,
            ballRadius
          );
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.4, '#06b6d4');
          ballGrad.addColorStop(1, '#0e7490');

          ctx.fillStyle = ballGrad;
          ctx.beginPath();
          ctx.arc(bp.px, bp.py, ballRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#a5f3fc';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isPaused, gameModSpeed, isPracticeMode, saveHighScore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 overflow-hidden">
      {/* Top HUD */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-cyan-400 block">DISTANCE</span>
            <span className="text-2xl font-black font-mono text-white tracking-wider">{score}m</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-slate-400 block">BEST RECORD</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{bestScore}m</span>
          </div>
          {isPracticeMode && (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Practice Mode Active
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full max-w-4xl h-auto aspect-16/10 rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-slate-950"
      />

      {/* Start / Game Over Overlay */}
      {!hasStarted && !isGameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6">
          <div className="text-center max-w-md">
            <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wider mb-2 font-['Outfit']">SLOPE 3D CYBER RUN</h2>
            <p className="text-slate-400 text-sm mb-6">
              Steer the high-speed neon sphere down endless floating platforms. Avoid red barriers and keep your balance!
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 cursor-pointer"
            >
              LAUNCH RUNNER [SPACE]
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6">
          <div className="text-center max-w-md bg-slate-900/90 border border-red-500/30 p-8 rounded-2xl shadow-2xl">
            <span className="text-red-400 font-mono text-sm tracking-widest block mb-2">RUN TERMINATED</span>
            <h2 className="text-4xl font-black text-white mb-4">GAME OVER</h2>
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-6">
              <div className="text-xs text-slate-400">FINAL DISTANCE</div>
              <div className="text-3xl font-mono font-bold text-cyan-400">{score}m</div>
              {isNewHigh && (
                <div className="mt-2 text-xs font-bold text-amber-400 animate-pulse">
                  ⭐ NEW HIGH SCORE RECORD!
                </div>
              )}
            </div>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              PLAY AGAIN [SPACE]
            </button>
          </div>
        </div>
      )}

      {/* Touch On-Screen Controls */}
      <div className="flex md:hidden items-center justify-between w-full max-w-sm mt-4 px-6 z-20">
        <button
          onTouchStart={() => { stateRef.current.keys.left = true; }}
          onTouchEnd={() => { stateRef.current.keys.left = false; }}
          className="w-20 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-xl text-cyan-300 font-bold active:bg-cyan-500/30 flex items-center justify-center text-xl"
        >
          ◄ LEFT
        </button>
        <button
          onTouchStart={() => { stateRef.current.keys.right = true; }}
          onTouchEnd={() => { stateRef.current.keys.right = false; }}
          className="w-20 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-xl text-cyan-300 font-bold active:bg-cyan-500/30 flex items-center justify-center text-xl"
        >
          RIGHT ►
        </button>
      </div>
    </div>
  );
};
