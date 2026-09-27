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
import { HtmlJsGame } from './types';
import {
  Play,
  Code2,
  Trash2,
  Star,
  Plus,
  Upload,
  Download,
  RotateCcw,
  Search,
  Layers,
  Terminal,
  FileCode,
  Sparkles,
  ExternalLink
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
        g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'all' || g.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [games, searchQuery, selectedTag]);

  const handleOpenInEditor = (game: HtmlJsGame) => {
    setEditorTargetGame(game);
    setActiveTab('editor');
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
            if (g.title && g.htmlCode) {
              addGame({
                title: g.title,
                author: g.author || 'Imported',
                description: g.description || 'Imported HTML/JS Game',
                tags: g.tags || ['Imported'],
                htmlCode: g.htmlCode,
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

              {/* Search input & Library Management */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search games..."
                    className="bg-neutral-950 border border-neutral-800 rounded px-2.5 pl-8 py-1 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 w-44 sm:w-56"
                  />
                </div>

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
            {filteredGames.length === 0 ? (
              <div className="text-center py-20 border border-neutral-900 rounded-2xl bg-neutral-950/40 p-8 font-mono">
                <p className="text-neutral-400 text-xs mb-3">No games found matching query.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTag('all'); }}
                  className="px-3 py-1.5 bg-neutral-900 text-neutral-300 hover:text-white rounded text-xs"
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
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors font-mono">
                            {game.title}
                          </h3>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            by {game.author}
                          </span>
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
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenInEditor(game);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                          title="Edit Code"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>

                        {games.length > 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteGame(game.id);
                            }}
                            className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
                            title="Delete Game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playGame(game);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-black font-semibold text-[11px] hover:bg-neutral-200 transition-colors ml-1"
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
