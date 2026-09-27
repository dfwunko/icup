import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause, Zap, Shield, Bomb } from 'lucide-react';

export const SpaceDefenderGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bombs, setBombs] = useState(2);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [wave, setWave] = useState(1);

  const stateRef = useRef({
    player: { x: 300, y: 450, vx: 0, width: 36, height: 32, shield: 0, weaponLevel: 1 },
    bullets: [] as Array<{ x: number; y: number; vx: number; vy: number; isEnemy?: boolean; color?: string }>,
    enemies: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'grunt' | 'speeder' | 'boss';
      hp: number;
      maxHp: number;
      size: number;
      shootTimer: number;
    }>,
    stars: [] as Array<{ x: number; y: number; speed: number; size: number; alpha: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    powerups: [] as Array<{ x: number; y: number; vy: number; type: 'laser' | 'shield' | 'bomb' }>,
    keys: { left: false, right: false, shoot: false },
    lastShootTime: 0,
    score: 0,
    lives: 3,
    bombs: 2,
    wave: 1,
  });

  const bestScore = highScores['space-defender'] || 0;

  const spawnWave = useCallback((waveNum: number) => {
    const s = stateRef.current;
    s.enemies = [];

    const isBossWave = waveNum % 5 === 0;

    if (isBossWave) {
      s.enemies.push({
        x: 300,
        y: 80,
        vx: 2.5,
        vy: 0,
        type: 'boss',
        hp: 30 + waveNum * 15,
        maxHp: 30 + waveNum * 15,
        size: 50,
        shootTimer: 0,
      });
    } else {
      const rows = Math.min(4, 2 + Math.floor(waveNum / 2));
      const cols = 6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          s.enemies.push({
            x: 100 + c * 75,
            y: 50 + r * 50,
            vx: 1.5 + waveNum * 0.2,
            vy: 0,
            type: r === 0 ? 'speeder' : 'grunt',
            hp: r === 0 ? 2 : 1,
            maxHp: r === 0 ? 2 : 1,
            size: r === 0 ? 18 : 16,
            shootTimer: Math.random() * 100,
          });
        }
      }
    }
    setWave(waveNum);
  }, []);

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.player = { x: 300, y: 440, vx: 0, width: 36, height: 32, shield: isPracticeMode ? 999 : 0, weaponLevel: 1 };
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.powerups = [];
    s.score = 0;
    s.lives = 3;
    s.bombs = 2;
    s.wave = 1;

    // Stars background
    s.stars = [];
    for (let i = 0; i < 80; i++) {
      s.stars.push({
        x: Math.random() * 600,
        y: Math.random() * 500,
        speed: 0.5 + Math.random() * 2,
        size: Math.random() * 2 + 0.5,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    setScore(0);
    setLives(3);
    setBombs(2);
    setWave(1);
    setIsGameOver(false);
    setIsPaused(false);
    spawnWave(1);
  }, [isPracticeMode, spawnWave]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Trigger Bomb
  const triggerSuperBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.bombs <= 0) return;
    s.bombs--;
    setBombs(s.bombs);
    soundEngine.playExplosion();

    // Damage all enemies
    for (const e of s.enemies) {
      e.hp -= 20;
      for (let i = 0; i < 15; i++) {
        s.particles.push({
          x: e.x,
          y: e.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 1,
          color: '#f43f5e',
        });
      }
    }
    s.bullets = s.bullets.filter(b => !b.isEnemy);
  }, []);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) s.keys.left = true;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) s.keys.right = true;
      if (e.code === 'Space') {
        s.keys.shoot = true;
        if (!hasStarted) setHasStarted(true);
      }
      if (e.key === 'b' || e.key === 'B') {
        triggerSuperBomb();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) s.keys.left = false;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) s.keys.right = false;
      if (e.code === 'Space') s.keys.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasStarted, triggerSuperBomb]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !isGameOver) {
        // Player movement
        if (s.keys.left) s.player.vx = Math.max(-8, s.player.vx - 1.2);
        else if (s.keys.right) s.player.vx = Math.min(8, s.player.vx + 1.2);
        else s.player.vx *= 0.85;

        s.player.x = Math.max(20, Math.min(canvas.width - 20, s.player.x + s.player.vx));

        // Player shooting
        if (s.keys.shoot && timestamp - s.lastShootTime > 150) {
          s.lastShootTime = timestamp;
          soundEngine.playLaser();
          if (s.player.weaponLevel === 1) {
            s.bullets.push({ x: s.player.x, y: s.player.y - 18, vx: 0, vy: -12, color: '#38bdf8' });
          } else if (s.player.weaponLevel === 2) {
            s.bullets.push({ x: s.player.x - 10, y: s.player.y - 14, vx: 0, vy: -12, color: '#38bdf8' });
            s.bullets.push({ x: s.player.x + 10, y: s.player.y - 14, vx: 0, vy: -12, color: '#38bdf8' });
          } else {
            s.bullets.push({ x: s.player.x, y: s.player.y - 18, vx: 0, vy: -12, color: '#ec4899' });
            s.bullets.push({ x: s.player.x - 12, y: s.player.y - 12, vx: -2.5, vy: -11, color: '#38bdf8' });
            s.bullets.push({ x: s.player.x + 12, y: s.player.y - 12, vx: 2.5, vy: -11, color: '#38bdf8' });
          }
        }

        // Bullets update
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          // Out of screen
          if (b.y < -10 || b.y > canvas.height + 10 || b.x < -10 || b.x > canvas.width + 10) {
            s.bullets.splice(i, 1);
            continue;
          }

          // Enemy bullet vs player
          if (b.isEnemy) {
            const dist = Math.hypot(b.x - s.player.x, b.y - s.player.y);
            if (dist < 18) {
              s.bullets.splice(i, 1);
              if (s.player.shield > 0) {
                s.player.shield--;
                soundEngine.playHit();
              } else if (!isPracticeMode) {
                soundEngine.playExplosion();
                s.lives--;
                setLives(s.lives);
                s.player.weaponLevel = 1;
                if (s.lives <= 0) {
                  soundEngine.playGameOver();
                  saveHighScore('space-defender', s.score);
                  setIsGameOver(true);
                }
              }
              continue;
            }
          } else {
            // Player bullet vs enemies
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const e = s.enemies[j];
              const dist = Math.hypot(b.x - e.x, b.y - e.y);
              if (dist < e.size + 6) {
                s.bullets.splice(i, 1);
                e.hp--;
                soundEngine.playHit();

                if (e.hp <= 0) {
                  soundEngine.playExplosion();
                  const pts = e.type === 'boss' ? 500 : e.type === 'speeder' ? 40 : 20;
                  s.score += pts;
                  setScore(s.score);

                  // Particles
                  for (let p = 0; p < 16; p++) {
                    s.particles.push({
                      x: e.x,
                      y: e.y,
                      vx: (Math.random() - 0.5) * 8,
                      vy: (Math.random() - 0.5) * 8,
                      life: 1,
                      color: e.type === 'boss' ? '#a855f7' : '#f43f5e',
                    });
                  }

                  // Chance of powerup
                  if (Math.random() < 0.25) {
                    const types: Array<'laser' | 'shield' | 'bomb'> = ['laser', 'shield', 'bomb'];
                    s.powerups.push({
                      x: e.x,
                      y: e.y,
                      vy: 2,
                      type: types[Math.floor(Math.random() * types.length)],
                    });
                  }

                  s.enemies.splice(j, 1);
                }
                break;
              }
            }
          }
        }

        // Enemies update
        let edgeHit = false;
        for (const e of s.enemies) {
          e.x += e.vx;
          if (e.x < 30 || e.x > canvas.width - 30) {
            edgeHit = true;
          }

          // Enemy shooting
          e.shootTimer++;
          if (e.shootTimer > 90 + Math.random() * 80) {
            e.shootTimer = 0;
            if (e.type === 'boss') {
              s.bullets.push({ x: e.x - 20, y: e.y + 20, vx: -1.5, vy: 4.5, isEnemy: true, color: '#f43f5e' });
              s.bullets.push({ x: e.x + 20, y: e.y + 20, vx: 1.5, vy: 4.5, isEnemy: true, color: '#f43f5e' });
            } else {
              s.bullets.push({ x: e.x, y: e.y + 10, vx: 0, vy: 4, isEnemy: true, color: '#f43f5e' });
            }
          }
        }

        if (edgeHit) {
          for (const e of s.enemies) {
            e.vx = -e.vx;
            if (e.type !== 'boss') {
              e.y += 12;
            }
          }
        }

        // Powerups update
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const pu = s.powerups[i];
          pu.y += pu.vy;
          const dist = Math.hypot(pu.x - s.player.x, pu.y - s.player.y);
          if (dist < 26) {
            soundEngine.playPowerup();
            if (pu.type === 'laser') s.player.weaponLevel = Math.min(3, s.player.weaponLevel + 1);
            if (pu.type === 'shield') s.player.shield = Math.min(3, s.player.shield + 1);
            if (pu.type === 'bomb') {
              s.bombs++;
              setBombs(s.bombs);
            }
            s.powerups.splice(i, 1);
            continue;
          }
          if (pu.y > canvas.height + 20) {
            s.powerups.splice(i, 1);
          }
        }

        // Next Wave check
        if (s.enemies.length === 0) {
          s.wave++;
          spawnWave(s.wave);
          soundEngine.playCoin();
        }
      }

      // Render Background Starfield
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const st of s.stars) {
        st.y += st.speed;
        if (st.y > canvas.height) st.y = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.fillRect(st.x, st.y, st.size, st.size);
      }

      // Render Bullets
      for (const b of s.bullets) {
        ctx.fillStyle = b.color || '#38bdf8';
        ctx.shadowColor = b.color || '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
        ctx.shadowBlur = 0;
      }

      // Render Enemies
      for (const e of s.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.type === 'boss') {
          // Boss Ship
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(0, 30);
          ctx.lineTo(-40, -20);
          ctx.lineTo(0, -30);
          ctx.lineTo(40, -20);
          ctx.closePath();
          ctx.fill();

          // Boss Health Bar
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-35, -45, 70, 6);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-35, -45, 70 * (e.hp / e.maxHp), 6);
        } else {
          // Regular Alien
          ctx.fillStyle = e.type === 'speeder' ? '#f43f5e' : '#fb923c';
          ctx.shadowColor = e.type === 'speeder' ? '#f43f5e' : '#fb923c';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.lineTo(-14, -10);
          ctx.lineTo(0, -4);
          ctx.lineTo(14, -10);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Powerups
      for (const pu of s.powerups) {
        ctx.fillStyle = pu.type === 'laser' ? '#ec4899' : pu.type === 'shield' ? '#06b6d4' : '#eab308';
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      // Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
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

      // Render Player Starship
      if (!isGameOver) {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);

        // Shield aura
        if (s.player.shield > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Ship body
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-18, 14);
        ctx.lineTo(0, 6);
        ctx.lineTo(18, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Thruster flame
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.lineTo(0, 16 + Math.random() * 6);
        ctx.lineTo(6, 8);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isPaused, isGameOver, isPracticeMode, saveHighScore, spawnWave]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top HUD */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-rose-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-rose-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">WAVE</span>
            <span className="text-lg font-bold font-mono text-rose-300">{wave}</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-4.5 rounded-xs transition-all ${
                  i < lives ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerSuperBomb}
            className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Super Bomb (B Key)"
          >
            <Bomb className="w-4 h-4" /> x{bombs}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
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
          className="w-full max-w-xl aspect-5/4 rounded-2xl border-2 border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.2)] bg-slate-950"
        />

        {!hasStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">VORTEX INVADERS</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Defend the galaxy against alien swarms & motherships! Left/Right to steer, SPACE to fire, B for screen-clearing bomb.
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                soundEngine.playJump();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              LAUNCH STARSHIP [SPACE]
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-red-500 mb-2">HULL DESTROYED</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Final Score: <span className="text-rose-400 font-bold">{score}</span></p>
            <button
              onClick={() => {
                initGame();
                setHasStarted(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="flex md:hidden items-center justify-between w-full max-w-md mt-4 px-4">
        <div className="flex space-x-2">
          <button
            onTouchStart={() => { stateRef.current.keys.left = true; }}
            onTouchEnd={() => { stateRef.current.keys.left = false; }}
            className="w-16 h-14 bg-slate-900 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-lg active:bg-rose-500/30"
          >
            ◄
          </button>
          <button
            onTouchStart={() => { stateRef.current.keys.right = true; }}
            onTouchEnd={() => { stateRef.current.keys.right = false; }}
            className="w-16 h-14 bg-slate-900 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-lg active:bg-rose-500/30"
          >
            ►
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onTouchStart={() => triggerSuperBomb()}
            className="w-16 h-14 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-xs active:bg-amber-500/40 flex items-center justify-center"
          >
            BOMB
          </button>
          <button
            onTouchStart={() => { stateRef.current.keys.shoot = true; }}
            onTouchEnd={() => { stateRef.current.keys.shoot = false; }}
            className="w-20 h-14 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-xs active:bg-rose-500/40 flex items-center justify-center"
          >
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
};
