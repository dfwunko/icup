import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StackBlock {
  x: number;
  y: number;
  width: number;
  color: string;
}

export const TowerStackerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed } = useGame();
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);

  const BLOCK_HEIGHT = 26;
  const BASE_WIDTH = 220;

  const stateRef = useRef({
    blocks: [] as StackBlock[],
    currentBlock: { x: 0, width: BASE_WIDTH, speed: 4, dir: 1 },
    cameraY: 0,
    hue: 180,
    combo: 0,
    score: 0,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
  });

  const bestScore = highScores['tower-stacker'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.blocks = [{
      x: 300 - BASE_WIDTH / 2,
      y: 420,
      width: BASE_WIDTH,
      color: 'hsl(180, 80%, 50%)',
    }];
    s.currentBlock = {
      x: 50,
      width: BASE_WIDTH,
      speed: 4.5 * gameModSpeed,
      dir: 1,
    };
    s.cameraY = 0;
    s.hue = 180;
    s.combo = 0;
    s.score = 0;
    s.particles = [];

    setScore(0);
    setCombo(0);
    setIsGameOver(false);
  }, [gameModSpeed]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const placeBlock = useCallback(() => {
    if (isGameOver) {
      initGame();
      return;
    }

    const s = stateRef.current;
    const prevBlock = s.blocks[s.blocks.length - 1];
    const cur = s.currentBlock;
    const curY = 420 - s.blocks.length * BLOCK_HEIGHT;

    const diff = cur.x - prevBlock.x;
    const tolerance = 4; // Perfect placement tolerance

    if (Math.abs(diff) <= tolerance) {
      // Perfect Combo!
      cur.x = prevBlock.x;
      s.combo++;
      setCombo(s.combo);
      soundEngine.playPowerup();

      for (let i = 0; i < 20; i++) {
        s.particles.push({
          x: cur.x + cur.width / 2,
          y: curY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          color: '#ffffff',
        });
      }
    } else if (diff > 0) {
      // Sliced on right
      const overlap = prevBlock.width - diff;
      if (overlap <= 0) {
        // Complete Miss!
        soundEngine.playExplosion();
        soundEngine.playGameOver();
        saveHighScore('tower-stacker', s.score);
        setIsGameOver(true);
        return;
      }
      cur.width = overlap;
      s.combo = 0;
      setCombo(0);
      soundEngine.playHit();
    } else {
      // Sliced on left
      const overlap = cur.width + diff;
      if (overlap <= 0) {
        soundEngine.playExplosion();
        soundEngine.playGameOver();
        saveHighScore('tower-stacker', s.score);
        setIsGameOver(true);
        return;
      }
      cur.x = prevBlock.x;
      cur.width = overlap;
      s.combo = 0;
      setCombo(0);
      soundEngine.playHit();
    }

    s.hue = (s.hue + 14) % 360;
    const color = `hsl(${s.hue}, 85%, 55%)`;

    s.blocks.push({
      x: cur.x,
      y: curY,
      width: cur.width,
      color,
    });

    s.score++;
    setScore(s.score);

    // Shift camera upward if tower gets high
    if (s.blocks.length > 8) {
      s.cameraY = (s.blocks.length - 8) * BLOCK_HEIGHT;
    }

    // Next swinging block setup
    s.currentBlock = {
      x: 30,
      width: cur.width,
      speed: (4.5 + Math.min(8, s.score * 0.15)) * gameModSpeed,
      dir: 1,
    };
  }, [isGameOver, initGame, gameModSpeed, saveHighScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        placeBlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placeBlock]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      if (!isGameOver) {
        // Move current block horizontally
        s.currentBlock.x += s.currentBlock.speed * s.currentBlock.dir;
        if (s.currentBlock.x <= 20) {
          s.currentBlock.x = 20;
          s.currentBlock.dir = 1;
        } else if (s.currentBlock.x + s.currentBlock.width >= canvas.width - 20) {
          s.currentBlock.x = canvas.width - 20 - s.currentBlock.width;
          s.currentBlock.dir = -1;
        }
      }

      // Render
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, s.cameraY);

      // Draw Stacked Blocks
      for (const b of s.blocks) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(b.x + 2, b.y + 2, b.width - 4, 3);
      }

      // Draw Active Moving Block
      if (!isGameOver) {
        const curY = 420 - s.blocks.length * BLOCK_HEIGHT;
        const curColor = `hsl(${s.hue + 14}, 85%, 60%)`;
        ctx.fillStyle = curColor;
        ctx.shadowColor = curColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(s.currentBlock.x, curY, s.currentBlock.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(s.currentBlock.x + 2, curY + 2, s.currentBlock.width - 4, 3);
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
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver]);

  return (
    <div
      onClick={placeBlock}
      className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4 cursor-pointer"
    >
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-blue-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-blue-400 block">FLOORS</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">BEST</span>
            <span className="text-lg font-bold font-mono text-blue-300">{bestScore}</span>
          </div>
          {combo > 1 && (
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
              COMBO x{combo}!
            </span>
          )}
        </div>

        <button
          onClick={initGame}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full max-w-md aspect-square rounded-2xl border-2 border-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.2)] bg-slate-950"
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-blue-400 mb-2">TOWER TOPPLED</h2>
            <p className="text-slate-300 text-lg font-mono mb-4">Height Reached: <span className="text-blue-400 font-bold">{score} Floors</span></p>
            <button
              onClick={() => {
                initGame();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              BUILD AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
