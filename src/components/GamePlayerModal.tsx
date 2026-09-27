import React, { useState, useRef } from 'react';
import { GameMetadata } from '../types';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import {
  X,
  Maximize2,
  Minimize2,
  Sliders,
  Shield,
  Gamepad2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Game Component Imports
import { SlopeGame } from '../games/SlopeGame';
import { SnakeGame } from '../games/SnakeGame';
import { TetraGame } from '../games/TetraGame';
import { SpaceDefenderGame } from '../games/SpaceDefenderGame';
import { BreakoutGame } from '../games/BreakoutGame';
import { FlappyGame } from '../games/FlappyGame';
import { Game2048 } from '../games/Game2048';
import { DinoRunnerGame } from '../games/DinoRunnerGame';
import { TowerStackerGame } from '../games/TowerStackerGame';
import { IdleHackerGame } from '../games/IdleHackerGame';
import { CrossyRoadGame } from '../games/CrossyRoadGame';
import { TypingSpeedGame } from '../games/TypingSpeedGame';

interface GamePlayerModalProps {
  game: GameMetadata;
  onClose: () => void;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({ game, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const {
    gameModSpeed,
    setGameModSpeed,
    isPracticeMode,
    setIsPracticeMode,
    highScores,
  } = useGame();

  const toggleFullscreen = () => {
    soundEngine.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const renderGameComponent = () => {
    switch (game.id) {
      case 'slope-3d': return <SlopeGame />;
      case 'snake-neon': return <SnakeGame />;
      case 'tetra-drop': return <TetraGame />;
      case 'space-defender': return <SpaceDefenderGame />;
      case 'brick-smasher': return <BreakoutGame />;
      case 'flappy-cyber': return <FlappyGame />;
      case 'game-2048': return <Game2048 />;
      case 'dino-cyber': return <DinoRunnerGame />;
      case 'tower-stacker': return <TowerStackerGame />;
      case 'idle-hacker': return <IdleHackerGame />;
      case 'crossy-cyber': return <CrossyRoadGame />;
      case 'typing-speed': return <TypingSpeedGame />;
      default: return <SlopeGame />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-2 md:p-4 overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 px-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-2 z-20">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: `${game.accentColor}25`, color: game.accentColor }}
          >
            🎮
          </div>
          <div>
            <h2 className="text-base font-black text-white font-['Outfit']">{game.title}</h2>
            <span className="text-[11px] font-mono text-slate-400">
              Highscore: <b className="text-cyan-400">{highScores[game.id] || 0}</b>
            </span>
          </div>
        </div>

        {/* Modifiers and Tools */}
        <div className="flex items-center space-x-2">
          {/* Game Speed Multiplier */}
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {[0.75, 1.0, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  soundEngine.playClick();
                  setGameModSpeed(speed);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  gameModSpeed === speed
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Practice Mode Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsPracticeMode(!isPracticeMode);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              isPracticeMode
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Practice Mode (Invincible Practice)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Practice</span>
          </button>

          {/* Controls Info Drawer */}
          <button
            onClick={() => setShowControlsInfo(!showControlsInfo)}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
            title="Controls Guide"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Game Button */}
          <button
            onClick={onClose}
            className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Close Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Info Dropdown Banner */}
      {showControlsInfo && (
        <div className="w-full max-w-5xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 mb-2 z-20 flex items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {game.controls.map((ctrl, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs font-mono">
                <kbd className="px-2.5 py-1 bg-slate-950 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold">
                  {ctrl.key}
                </kbd>
                <span className="text-slate-300">{ctrl.action}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowControlsInfo(false)}
            className="text-xs text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Game Canvas Area */}
      <div className="flex-1 w-full max-w-5xl flex items-center justify-center relative overflow-hidden">
        {renderGameComponent()}
      </div>
    </div>
  );
};
