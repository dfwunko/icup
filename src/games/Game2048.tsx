import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Game2048: React.FC = () => {
  const { saveHighScore, highScores } = useGame();
  const [board, setBoard] = useState<number[][]>(() =>
    Array(4).fill(0).map(() => Array(4).fill(0))
  );
  const [history, setHistory] = useState<{ board: number[][]; score: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const bestScore = highScores['game-2048'] || 0;

  const getEmptyCells = (grid: number[][]) => {
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) cells.push({ r, c });
      }
    }
    return cells;
  };

  const addRandomTile = (grid: number[][]) => {
    const empty = getEmptyCells(grid);
    if (empty.length === 0) return grid;
    const randomCell = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = grid.map(row => [...row]);
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const initGame = useCallback(() => {
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setBoard(newGrid);
    setHistory([]);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const slideAndMergeRow = (row: number[]): { newRow: number[]; points: number } => {
    const filtered = row.filter(val => val !== 0);
    const newRow: number[] = [];
    let points = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        points += mergedVal;
        i++;
      } else {
        newRow.push(filtered[i]);
      }
    }

    while (newRow.length < 4) {
      newRow.push(0);
    }

    return { newRow, points };
  };

  const checkMovesAvailable = (grid: number[][]): boolean => {
    if (getEmptyCells(grid).length > 0) return true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c];
        if (c < 3 && val === grid[r][c + 1]) return true;
        if (r < 3 && val === grid[r + 1][c]) return true;
      }
    }
    return false;
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;

    let moved = false;
    let gainedScore = 0;
    const currentGrid = board.map(row => [...row]);
    const nextGrid = Array(4).fill(0).map(() => Array(4).fill(0));

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const { newRow, points } = slideAndMergeRow(currentGrid[r]);
        nextGrid[r] = newRow;
        gainedScore += points;
        if (newRow.some((val, idx) => val !== currentGrid[r][idx])) moved = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...currentGrid[r]].reverse();
        const { newRow, points } = slideAndMergeRow(reversed);
        nextGrid[r] = newRow.reverse();
        gainedScore += points;
        if (nextGrid[r].some((val, idx) => val !== currentGrid[r][idx])) moved = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [currentGrid[0][c], currentGrid[1][c], currentGrid[2][c], currentGrid[3][c]];
        const { newRow, points } = slideAndMergeRow(col);
        for (let r = 0; r < 4; r++) {
          nextGrid[r][c] = newRow[r];
          if (nextGrid[r][c] !== currentGrid[r][c]) moved = true;
        }
        gainedScore += points;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [currentGrid[3][c], currentGrid[2][c], currentGrid[1][c], currentGrid[0][c]];
        const { newRow, points } = slideAndMergeRow(col);
        for (let r = 0; r < 4; r++) {
          nextGrid[3 - r][c] = newRow[r];
          if (nextGrid[3 - r][c] !== currentGrid[3 - r][c]) moved = true;
        }
        gainedScore += points;
      }
    }

    if (moved) {
      soundEngine.playClick();
      if (gainedScore > 0) soundEngine.playCoin();

      const withRandom = addRandomTile(nextGrid);
      setHistory(prev => [...prev.slice(-10), { board: currentGrid, score }]);
      setBoard(withRandom);
      const newScore = score + gainedScore;
      setScore(newScore);
      saveHighScore('game-2048', newScore);

      // Check win 2048
      if (!hasWon && withRandom.some(row => row.some(val => val >= 2048))) {
        setHasWon(true);
        confetti({ particleCount: 100, spread: 70 });
        soundEngine.playPowerup();
      }

      // Check game over
      if (!checkMovesAvailable(withRandom)) {
        setIsGameOver(true);
        soundEngine.playGameOver();
      }
    }
  }, [board, isGameOver, score, hasWon, saveHighScore]);

  const undoMove = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory(prev => prev.slice(0, -1));
    setIsGameOver(false);
    soundEngine.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
        e.preventDefault();
        move('right');
      } else if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code || e.key)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code || e.key)) {
        e.preventDefault();
        move('down');
      } else if (e.key === 'u' || e.key === 'U') {
        undoMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileStyle = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-cyan-300 border-cyan-500/40';
      case 4: return 'bg-slate-800 text-teal-300 border-teal-500/40';
      case 8: return 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 16: return 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 32: return 'bg-orange-950 text-orange-300 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.35)]';
      case 64: return 'bg-rose-950 text-rose-300 border-rose-500/70 shadow-[0_0_18px_rgba(244,63,94,0.4)]';
      case 128: return 'bg-purple-950 text-purple-300 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.45)]';
      case 256: return 'bg-indigo-950 text-indigo-200 border-indigo-500/90 shadow-[0_0_22px_rgba(99,102,241,0.5)]';
      case 512: return 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]';
      case 1024: return 'bg-amber-900 text-yellow-200 border-yellow-300 shadow-[0_0_30px_rgba(253,224,71,0.7)]';
      case 2048: return 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-black border-white shadow-[0_0_40px_rgba(251,191,36,0.9)] animate-pulse';
      default: return 'bg-slate-900 text-slate-600 border-slate-800';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 p-4">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 z-20">
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 border border-yellow-500/30 px-3.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-mono text-yellow-400 block">SCORE</span>
            <span className="text-xl font-black font-mono text-white">{score}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 block">BEST</span>
            <span className="text-lg font-bold font-mono text-yellow-300">{bestScore}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={undoMove}
            disabled={history.length === 0}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
            title="Undo Move [U]"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2048 Grid Board */}
      <div className="relative p-3 bg-slate-900/90 rounded-2xl border-2 border-yellow-500/40 shadow-[0_0_35px_rgba(234,179,8,0.2)]">
        <div className="grid grid-cols-4 gap-2.5 w-72 h-72 sm:w-80 sm:h-80">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center rounded-xl border text-xl sm:text-2xl font-black transition-all duration-100 ${getTileStyle(
                  val
                )}`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-black text-yellow-400 mb-2">NO MORE MOVES</h2>
            <p className="text-slate-300 text-sm font-mono mb-4">Final Score: {score}</p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Swipe / D-Pad on Mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden w-44">
        <div />
        <button
          onClick={() => move('up')}
          className="h-10 bg-slate-900 border border-yellow-500/40 rounded-lg text-yellow-300 font-bold flex items-center justify-center"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => move('left')}
          className="h-10 bg-slate-900 border border-yellow-500/40 rounded-lg text-yellow-300 font-bold flex items-center justify-center"
        >
          ◄
        </button>
        <button
          onClick={() => move('down')}
          className="h-10 bg-slate-900 border border-yellow-500/40 rounded-lg text-yellow-300 font-bold flex items-center justify-center"
        >
          ▼
        </button>
        <button
          onClick={() => move('right')}
          className="h-10 bg-slate-900 border border-yellow-500/40 rounded-lg text-yellow-300 font-bold flex items-center justify-center"
        >
          ►
        </button>
      </div>
    </div>
  );
};
