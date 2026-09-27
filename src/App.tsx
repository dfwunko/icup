/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { GamePlayerModal } from './components/GamePlayerModal';
import { CustomSandboxGame } from './games/CustomSandboxGame';
import { CustomGameStudio } from './components/CustomGameStudio';
import { CloakSettingsModal } from './components/CloakSettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { PanicOverlay } from './components/PanicOverlay';
import { GameCategory } from './types';
import { soundEngine } from './audio/soundEngine';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Star,
  Trophy,
  Code,
  Shield,
  Zap,
  Play,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const MainArcadeHub: React.FC = () => {
  const {
    games,
    activeGame,
    activeCustomGame,
    openGame,
    openCustomGame,
    closeGame,
    favorites,
    customGames,
    highScores,
    gameStats,
  } = useGame();

  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'arcade'
          ? g.category === 'arcade' || g.category === 'retro'
          : g.category === activeCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [games, activeCategory, searchQuery]);

  // Featured Game for the Hero
  const featuredGame = games.find(g => g.id === 'slope-3d') || games[0];

  // Favorite games list
  const favoriteGamesList = useMemo(() => {
    return games.filter(g => favorites.includes(g.id));
  }, [games, favorites]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Panic Overlay (Full Stealth Screen on Demand) */}
      <PanicOverlay />

      {/* Main Navbar */}
      <Navbar
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
        onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
        onOpenStudioModal={() => setIsStudioModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col space-y-8">
        {/* Hero Showcase Banner */}
        {searchQuery === '' && activeCategory === 'all' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 md:p-10 shadow-2xl">
            {/* Background Glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-1 text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Sparkles className="w-3.5 h-3.5" /> FEATURED RETRO HIT
                  </span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 100% UNBLOCKED
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
                  SPEED & REFLEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CYBER ARCADE</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Play unlimited client-side HTML5 & JavaScript games directly in your browser. Built with zero tracking, offline capability, tab cloaking, and instant panic stealth mode!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => openGame(featuredGame.id)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> PLAY {featuredGame.title.toUpperCase()}
                  </button>
                  <button
                    onClick={() => setIsStudioModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold rounded-2xl text-sm transition-all cursor-pointer"
                  >
                    <Code className="w-4 h-4 text-purple-400" /> Custom Game Maker
                  </button>
                </div>
              </div>

              {/* Mini Interactive Preview Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-cyan-400 font-bold">ARCADE TELEMETRY</span>
                    <span className="text-xs font-mono text-slate-400">FPS: 60 • HTML5 Canvas</span>
                  </div>

                  <div className="h-36 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-950 border border-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                    <div className="text-4xl animate-bounce mb-2">⚡</div>
                    <div className="text-xs font-mono text-cyan-300 font-bold">SLOPE 3D RUNNER</div>
                    <div className="text-[10px] font-mono text-slate-500">Highscore: {highScores['slope-3d'] || 0}m</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-[11px] font-mono">
                    <div className="bg-slate-900/80 rounded-lg p-1.5">
                      <span className="text-slate-400 block">TOTAL PLAYS</span>
                      <span className="text-cyan-400 font-bold">{gameStats.totalPlays}</span>
                    </div>
                    <div className="bg-slate-900/80 rounded-lg p-1.5">
                      <span className="text-slate-400 block">GAMES</span>
                      <span className="text-purple-400 font-bold">{games.length + customGames.length}</span>
                    </div>
                    <div className="bg-slate-900/80 rounded-lg p-1.5">
                      <span className="text-slate-400 block">STEALTH</span>
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Games', icon: '🎮' },
            { id: 'runner', label: 'Runners & 3D', icon: '⚡' },
            { id: 'retro', label: 'Retro Classics', icon: '🐍' },
            { id: 'action', label: 'Shooters & Action', icon: '🚀' },
            { id: 'puzzle', label: 'Puzzles & Brain', icon: '🧱' },
            { id: 'arcade', label: 'Arcade Smashers', icon: '🏓' },
            { id: 'idle', label: 'Idle & Clicker', icon: '💻' },
            { id: 'sandbox', label: 'Custom Studio', icon: '🛠️' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveCategory(cat.id as GameCategory);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Favorite Games Bar (if any favorites exist and in 'all' view) */}
        {activeCategory === 'all' && searchQuery === '' && favoriteGamesList.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                FAVORITE VAULT
              </h3>
              <span className="text-xs font-mono text-slate-400">{favoriteGamesList.length} saved games</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteGamesList.map(game => (
                <GameCard
                  key={`fav-${game.id}`}
                  game={game}
                  onOpen={() => {
                    if (game.id === 'custom-studio') setIsStudioModalOpen(true);
                    else openGame(game.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Custom Games / Community Vault Section */}
        {(activeCategory === 'all' || activeCategory === 'sandbox') && searchQuery === '' && (
          <section className="space-y-3 bg-purple-950/20 border border-purple-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  CUSTOM HTML5 / JS GAMES VAULT
                </h3>
                <p className="text-xs text-slate-400">Created or imported in NovaVault Studio</p>
              </div>

              <button
                onClick={() => setIsStudioModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                + Create New Game
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customGames.map(cg => (
                <div
                  key={cg.id}
                  onClick={() => openCustomGame(cg)}
                  className="bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(168,85,247,0.2)] flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        CUSTOM JS
                      </span>
                      <span className="text-xs text-slate-400 font-mono">By {cg.author}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">{cg.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{cg.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3">
                    <span className="text-[11px] font-mono text-purple-300">Sandboxed HTML5</span>
                    <button className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Play className="w-3.5 h-3.5 fill-current" /> PLAY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Arcade Games Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              {activeCategory === 'all'
                ? 'ALL UNBLOCKED ARCADE GAMES'
                : `${activeCategory.toUpperCase()} GAMES`}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredGames.length} titles
            </span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="text-lg font-bold text-white mb-1">No Games Found</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                No games matched your search query "{searchQuery}". Try searching for another keyword or check out the Custom Game Maker!
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-mono"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onOpen={() => {
                    if (game.id === 'custom-studio') setIsStudioModalOpen(true);
                    else openGame(game.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 md:px-8 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            NovaVault Arcade • 100% Client-Side HTML5 & JavaScript • No Ads, Pure Gaming
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <button onClick={() => setIsCloakModalOpen(true)} className="hover:text-cyan-400 cursor-pointer">
              Tab Cloaker
            </button>
            <span>•</span>
            <button onClick={() => setIsAchievementsModalOpen(true)} className="hover:text-cyan-400 cursor-pointer">
              Trophies
            </button>
            <span>•</span>
            <button onClick={() => setIsStudioModalOpen(true)} className="hover:text-purple-400 cursor-pointer">
              JS Studio
            </button>
          </div>
        </div>
      </footer>

      {/* Active Built-in Game Modal */}
      {activeGame && (
        <GamePlayerModal game={activeGame} onClose={closeGame} />
      )}

      {/* Active Custom Game Sandbox Modal */}
      {activeCustomGame && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col p-2 md:p-4">
          <CustomSandboxGame
            customGame={activeCustomGame}
            onEditCode={() => {
              setIsStudioModalOpen(true);
              closeGame();
            }}
            onBack={closeGame}
          />
        </div>
      )}

      {/* Studio Modal */}
      {isStudioModalOpen && (
        <CustomGameStudio onClose={() => setIsStudioModalOpen(false)} />
      )}

      {/* Cloak Settings Modal */}
      <CloakSettingsModal
        isOpen={isCloakModalOpen}
        onClose={() => setIsCloakModalOpen(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainArcadeHub />
    </GameProvider>
  );
}
