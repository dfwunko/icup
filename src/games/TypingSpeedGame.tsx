import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Keyboard, Flame } from 'lucide-react';

const WORD_BANK = [
  'const', 'async', 'await', 'function', 'return', 'canvas', 'matrix', 'vector',
  'cyber', 'neon', 'shield', 'laser', 'socket', 'binary', 'python', 'script',
  'lambda', 'syntax', 'render', 'module', 'stream', 'packet', 'router', 'pixel',
  'thread', 'crypto', 'shadow', 'glitch', 'quantum', 'cipher', 'neural', 'kernel'
];

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

export const TypingSpeedGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed } = useGame();

  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const stateRef = useRef({
    words: [] as FallingWord[],
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    lasers: [] as Array<{ startX: number; startY: number; targetX: number; targetY: number; life: number }>,
    spawnTimer: 0,
    wordsTyped: 0,
    startTime: Date.now(),
    score: 0,
    combo: 0,
  });

  const bestScore = highScores['typing-speed'] || 0;

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.words = [];
    s.particles = [];
    s.lasers = [];
    s.spawnTimer = 0;
    s.wordsTyped = 0;
    s.startTime = Date.now();
    s.score = 0;
    s.combo = 0;

    setScore(0);
    setWpm(0);
    setCombo(0);
    setInputVal('');
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputVal(val);

    if (!hasStarted) {
      setHasStarted(true);
      stateRef.current.startTime = Date.now();
    }

    const s = stateRef.current;
    const matchIndex = s.words.findIndex(w => w.word.toLowerCase() === val);

    if (matchIndex !== -1) {
      const matched = s.words[matchIndex];
      soundEngine.playLaser();
      soundEngine.playCoin();

      // Fire laser beam
      s.lasers.push({
        startX: 300,
        startY: 450,
        targetX: matched.x,
        targetY: matched.y,
        life: 1,
      });

      // Spawn particles
      for (let i = 0; i < 16; i++) {
        s.particles.push({
          x: matched.x,
          y: matched.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color: '#d946ef',
        });
      }

      s.words.splice(matchIndex, 1);
      s.wordsTyped++;
      s.combo++;
      s.score += 20 * s.combo;

      // Calculate WPM
      const minutesPassed = Math.max(0.1, (Date.now() - s.startTime) / 60000);
      const calculatedWpm = Math.round(s.wordsTyped / minutesPassed);

      setWpm(calculatedWpm);
      setScore(s.score);
      setCombo(s.combo);
      setInputVal('');
    }
  };

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      if (hasStarted && !isGameOver) {
        // Spawn words
        s.spawnTimer++;
        if (s.spawnTimer > 75 / gameModSpeed) {
          s.spawnTimer = 0;
          const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
          const x = 50 + Math.random() * (canvas.width - 120);
          s.words.push({
            id: Math.random(),
            word,
            x,
            y: 20,
            speed: (1.2 + Math.random() * 0.8) * gameModSpeed,
            color: '#f0abfc',
          });
        }

        // Update words position
        for (let i = s.words.length - 1; i >= 0; i--) {
          const w = s.words[i];
          w.y += w.speed;

          // Breached perimeter
          if (w.y >= 430) {
            soundEngine.playExplosion();
            soundEngine.playGameOver();
            saveHighScore('typing-speed', s.score);
            setIsGameOver(true);
            break;
          }
        }
      }

      // Render
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Defense Perimeter Base Line
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 430);
      ctx.lineTo(canvas.width, 430);
      ctx.stroke();

      // Draw Laser Turret at bottom
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(300, 450, 18, Math.PI, 0);
      ctx.fill();

      // Draw Laser Beams
      for (let i = s.lasers.length - 1; i >= 0; i--) {
        const l = s.lasers[i];
        ctx.globalAlpha = l.life;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(l.startX, l.startY);
        ctx.lineTo(l.targetX, l.targetY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        l.life -= 0.1;
        if (l.life <= 0) s.lasers.splice(i, 1);
      }

      // Draw Falling Words
      for (const w of s.words) {
        ctx.font = 'bold 18px "Fira Code", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 10;
        ctx.fillText(w.word, w.x, w.y);
        ctx.shadowBlur = 0;

        // Meteorite head
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(w.x - 8, w.y - 6, 4, 0, Math.PI * 2);
        ctx.fill();
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

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, isGameOver, gameModSpeed, saveHighScore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-fuchsia-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-fuchsia-400 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
            <span className="text-xs font-mono text-slate-400 block">WPM</span>
            <span className="text-lg font-bold font-mono text-fuchsia-300">{wpm}</span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
              <Flame className="w-4 h-4 text-fuchsia-400" /> {combo}x COMBO
            </div>
          )}
        </div>

        <button
          onClick={initGame}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-fuchsia-500 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={480}
          className="w-full max-w-xl aspect-5/4 rounded-2xl border-2 border-fuchsia-500/40 shadow-[0_0_35px_rgba(217,70,239,0.2)] bg-slate-950"
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-black text-fuchsia-400 mb-2">PERIMETER BREACHED</h2>
            <p className="text-slate-300 text-lg font-mono mb-1">Final Score: <span className="text-fuchsia-400 font-bold">{score}</span></p>
            <p className="text-slate-400 text-sm font-mono mb-4">Average WPM: <span className="text-white font-bold">{wpm}</span></p>
            <button
              onClick={initGame}
              className="px-8 py-3.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-black rounded-xl text-base shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Bottom Typing Input Field */}
      <div className="w-full max-w-xl mt-4 flex items-center space-x-3">
        <div className="relative flex-1">
          <Keyboard className="w-5 h-5 text-fuchsia-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Type falling code words here..."
            autoFocus
            className="w-full bg-slate-900 border-2 border-fuchsia-500/50 focus:border-fuchsia-400 rounded-xl pl-12 pr-4 py-3 text-lg font-mono text-white placeholder:text-slate-600 focus:outline-none shadow-[0_0_20px_rgba(217,70,239,0.2)]"
          />
        </div>
      </div>
    </div>
  );
};
