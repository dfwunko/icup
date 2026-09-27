/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { GameRunner } from './components/GameRunner';
import { CodeEditor } from './components/CodeEditor';
import { DirectEmbed } from './components/DirectEmbed';
import { CloakModal } from './components/CloakModal';
import { PanicOverlay } from './components/PanicOverlay';
import { ScanModal } from './components/ScanModal';
import { HtmlJsGame } from './types';
import {
  Play,
  Code2,
  Trash2,
  Star,
  Plus,
  Upload,
  Download,
  Search,
  Layers,
  Terminal,
  Radar,
  RefreshCw,
  FolderSearch,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const MinimalArcadeApp: React.FC = () => {
  const {
    games,
    activeGame,
    activeTab,
    setActiveTab,
    playGame,
    addGame,
    deleteGame,
    toggleFavorite,
    resetToDefaults,
    setIsScanModalOpen,
    runDirectoryScan,
    isScanning,
    scanReports
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);
  const [editorTargetGame, setEditorTargetGame] = useState<HtmlJsGame | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    games.forEach(g => g.tags?.forEach(t => tagsSet.add(t)));
    return ['all', ...Array.from(tagsSet)];
  }, [games]);

  // Filtered games list
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.entryUrl && g.entryUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
        g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'all' || g.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [games, searchQuery, selectedTag]);

  const handleOpenInEditor = (game: HtmlJsGame) => {
    if (game.htmlCode) {
      setEditorTargetGame(game);
      setActiveTab('editor');
    }
  };

  const handleNewGame = () => {
    setEditorTargetGame(null);
    setActiveTab('editor');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach(g => {
            if (g.title && (g.htmlCode || g.entryUrl)) {
              addGame({
                title: g.title,
                author: g.author || 'Imported',
                description: g.description || 'Imported HTML/JS Game',
                tags: g.tags || ['Imported'],
                htmlCode: g.htmlCode,
                entryUrl: g.entryUrl,
                type: g.entryUrl ? 'entrypoint' : 'inline',
                icon: g.icon || '🎮'
              });
            }
          });
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(games, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'novavault_games_library.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Panic Screen Disguise Overlay */}
      <PanicOverlay />

      {/* Minimal Top Navbar */}
      <Navbar
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
        onNewGame={handleNewGame}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full flex flex-col">
        {/* VIEW 1: GAME RUNNER */}
        {activeTab === 'runner' && activeGame && (
          <GameRunner
            game={activeGame}
            onEditInEditor={() => handleOpenInEditor(activeGame)}
            onBackToLibrary={() => setActiveTab('library')}
          />
        )}

        {/* VIEW 2: CODE STUDIO & EDITOR */}
        {activeTab === 'editor' && (
          <CodeEditor
            initialGame={editorTargetGame}
            onSaved={saved => setEditorTargetGame(saved)}
          />
        )}

        {/* VIEW 3: DIRECT SCRATCHPAD / EMBED */}
        {activeTab === 'embed' && (
          <DirectEmbed />
        )}

        {/* VIEW 4: GAMES LIBRARY (DEFAULT) */}
        {activeTab === 'library' && (
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col space-y-6">
            {/* Header Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-900 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                        : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-900'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search input, Scanner & Library Management */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search games & paths..."
                    className="bg-neutral-950 border border-neutral-800 rounded px-2.5 pl-8 py-1 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 w-44 sm:w-56 font-mono"
                  />
                </div>

                <button
                  onClick={() => setIsScanModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                  title="Open Scanner & Entry Point Hub"
                >
                  <Radar className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Scanner</span>
                </button>

                <label className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Import</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                  title="Export Games as JSON"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Games Grid */}
            {games.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-neutral-900 rounded-2xl bg-neutral-950/30 text-center font-mono max-w-2xl mx-auto my-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
                  <Radar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-neutral-200 mb-1">No Games in Library</h3>
                <p className="text-neutral-500 text-xs max-w-md mb-6 leading-relaxed">
                  Scan the filesystem for HTML5 entry points (like Scarwrit), build a new game in Code Studio, or paste an embed code.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      runDirectoryScan();
                      setIsScanModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <Radar className="w-3.5 h-3.5" />
                    <span>Scan for Games</span>
                  </button>

                  <button
                    onClick={handleNewGame}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-neutral-200 border border-neutral-800 font-medium text-xs rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create HTML/JS Game</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('embed')}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-neutral-200 border border-neutral-800 font-medium text-xs rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Direct Embed</span>
                  </button>
                </div>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-20 border border-neutral-900 rounded-2xl bg-neutral-950/40 p-8 font-mono">
                <p className="text-neutral-400 text-xs mb-3">No games found matching query.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTag('all'); }}
                  className="px-3 py-1.5 bg-neutral-900 text-neutral-300 hover:text-white rounded text-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map(game => (
                  <div
                    key={game.id}
                    onClick={() => playGame(game)}
                    className="group bg-neutral-950/80 hover:bg-neutral-900/90 border border-neutral-900 hover:border-neutral-700 rounded-xl p-5 transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-start space-x-2.5">
                          <span className="text-2xl select-none">{game.icon || (game.type === 'entrypoint' ? '🚀' : '🎮')}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors font-mono">
                                {game.title}
                              </h3>
                              {game.type === 'entrypoint' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                                  Entry Point
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              by {game.author}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(game.id);
                          }}
                          className={`p-1 transition-colors ${
                            game.isFavorite ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${game.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                        {game.description}
                      </p>

                      {game.entryUrl && (
                        <div className="mb-3 px-2 py-1 rounded bg-black/60 border border-neutral-900 font-mono text-[10px] text-neutral-500 truncate">
                          Target: <span className="text-neutral-300">{game.entryUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-900 flex items-center justify-between font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        {game.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-1">
                        {game.htmlCode && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenInEditor(game);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                            title="Edit Code"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteGame(game.id);
                          }}
                          className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playGame(game);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-black font-semibold text-[11px] hover:bg-neutral-200 transition-colors ml-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" /> Play
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimal Monochrome Footer */}
      <footer className="w-full bg-black border-t border-neutral-900 py-4 px-4 md:px-8 mt-auto text-center font-mono text-[11px] text-neutral-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NovaVault • Minimal Unblocked HTML5 & JavaScript Runner</span>
          <div className="flex items-center space-x-3 text-neutral-500">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="hover:text-neutral-300 cursor-pointer"
            >
              Scanner Hub
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCloakModalOpen(true)}
              className="hover:text-neutral-300 cursor-pointer"
            >
              Tab Cloak
            </button>
            <span>•</span>
            <button
              onClick={resetToDefaults}
              className="hover:text-neutral-300 cursor-pointer"
            >
              Reset Library
            </button>
          </div>
        </div>
      </footer>

      {/* Cloak Settings Modal */}
      <CloakModal
        isOpen={isCloakModalOpen}
        onClose={() => setIsCloakModalOpen(false)}
      />

      {/* Scanner & Entry Point Modal */}
      <ScanModal />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MinimalArcadeApp />
    </GameProvider>
  );
}
