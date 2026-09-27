import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw } from 'lucide-react';

interface Lane {
  type: 'grass' | 'road' | 'river' | 'train';
  speed: number;
  direction: 1 | -1;
  items: Array<{ x: number; width: number; speed: number; color?: string }>;
}

export const CrossyRoadGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed, isPracticeMode } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const GRID_SIZE = 40;
  const COLS = 13;
  const ROWS = 12;

  const stateRef = useRef({
    player: { x: 6, y: 10, targetX: 6, targetY: 10, jumpProgress: 1 },
    lanes: [] as Lane[],
    maxRowReached: 0,
    score: 0,
    cameraY: 0,
  });

  const bestScore = highScores['crossy-cyber'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.player = { x: 6, y: 10, targetX: 6, targetY: 10, jumpProgress: 1 };
    s.maxRowReached = 0;
    s.score = 0;
    s.cameraY = 0;

    // Generate lanes
    const lanes: Lane[] = [];
    for (let r = 0; r < 100; r++) {
      if (r === 0 || r === 1) {
        lanes.push({ type: 'grass', speed: 0, direction: 1, items: [] });
      } else {
        const rand = Math.random();
        if (rand < 0.2) {
          lanes.push({ type: 'grass', speed: 0, direction: 1, items: [] });
        } else if (rand < 0.55) {
          // Road with cars
          const speed = (1.5 + Math.random() * 2.5) * gameModSpeed;
          const dir = Math.random() < 0.5 ? 1 : -1;
          const items: Array<{ x: number; width: number; speed: number; color?: string }> = [];
          for (let i = 0; i < 3; i++) {
            items.push({
              x: i * 200 + Math.random() * 50,
              width: 50 + Math.random() * 20,
              speed,
              color: '#f43f5e',
            });
          }
          lanes.push({ type: 'road', speed, direction: dir, items });
        } else if (rand < 0.8) {
          // River with floating logs
          const speed = (1.2 + Math.random() * 1.8) * gameModSpeed;
          const dir = Math.random() < 0.5 ? 1 : -1;
          const items: Array<{ x: number; width: number; speed: number; color?: string }> = [];
          for (let i = 0; i < 3; i++) {
            items.push({
              x: i * 180 + Math.random() * 40,
              width: 70 + Math.random() * 30,
              speed,
              color: '#06b6d4',
            });
          }
          lanes.push({ type: 'river', speed, direction: dir, items });
        } else {
          // Fast Bullet Train Rail
          const speed = 7 * gameModSpeed;
          const dir = Math.random() < 0.5 ? 1 : -1;
          const items: Array<{ x: number; width: number; speed: number; color?: string }> = [
            { x: -200, width: 180, speed, color: '#eab308' },
          ];
          lanes.push({ type: 'train', speed, direction: dir, items });
        }
      }
    }

    s.lanes = lanes;
    setScore(0);
    setIsGameOver(false);
  }, [gameModSpeed]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isGameOver) return;
    const s = stateRef.current;

    const newX = Math.max(0, Math.min(COLS - 1, s.player.targetX + dx));
    const newY = s.player.targetY - dy; // Moving up means higher row in road

    s.player.targetX = newX;
    s.player.targetY = newY;
    soundEngine.playJump();

    // Score advancement
    const forwardSteps = 10 - newY;
    if (forwardSteps > s.maxRowReached) {
      s.maxRowReached = forwardSteps;
      s.score = forwardSteps * 10;
      setScore(s.score);
    }
  }, [isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code || e.key)) {
        e.preventDefault();
        movePlayer(0, 1);
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code || e.key)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      // Smooth move interpolation
      s.player.x += (s.player.targetX - s.player.x) * 0.35;
      s.player.y += (s.player.targetY - s.player.y) * 0.35;

      // Camera follows player
      const targetCameraY = (10 - s.player.y) * GRID_SIZE;
      s.cameraY += (targetCameraY - s.cameraY) * 0.1;

      // Update lane items
      const currentLaneIndex = 10 - Math.round(s.player.y);
      const curLane = s.lanes[currentLaneIndex];

      let onLog = false;

      for (let r = 0; r < s.lanes.length; r++) {
        const lane = s.lanes[r];
        for (const item of lane.items) {
          item.x += item.speed * lane.direction;

          // Wrap around canvas
          if (lane.direction === 1 && item.x > canvas.width + 100) {
            item.x = -item.width - 50;
          } else if (lane.direction === -1 && item.x < -item.width - 100) {
            item.x = canvas.width + 50;
          }

          // Check collisions with player
          if (r === currentLaneIndex && !isGameOver) {
            const playerPixelX = s.player.x * GRID_SIZE + GRID_SIZE / 2;

            if (lane.type === 'road' || lane.type === 'train') {
              if (playerPixelX > item.x && playerPixelX < item.x + item.width) {
                if (!isPracticeMode) {
                  soundEngine.playExplosion();
                  soundEngine.playGameOver();
                  saveHighScore('crossy-cyber', s.score);
                  setIsGameOver(true);
                }
              }
            } else if (lane.type === 'river') {
              if (playerPixelX > item.x && playerPixelX < item.x + item.width) {
                onLog = true;
                // Drift with log
                s.player.targetX += (item.speed * lane.direction) / GRID_SIZE;
                s.player.targetX = Math.max(0, Math.min(COLS - 1, s.player.targetX));
              }
            }
          }
        }
      }

      // Check if drowned in river without log
      if (curLane && curLane.type === 'river' && !onLog && !isGameOver) {
        if (!isPracticeMode) {
          soundEngine.playHit();
          soundEngine.playGameOver();
          saveHighScore('crossy-cyber', s.score);
          setIsGameOver(true);
        }
      }

      // Draw
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, s.cameraY);

      // Render Lanes
      for (let r = 0; r < s.lanes.length; r++) {
        const lane = s.lanes[r];
        const laneY = 400 - r * GRID_SIZE;

        if (lane.type === 'grass') {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(0, laneY, canvas.width, GRID_SIZE);
        } else if (lane.type === 'road') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, laneY, canvas.width, GRID_SIZE);
          // Dash lines
          ctx.strokeStyle = '#475569';
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(0, laneY + GRID_SIZE / 2);
          ctx.lineTo(canvas.width, laneY + GRID_SIZE / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (lane.type === 'river') {
          ctx.fillStyle = '#083344';
          ctx.fillRect(0, laneY, canvas.width, GRID_SIZE);
        } else if (lane.type === 'train') {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, laneY, canvas.width, GRID_SIZE);
          // Rail lines
          ctx.strokeStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(0, laneY + 12);
          ctx.lineTo(canvas.width, laneY + 12);
          ctx.moveTo(0, laneY + 28);
          ctx.lineTo(canvas.width, laneY + 28);
          ctx.stroke();
        }

        // Render Obstacles in Lane
        for (const item of lane.items) {
          ctx.fillStyle = item.color || '#f43f5e';
          ctx.shadowColor = item.color || '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(item.x, laneY + 6, item.width, GRID_SIZE - 12, 6);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Render Player Frogger Bot
      if (!isGameOver) {
        const px = s.player.x * GRID_SIZE + GRID_SIZE / 2;
        const py = 400 - (10 - s.player.y) * GRID_SIZE + GRID_SIZE / 2;

        ctx.fillStyle = '#6366f1';
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px - 5, py - 5, 4, 0, Math.PI * 2);
        ctx.arc(px + 5, py - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(px - 5, py - 5, 2, 0, Math.PI * 2);
        ctx.arc(px + 5, py - 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPracticeMode, saveHighScore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-indigo-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-indigo-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">BEST</span>
            <span className="text-lg font-bold font-mono text-indigo-300">{bestScore}</span>
          </div>
        </div>

        <button
          onClick={initGame}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * GRID_SIZE}
          height={480}
          className="rounded-2xl border-2 border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.2)] bg-slate-950"
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-indigo-400 mb-2">RUN COMPROMISED</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Distance: <span className="text-indigo-400 font-bold">{score}</span></p>
            <button
              onClick={initGame}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-xl text-base shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-Pad */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden w-44">
        <div />
        <button
          onClick={() => movePlayer(0, 1)}
          className="h-10 bg-slate-900 border border-indigo-500/40 rounded-lg text-indigo-300 font-bold flex items-center justify-center"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => movePlayer(-1, 0)}
          className="h-10 bg-slate-900 border border-indigo-500/40 rounded-lg text-indigo-300 font-bold flex items-center justify-center"
        >
          ◄
        </button>
        <button
          onClick={() => movePlayer(0, -1)}
          className="h-10 bg-slate-900 border border-indigo-500/40 rounded-lg text-indigo-300 font-bold flex items-center justify-center"
        >
          ▼
        </button>
        <button
          onClick={() => movePlayer(1, 0)}
          className="h-10 bg-slate-900 border border-indigo-500/40 rounded-lg text-indigo-300 font-bold flex items-center justify-center"
        >
          ►
        </button>
      </div>
    </div>
  );
};
