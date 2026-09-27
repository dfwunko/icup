import React, { useRef, useState } from 'react';
import { HtmlJsGame } from '../types';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Code2,
  ArrowLeft,
  Share2,
  Download,
  Info,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface GameRunnerProps {
  game: HtmlJsGame;
  onEditInEditor: () => void;
  onBackToLibrary: () => void;
}

export const GameRunner: React.FC<GameRunnerProps> = ({
  game,
  onEditInEditor,
  onBackToLibrary,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyCodeOrUrl = () => {
    const textToCopy = game.entryUrl || game.htmlCode || '';
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadHtml = () => {
    if (!game.htmlCode) return;
    const blob = new Blob([game.htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 flex flex-col bg-black overflow-hidden select-none"
    >
      {/* Top Runner Action Bar */}
      <div className="flex items-center justify-between py-2 px-4 bg-neutral-950 border-b border-neutral-900 z-10 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-base select-none">{game.icon || '🎮'}</span>
            <span className="font-semibold text-neutral-100">{game.title}</span>
            {game.type === 'entrypoint' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800">
                Entry Point
              </span>
            )}
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-500">by {game.author}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showInfo
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="Game Info & Description"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {game.htmlCode && (
            <button
              onClick={onEditInEditor}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Open & Edit HTML/JS Code"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Code</span>
            </button>
          )}

          <button
            onClick={handleCopyCodeOrUrl}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title={game.entryUrl ? "Copy Entry Point URL" : "Copy HTML5 Code"}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {game.htmlCode && (
            <button
              onClick={handleDownloadHtml}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Download Standalone .html File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleReload}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Info Drawer */}
      {showInfo && (
        <div className="bg-neutral-950/95 border-b border-neutral-900 p-4 text-xs font-mono flex items-center justify-between text-neutral-300">
          <div>
            <p className="mb-1 text-neutral-200">{game.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-500">
              {game.entryUrl && (
                <>
                  <span className="text-neutral-400">Path: <code className="text-neutral-200">{game.entryUrl}</code></span>
                  <span>•</span>
                </>
              )}
              <span>Tags: {game.tags.join(', ')}</span>
              <span>•</span>
              <span>Updated: {new Date(game.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          {copied && (
            <span className="text-emerald-400 text-[11px] font-bold">
              {game.entryUrl ? 'Entry URL copied!' : 'Code copied to clipboard!'}
            </span>
          )}
        </div>
      )}

      {/* Sandboxed Game IFrame Container */}
      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        {game.entryUrl ? (
          <iframe
            key={`entry-${game.id}-${reloadKey}`}
            src={game.entryUrl}
            title={game.title}
            sandbox="allow-scripts allow-modals allow-same-origin allow-popups"
            className="w-full h-full border-0 bg-black"
          />
        ) : (
          <iframe
            key={`inline-${game.id}-${reloadKey}`}
            srcDoc={game.htmlCode}
            title={game.title}
            sandbox="allow-scripts allow-modals allow-same-origin allow-popups"
            className="w-full h-full border-0 bg-black"
          />
        )}
      </div>
    </div>
  );
};
