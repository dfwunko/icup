import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Plus, Code2, Trash2, ArrowRight } from 'lucide-react';

export const DirectEmbed: React.FC = () => {
  const { directEmbedCode, setDirectEmbedCode, addGame, setActiveTab } = useGame();
  const [isRunning, setIsRunning] = useState(false);
  const [embedTitle, setEmbedTitle] = useState('Quick Game');
  const [frameKey, setFrameKey] = useState(0);

  const handleRun = () => {
    if (directEmbedCode.trim()) {
      setIsRunning(true);
      setFrameKey(k => k + 1);
    }
  };

  const handleSaveToLibrary = () => {
    if (directEmbedCode.trim()) {
      addGame({
        title: embedTitle || 'Imported Game',
        author: 'Scratchpad',
        description: 'Imported from direct scratchpad runner.',
        tags: ['Custom', 'Direct'],
        htmlCode: directEmbedCode,
      });
      setActiveTab('library');
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-900">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">Direct HTML/JS Scratchpad</h2>
          <p className="text-[11px] text-neutral-500">Paste any raw HTML or JavaScript game snippet to run it instantly</p>
        </div>

        <div className="flex items-center space-x-2">
          {isRunning && (
            <button
              onClick={() => setIsRunning(false)}
              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 rounded transition-colors cursor-pointer"
            >
              Edit Script
            </button>
          )}

          <button
            onClick={handleSaveToLibrary}
            className="flex items-center gap-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>

          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3.5 py-1 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Reload' : 'Launch'}</span>
          </button>
        </div>
      </div>

      {!isRunning ? (
        <div className="flex-1 flex flex-col bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden p-4">
          <div className="mb-3 flex items-center space-x-3">
            <span className="text-neutral-500">Title:</span>
            <input
              type="text"
              value={embedTitle}
              onChange={e => setEmbedTitle(e.target.value)}
              placeholder="e.g. My Flappy Clone"
              className="bg-neutral-900 border border-neutral-800 text-white px-2.5 py-1 rounded text-xs focus:outline-none focus:border-neutral-600 w-64"
            />
          </div>

          <textarea
            value={directEmbedCode}
            onChange={e => setDirectEmbedCode(e.target.value)}
            placeholder="Paste your full HTML, Canvas, and JavaScript code here... (e.g. <!DOCTYPE html><html><body><canvas id='c'></canvas><script>...</script></body></html>)"
            className="flex-1 w-full bg-black border border-neutral-900 rounded-lg p-4 text-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-700 resize-none leading-relaxed"
            rows={18}
          />
        </div>
      ) : (
        <div className="flex-1 w-full bg-black border border-neutral-900 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          <iframe
            key={frameKey}
            srcDoc={directEmbedCode}
            title="Direct Scratchpad Game"
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full flex-1 border-0 bg-black"
          />
        </div>
      )}
    </div>
  );
};
