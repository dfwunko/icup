import React from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import {
  Gamepad2,
  EyeOff,
  Volume2,
  VolumeX,
  Music,
  Trophy,
  Code,
  Shield,
  Search,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenCloakModal: () => void;
  onOpenAchievementsModal: () => void;
  onOpenStudioModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCloakModal,
  onOpenAchievementsModal,
  onOpenStudioModal,
  searchQuery,
  onSearchChange,
}) => {
  const {
    triggerPanic,
    soundEnabled,
    setSoundEnabled,
    musicEnabled,
    setMusicEnabled,
    achievements,
    currentCloak,
  } = useGame();

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-white font-['Outfit']">
                NOVA<span className="text-cyan-400">VAULT</span>
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                UNBLOCKED
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 -mt-0.5">
              HTML5 & JS Arcade Hub {currentCloak && `• [Cloaked: ${currentCloak.name}]`}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search unblocked games, tags, categories..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Action Controls & Panic Button */}
        <div className="flex items-center space-x-2">
          {/* Custom Game Studio Launcher */}
          <button
            onClick={onOpenStudioModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
            title="Open HTML5 Game Creator Studio"
          >
            <Code className="w-4 h-4 text-purple-400" />
            <span className="hidden lg:inline">Game Maker</span>
          </button>

          {/* Trophies Button */}
          <button
            onClick={onOpenAchievementsModal}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
            title="Trophies & Achievements"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">{unlockedCount}</span>
          </button>

          {/* Tab Cloaking Settings */}
          <button
            onClick={onOpenCloakModal}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Tab Cloaking & Stealth Config"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Synth Retro Chiptune Music */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setMusicEnabled(!musicEnabled);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              musicEnabled
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={musicEnabled ? 'Stop Retro Synth Chiptune' : 'Play Retro Synth Chiptune'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* PANIC BUTTON */}
          <button
            onClick={() => triggerPanic(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black font-mono shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all transform hover:scale-105 cursor-pointer ml-1"
            title="Instant Panic Button (Press P or Esc)"
          >
            <Shield className="w-4 h-4" />
            <span>PANIC</span>
            <kbd className="hidden sm:inline px-1 py-0.2 bg-red-950/60 rounded text-[10px]">P</kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
