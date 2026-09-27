import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Code2,
  Play,
  Terminal,
  EyeOff,
  Shield,
  Layers,
  Plus,
  Radar,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenCloakModal: () => void;
  onNewGame: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCloakModal,
  onNewGame,
}) => {
  const {
    activeTab,
    setActiveTab,
    triggerPanic,
    activeGame,
    setIsScanModalOpen,
    scanReports,
    isScanning
  } = useGame();

  return (
    <header className="sticky top-0 z-30 w-full bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('library')}
            className="flex items-center space-x-2.5 text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white group-hover:border-neutral-400 transition-colors">
              <span className="font-mono text-xs font-bold">NV</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold tracking-tight text-neutral-100 font-mono">
                  NovaVault
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  HTML & JS
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          {activeGame && (
            <button
              onClick={() => setActiveTab('runner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'runner'
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">{activeGame.title}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Scan for Games button */}
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer relative"
            title="Scan for Games & Entry Points"
          >
            <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-white' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">Scan Games</span>
            {scanReports.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            title="Create New Game"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Cloak Settings */}
          <button
            onClick={onOpenCloakModal}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Tab Cloaking"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Panic Escape */}
          <button
            onClick={() => triggerPanic(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-900 text-neutral-300 hover:text-red-400 text-xs font-mono transition-all cursor-pointer"
            title="Stealth Panic Screen (Esc / P)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="font-semibold">PANIC</span>
            <kbd className="hidden sm:inline text-[9px] bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
              Esc
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
