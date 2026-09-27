import React, { useState, useEffect } from 'react';
import { HtmlJsGame } from '../types';
import { useGame } from '../context/GameContext';
import {
  Play,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Check,
  FileCode,
  Layers,
  Terminal,
  Columns,
  Maximize2
} from 'lucide-react';

interface CodeEditorProps {
  initialGame?: HtmlJsGame | null;
  onSaved?: (game: HtmlJsGame) => void;
}

const BOILERPLATE_SNIPPETS = [
  {
    name: 'Blank Canvas 2D',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { background: #080808; border: 1px solid #262626; border-radius: 8px; }
  </style>
</head>
<body>
  <canvas id="c" width="500" height="400"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let x = 250, y = 200, vx = 3, vy = 2;

    function loop() {
      x += vx; y += vy;
      if (x <= 10 || x >= canvas.width - 10) vx = -vx;
      if (y <= 10 || y >= canvas.height - 10) vy = -vy;

      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    name: 'Keyboard Player Controller',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { background: #090909; border: 1px solid #262626; border-radius: 8px; }
  </style>
</head>
<body>
  <canvas id="c" width="500" height="400"></canvas>
  <script>
    const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
    let px = 250, py = 200, speed = 4;
    const keys = {};

    window.onkeydown = e => { keys[e.code] = true; if(['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); };
    window.onkeyup = e => { keys[e.code] = false; };

    function loop() {
      if (keys['KeyW'] || keys['ArrowUp']) py = Math.max(12, py - speed);
      if (keys['KeyS'] || keys['ArrowDown']) py = Math.min(canvas.height - 12, py + speed);
      if (keys['KeyA'] || keys['ArrowLeft']) px = Math.max(12, px - speed);
      if (keys['KeyD'] || keys['ArrowRight']) px = Math.min(canvas.width - 12, px + speed);

      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 10, py - 10, 20, 20);

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    name: 'Web Audio Sound Synth',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; user-select: none; }
    button { background: #171717; color: #fff; border: 1px solid #333; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-family: monospace; cursor: pointer; margin: 6px; }
    button:hover { background: #262626; }
  </style>
</head>
<body>
  <h3>Web Audio API Sound Effects</h3>
  <div style="margin-top: 16px;">
    <button onclick="playLaser()">Laser Shot</button>
    <button onclick="playJump()">Jump Beep</button>
    <button onclick="playCoin()">Coin Chime</button>
  </div>
  <script>
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playLaser() {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.15);
    }

    function playJump() {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.12);
    }

    function playCoin() {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.25);
    }
  </script>
</body>
</html>`
  }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({ initialGame, onSaved }) => {
  const { addGame, updateGame, playGame, games } = useGame();

  const [currentGameId, setCurrentGameId] = useState<string | null>(
    initialGame ? initialGame.id : games[0]?.id || null
  );

  const [title, setTitle] = useState(
    initialGame ? initialGame.title : games[0]?.title || 'Custom Game'
  );
  const [author, setAuthor] = useState(
    initialGame ? initialGame.author : games[0]?.author || 'Developer'
  );
  const [description, setDescription] = useState(
    initialGame ? initialGame.description : games[0]?.description || 'Custom HTML & JavaScript game project.'
  );
  const [htmlCode, setHtmlCode] = useState(
    initialGame ? initialGame.htmlCode : games[0]?.htmlCode || BOILERPLATE_SNIPPETS[0].code
  );

  const [previewKey, setPreviewKey] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [splitView, setSplitView] = useState<'split' | 'code-only' | 'preview-only'>('split');

  useEffect(() => {
    if (initialGame) {
      setCurrentGameId(initialGame.id);
      setTitle(initialGame.title);
      setAuthor(initialGame.author);
      setDescription(initialGame.description);
      setHtmlCode(initialGame.htmlCode);
      setPreviewKey(k => k + 1);
    }
  }, [initialGame]);

  const handleSave = () => {
    let saved: HtmlJsGame;
    if (currentGameId) {
      updateGame(currentGameId, {
        title: title.trim() || 'Untitled Game',
        author: author.trim() || 'Anonymous',
        description: description.trim(),
        htmlCode,
      });
      saved = {
        id: currentGameId,
        title,
        author,
        description,
        htmlCode,
        tags: ['Custom'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      saved = addGame({
        title: title.trim() || 'Untitled Game',
        author: author.trim() || 'Anonymous',
        description: description.trim(),
        htmlCode,
        tags: ['Custom'],
      });
      setCurrentGameId(saved.id);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    if (onSaved) onSaved(saved);
  };

  const handlePlayDirect = () => {
    const gameToRun: HtmlJsGame = {
      id: currentGameId || 'temp-' + Date.now(),
      title,
      author,
      description,
      htmlCode,
      tags: ['Custom'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    playGame(gameToRun);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        setHtmlCode(content);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        setPreviewKey(k => k + 1);
      }
    };
    reader.readAsText(file);
  };

  const handleExportHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'game'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectSnippet = (snippet: typeof BOILERPLATE_SNIPPETS[0]) => {
    setHtmlCode(snippet.code);
    setTitle(snippet.name);
    setPreviewKey(k => k + 1);
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-black overflow-hidden select-none font-mono text-xs">
      {/* Top Action Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-neutral-950 border-b border-neutral-900 z-10">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Game Title"
            className="bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded px-2.5 py-1 text-xs text-white focus:outline-none w-44 font-semibold"
          />
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author"
            className="bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded px-2.5 py-1 text-xs text-neutral-400 focus:outline-none w-28"
          />
        </div>

        {/* View and Run Actions */}
        <div className="flex items-center space-x-2">
          {/* Split View Toggle */}
          <div className="hidden md:flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
            <button
              onClick={() => setSplitView('split')}
              className={`px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                splitView === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setSplitView('code-only')}
              className={`px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                splitView === 'code-only' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setSplitView('preview-only')}
              className={`px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                splitView === 'preview-only' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Snippets Dropdown */}
          <select
            onChange={e => {
              const snip = BOILERPLATE_SNIPPETS.find(s => s.name === e.target.value);
              if (snip) handleSelectSnippet(snip);
            }}
            defaultValue=""
            className="bg-neutral-900 border border-neutral-800 text-neutral-400 rounded px-2 py-1 text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Starter Snippets</option>
            {BOILERPLATE_SNIPPETS.map((s, i) => (
              <option key={i} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Import / Export */}
          <label className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded text-[11px] transition-colors cursor-pointer">
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".html,.js,.htm" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded text-[11px] transition-colors cursor-pointer"
            title="Download Standalone HTML file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Run Live Preview */}
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded text-[11px] transition-colors cursor-pointer"
            title="Reload Preview"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Run</span>
          </button>

          {/* Save Game */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-neutral-100 hover:bg-white text-black font-semibold rounded text-[11px] transition-colors cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            <span>{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>

          {/* Play Fullscreen */}
          <button
            onClick={handlePlayDirect}
            className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Launch</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
        {/* Code Editor Pane */}
        {(splitView === 'split' || splitView === 'code-only') && (
          <div className={`flex flex-col bg-black border-r border-neutral-900 overflow-hidden ${
            splitView === 'code-only' ? 'col-span-full' : ''
          }`}>
            <div className="py-1 px-3 bg-neutral-950/60 border-b border-neutral-900 text-[10px] text-neutral-500 flex items-center justify-between">
              <span>HTML5 / JavaScript / CSS Document</span>
              <span>{htmlCode.length} characters</span>
            </div>
            <textarea
              value={htmlCode}
              onChange={e => setHtmlCode(e.target.value)}
              spellCheck={false}
              placeholder="Paste or write your HTML & JavaScript game code here..."
              className="flex-1 w-full bg-black text-neutral-300 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed selection:bg-neutral-800 selection:text-white"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(splitView === 'split' || splitView === 'preview-only') && (
          <div className={`flex flex-col bg-black overflow-hidden relative ${
            splitView === 'preview-only' ? 'col-span-full' : ''
          }`}>
            <div className="py-1 px-3 bg-neutral-950/60 border-b border-neutral-900 text-[10px] text-neutral-500 flex items-center justify-between">
              <span>Live Sandboxed Output</span>
              <span className="text-neutral-400">FPS: Active</span>
            </div>
            <div className="flex-1 bg-black relative flex items-center justify-center">
              <iframe
                key={previewKey}
                srcDoc={htmlCode}
                title="Live Sandbox Preview"
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-0 bg-black"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
