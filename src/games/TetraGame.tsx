import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Play, Pause } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const SHAPES = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
};

type ShapeKey = keyof typeof SHAPES;
const SHAPE_KEYS: ShapeKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const TetraGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { saveHighScore, highScores, gameModSpeed } = useGame();
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [heldPiece, setHeldPiece] = useState<ShapeKey | null>(null);
  const [nextPiece, setNextPiece] = useState<ShapeKey>('T');

  const stateRef = useRef({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null as string | null)),
    currentPiece: {
      type: 'T' as ShapeKey,
      shape: SHAPES.T.shape,
      color: SHAPES.T.color,
      x: 3,
      y: 0,
    },
    heldPiece: null as ShapeKey | null,
    canHold: true,
    nextPiece: 'I' as ShapeKey,
    lastDrop: 0,
    dropInterval: 800,
    score: 0,
    lines: 0,
    level: 1,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
  });

  const bestScore = highScores['tetra-drop'] || 0;

  const getRandomPiece = (): ShapeKey => {
    return SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  };

  const checkCollision = (shape: number[][], offsetX: number, offsetY: number, grid: (string | null)[][]): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const x = offsetX + c;
          const y = offsetY + r;
          if (x < 0 || x >= COLS || y >= ROWS) return true;
          if (y >= 0 && grid[y][x]) return true;
        }
      }
    }
    return false;
  };

  const rotateMatrix = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const spawnNewPiece = useCallback(() => {
    const s = stateRef.current;
    const type = s.nextPiece;
    const next = getRandomPiece();
    s.nextPiece = next;
    setNextPiece(next);

    const pieceShape = SHAPES[type].shape;
    const initialX = Math.floor((COLS - pieceShape[0].length) / 2);
    const initialY = 0;

    s.currentPiece = {
      type,
      shape: pieceShape,
      color: SHAPES[type].color,
      x: initialX,
      y: initialY,
    };
    s.canHold = true;

    if (checkCollision(pieceShape, initialX, initialY, s.grid)) {
      soundEngine.playGameOver();
      saveHighScore('tetra-drop', s.score);
      setIsGameOver(true);
    }
  }, [saveHighScore]);

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    s.score = 0;
    s.lines = 0;
    s.level = 1;
    s.dropInterval = 800 / gameModSpeed;
    s.heldPiece = null;
    s.canHold = true;
    s.nextPiece = getRandomPiece();
    s.particles = [];

    setScore(0);
    setLines(0);
    setLevel(1);
    setHeldPiece(null);
    setIsGameOver(false);
    setIsPaused(false);
    spawnNewPiece();
  }, [gameModSpeed, spawnNewPiece]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const lockPiece = useCallback(() => {
    const s = stateRef.current;
    const { shape, color, x, y } = s.currentPiece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && y + r >= 0) {
          s.grid[y + r][x + c] = color;
        }
      }
    }

    soundEngine.playHit();

    // Check full lines
    let clearedLines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (s.grid[r].every(cell => cell !== null)) {
        clearedLines++;
        // Spawn particle line explosion
        for (let c = 0; c < COLS; c++) {
          for (let p = 0; p < 4; p++) {
            s.particles.push({
              x: c * BLOCK_SIZE + BLOCK_SIZE / 2,
              y: r * BLOCK_SIZE + BLOCK_SIZE / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 1,
              color: s.grid[r][c] || '#ffffff',
            });
          }
        }
        s.grid.splice(r, 1);
        s.grid.unshift(Array(COLS).fill(null));
        r++; // check same row index again
      }
    }

    if (clearedLines > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      const points = (lineScores[clearedLines] || 100) * s.level;
      s.score += points;
      s.lines += clearedLines;
      s.level = Math.floor(s.lines / 10) + 1;
      s.dropInterval = Math.max(120, (800 - (s.level - 1) * 60) / gameModSpeed);

      setScore(s.score);
      setLines(s.lines);
      setLevel(s.level);

      if (clearedLines >= 4) {
        soundEngine.playPowerup();
      } else {
        soundEngine.playCoin();
      }
    }

    spawnNewPiece();
  }, [gameModSpeed, spawnNewPiece]);

  // Drop step
  const dropStep = useCallback(() => {
    const s = stateRef.current;
    if (!checkCollision(s.currentPiece.shape, s.currentPiece.x, s.currentPiece.y + 1, s.grid)) {
      s.currentPiece.y += 1;
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  // Hard drop
  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    let dy = 0;
    while (!checkCollision(s.currentPiece.shape, s.currentPiece.x, s.currentPiece.y + dy + 1, s.grid)) {
      dy++;
    }
    s.currentPiece.y += dy;
    s.score += dy * 2;
    setScore(s.score);
    soundEngine.playJump();
    lockPiece();
  }, [lockPiece]);

  // Hold piece
  const holdPieceAction = useCallback(() => {
    const s = stateRef.current;
    if (!s.canHold) return;
    s.canHold = false;
    soundEngine.playClick();

    const currentType = s.currentPiece.type;
    if (s.heldPiece === null) {
      s.heldPiece = currentType;
      setHeldPiece(currentType);
      spawnNewPiece();
    } else {
      const temp = s.heldPiece;
      s.heldPiece = currentType;
      setHeldPiece(currentType);
      s.currentPiece = {
        type: temp,
        shape: SHAPES[temp].shape,
        color: SHAPES[temp].color,
        x: Math.floor((COLS - SHAPES[temp].shape[0].length) / 2),
        y: 0,
      };
    }
  }, [spawnNewPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (isGameOver || isPaused) return;

      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (!checkCollision(s.currentPiece.shape, s.currentPiece.x - 1, s.currentPiece.y, s.grid)) {
          s.currentPiece.x -= 1;
        }
      } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (!checkCollision(s.currentPiece.shape, s.currentPiece.x + 1, s.currentPiece.y, s.grid)) {
          s.currentPiece.x += 1;
        }
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        dropStep();
      } else if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'x' || e.key === 'X') {
        const rotated = rotateMatrix(s.currentPiece.shape);
        if (!checkCollision(rotated, s.currentPiece.x, s.currentPiece.y, s.grid)) {
          s.currentPiece.shape = rotated;
          soundEngine.playClick();
        } else if (!checkCollision(rotated, s.currentPiece.x - 1, s.currentPiece.y, s.grid)) {
          s.currentPiece.shape = rotated;
          s.currentPiece.x -= 1;
          soundEngine.playClick();
        } else if (!checkCollision(rotated, s.currentPiece.x + 1, s.currentPiece.y, s.grid)) {
          s.currentPiece.shape = rotated;
          s.currentPiece.x += 1;
          soundEngine.playClick();
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!hasStarted) {
          setHasStarted(true);
        } else {
          hardDrop();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        holdPieceAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropStep, hardDrop, holdPieceAction, hasStarted, isGameOver, isPaused]);

  // Main canvas loop & drop ticker
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;

      if (hasStarted && !isPaused && !isGameOver) {
        if (timestamp - s.lastDrop > s.dropInterval) {
          s.lastDrop = timestamp;
          dropStep();
        }
      }

      // Render
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
        ctx.stroke();
      }
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
      }

      // Draw locked grid blocks
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = s.grid[r][c];
          if (color) {
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.shadowBlur = 0;

            // Highlight top border
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(c * BLOCK_SIZE + 2, r * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 3);
          }
        }
      }

      if (hasStarted && !isGameOver) {
        // Draw Ghost Outline
        let ghostY = s.currentPiece.y;
        while (!checkCollision(s.currentPiece.shape, s.currentPiece.x, ghostY + 1, s.grid)) {
          ghostY++;
        }

        ctx.strokeStyle = s.currentPiece.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        for (let r = 0; r < s.currentPiece.shape.length; r++) {
          for (let c = 0; c < s.currentPiece.shape[r].length; c++) {
            if (s.currentPiece.shape[r][c]) {
              ctx.strokeRect(
                (s.currentPiece.x + c) * BLOCK_SIZE + 2,
                (ghostY + r) * BLOCK_SIZE + 2,
                BLOCK_SIZE - 4,
                BLOCK_SIZE - 4
              );
            }
          }
        }
        ctx.setLineDash([]);

        // Draw Active Current Piece
        for (let r = 0; r < s.currentPiece.shape.length; r++) {
          for (let c = 0; c < s.currentPiece.shape[r].length; c++) {
            if (s.currentPiece.shape[r][c]) {
              const px = (s.currentPiece.x + c) * BLOCK_SIZE;
              const py = (s.currentPiece.y + r) * BLOCK_SIZE;
              ctx.fillStyle = s.currentPiece.color;
              ctx.shadowColor = s.currentPiece.color;
              ctx.shadowBlur = 12;
              ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
              ctx.shadowBlur = 0;

              // Highlight
              ctx.fillStyle = 'rgba(255,255,255,0.4)';
              ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, 3);
            }
          }
        }
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
  }, [hasStarted, isPaused, isGameOver, dropStep]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none bg-slate-950 p-4">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Left Side: Hold & Stats */}
        <div className="flex flex-row md:flex-col gap-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 w-32 flex flex-col items-center">
            <span className="text-xs font-mono text-purple-400 font-bold mb-2">HOLD [C]</span>
            <div className="w-16 h-16 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
              {heldPiece ? (
                <div className="font-mono text-2xl font-black text-purple-400">{heldPiece}</div>
              ) : (
                <span className="text-xs text-slate-600">EMPTY</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-32 flex flex-col space-y-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">SCORE</span>
              <span className="text-lg font-black font-mono text-white">{score}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">LINES</span>
              <span className="text-base font-bold font-mono text-purple-300">{lines}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">LEVEL</span>
              <span className="text-base font-bold font-mono text-cyan-300">{level}</span>
            </div>
          </div>
        </div>

        {/* Center Board Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="rounded-2xl border-2 border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.2)] bg-slate-950"
          />

          {!hasStarted && !isGameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <h2 className="text-2xl font-black text-white mb-2">TETRA MASTER 99</h2>
              <p className="text-slate-400 text-xs mb-4">
                Classic block stacking! Arrows to move/rotate, SPACE for hard drop, C to hold piece.
              </p>
              <button
                onClick={() => {
                  setHasStarted(true);
                  soundEngine.playJump();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all cursor-pointer"
              >
                START GAME [SPACE]
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <h2 className="text-2xl font-black text-red-400 mb-2">MATRIX OVERFLOW</h2>
              <p className="text-slate-300 text-sm font-mono mb-4">Final Score: <span className="text-purple-400 font-bold">{score}</span></p>
              <button
                onClick={() => {
                  initGame();
                  setHasStarted(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all cursor-pointer"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Next & Controls */}
        <div className="flex flex-row md:flex-col gap-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 w-32 flex flex-col items-center">
            <span className="text-xs font-mono text-cyan-400 font-bold mb-2">NEXT</span>
            <div className="w-16 h-16 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
              <div className="font-mono text-2xl font-black text-cyan-400">{nextPiece}</div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 transition-all flex items-center justify-center"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={initGame}
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 transition-all flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
