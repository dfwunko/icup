import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CustomGame } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Code, Play, Save, Plus, Trash2, Download, Upload, Sparkles, Check, X, FileCode } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomGameStudioProps {
  onClose: () => void;
}

const TEMPLATES = [
  {
    name: 'Canvas Pong Arcade',
    author: 'Template',
    description: '2-Player / AI table tennis with physics & score.',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { border: 2px solid #06b6d4; border-radius: 8px; box-shadow: 0 0 25px rgba(6,182,212,0.3); }
  </style>
</head>
<body>
  <canvas id="c" width="560" height="360"></canvas>
  <div style="margin-top:8px;font-size:12px;color:#94a3b8">W / S to move left paddle. First to 5 wins!</div>
  <script>
    const c = document.getElementById('c'), ctx = c.getContext('2d');
    let p1 = 140, p2 = 140, bx = 280, by = 180, vx = 4, vy = 3, s1 = 0, s2 = 0;
    const keys = {};
    window.onkeydown = e => keys[e.key] = true;
    window.onkeyup = e => keys[e.key] = false;

    function loop() {
      if (keys['w'] || keys['W'] || keys['ArrowUp']) p1 = Math.max(0, p1 - 6);
      if (keys['s'] || keys['S'] || keys['ArrowDown']) p1 = Math.min(290, p1 + 6);
      p2 += (by - 35 - p2) * 0.08; // AI paddle

      bx += vx; by += vy;
      if (by <= 5 || by >= 355) vy = -vy;

      if (bx <= 25 && by >= p1 && by <= p1 + 70) vx = Math.abs(vx) + 0.2;
      if (bx >= 535 && by >= p2 && by <= p2 + 70) vx = -Math.abs(vx) - 0.2;

      if (bx < 0) { s2++; bx = 280; by = 180; vx = 4; }
      if (bx > 560) { s1++; bx = 280; by = 180; vx = -4; }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 560, 360);

      ctx.font = '28px monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(s1, 230, 45);
      ctx.fillStyle = '#ec4899';
      ctx.fillText(s2, 310, 45);

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(15, p1, 10, 70);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(535, p2, 10, 70);

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    name: 'Clicker Diamond Rush',
    author: 'Template',
    description: 'Fast tapping diamond miner with upgrades and particle bursts.',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #090d16; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; user-select: none; }
    #gem { font-size: 80px; cursor: pointer; transition: transform 0.1s; filter: drop-shadow(0 0 20px #00ffff); }
    #gem:active { transform: scale(0.85); }
    .score { font-size: 32px; font-weight: bold; color: #38bdf8; margin: 15px; font-family: monospace; }
    button { background: #1e293b; border: 1px solid #38bdf8; color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; margin: 5px; }
    button:hover { background: #0284c7; }
  </style>
</head>
<body>
  <div class="score">💎 <span id="val">0</span> Gems</div>
  <div id="gem">💎</div>
  <div style="margin-top:20px;">
    <button id="up1">Buy Auto-Pickaxe (Cost: 25)</button>
    <button id="up2">Buy Laser Drill (Cost: 150)</button>
  </div>
  <script>
    let gems = 0, rate = 0;
    const val = document.getElementById('val');
    document.getElementById('gem').onclick = () => { gems += 1; update(); };
    document.getElementById('up1').onclick = () => { if(gems >= 25) { gems -= 25; rate += 2; update(); } };
    document.getElementById('up2').onclick = () => { if(gems >= 150) { gems -= 150; rate += 15; update(); } };
    setInterval(() => { gems += rate / 10; update(); }, 100);
    function update() { val.textContent = Math.floor(gems); }
  </script>
</body>
</html>`
  },
  {
    name: 'Particle Physics Galaxy',
    author: 'Template',
    description: 'Interactive mouse-following glowing stellar nebula.',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #02040a; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const c = document.getElementById('c'), ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    let particles = [], mouse = { x: c.width/2, y: c.height/2 };
    window.onmousemove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: 'hsl(' + (Math.random() * 360) + ', 85%, 60%)'
      });
    }
    function draw() {
      ctx.fillStyle = 'rgba(2, 4, 10, 0.15)';
      ctx.fillRect(0, 0, c.width, c.height);
      for (let p of particles) {
        let dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
        if (dist < 200) { p.vx += dx * 0.001; p.vy += dy * 0.001; }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>`
  }
];

export const CustomGameStudio: React.FC<CustomGameStudioProps> = ({ onClose }) => {
  const { customGames, saveCustomGame, deleteCustomGame, openCustomGame } = useGame();

  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    customGames.length > 0 ? customGames[0].id : null
  );

  const [title, setTitle] = useState(
    customGames.length > 0 ? customGames[0].title : 'My Custom HTML5 Game'
  );
  const [author, setAuthor] = useState(
    customGames.length > 0 ? customGames[0].author : 'Game Dev'
  );
  const [description, setDescription] = useState(
    customGames.length > 0 ? customGames[0].description : 'Awesome custom game built in NovaVault.'
  );
  const [htmlCode, setHtmlCode] = useState(
    customGames.length > 0 ? customGames[0].htmlCode : TEMPLATES[0].code
  );

  const [previewKey, setPreviewKey] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectGame = (game: CustomGame) => {
    soundEngine.playClick();
    setSelectedGameId(game.id);
    setTitle(game.title);
    setAuthor(game.author);
    setDescription(game.description);
    setHtmlCode(game.htmlCode);
    setPreviewKey(k => k + 1);
  };

  const handleNewGame = () => {
    soundEngine.playClick();
    setSelectedGameId(null);
    setTitle('New Canvas Project');
    setAuthor('Indie Dev');
    setDescription('Custom HTML5 Canvas & JavaScript game project.');
    setHtmlCode(TEMPLATES[0].code);
    setPreviewKey(k => k + 1);
  };

  const handleLoadTemplate = (tpl: typeof TEMPLATES[0]) => {
    soundEngine.playClick();
    setTitle(tpl.name);
    setAuthor(tpl.author);
    setDescription(tpl.description);
    setHtmlCode(tpl.code);
    setPreviewKey(k => k + 1);
  };

  const handleSave = () => {
    soundEngine.playPowerup();
    const saved = saveCustomGame(
      {
        title: title.trim() || 'Untitled Game',
        author: author.trim() || 'Anonymous',
        description: description.trim() || 'No description provided.',
        htmlCode,
      },
      selectedGameId || undefined
    );
    setSelectedGameId(saved.id);
    setSavedSuccess(true);
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    deleteCustomGame(id);
    if (selectedGameId === id) {
      handleNewGame();
    }
  };

  const handleExportJson = () => {
    soundEngine.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customGames, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'novavault_custom_games.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
              saveCustomGame({
                title: g.title,
                author: g.author || 'Imported Dev',
                description: g.description || 'Imported custom game',
                htmlCode: g.htmlCode,
              });
            }
          });
          soundEngine.playPowerup();
        }
      } catch {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handlePlayDirect = () => {
    const gameToRun: CustomGame = {
      id: selectedGameId || 'temp-' + Date.now(),
      title,
      author,
      description,
      htmlCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    openCustomGame(gameToRun);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
              HTML5 GAME STUDIO & CODE RUNNER
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                SANDBOX
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Write, paste, test, and save any custom HTML5 Canvas & JavaScript arcade games!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayDirect}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Play className="w-4 h-4 fill-slate-950" /> Play Fullscreen
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Saved!' : 'Save Game'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
        {/* Left Sidebar: Game Projects Library & Presets (3 cols) */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">My Saved Games</span>
            <button
              onClick={handleNewGame}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg hover:bg-purple-500/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* List of custom games */}
          <div className="flex flex-col space-y-2 mb-6">
            {customGames.map(g => (
              <div
                key={g.id}
                onClick={() => handleSelectGame(g)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedGameId === g.id
                    ? 'bg-purple-500/15 border-purple-500/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-sm font-bold truncate">{g.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{g.author || 'Dev'}</div>
                </div>
                {customGames.length > 1 && (
                  <button
                    onClick={e => handleDelete(g.id, e)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Starter Templates */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase block mb-2">
              Starter Templates
            </span>
            <div className="flex flex-col space-y-1.5">
              {TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadTemplate(t)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-300 text-xs text-left cursor-pointer transition-colors"
                >
                  <span className="truncate">{t.name}</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Import / Export JSON */}
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handleExportJson}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <label className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Center: Code Editor & Metadata Inputs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Metadata Fields */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Game Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-purple-400" /> HTML5 / JavaScript Source Code
            </span>
            <button
              onClick={() => setPreviewKey(k => k + 1)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-cyan-300" /> Run Live
            </button>
          </div>

          {/* Code Textarea */}
          <textarea
            value={htmlCode}
            onChange={e => setHtmlCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none shadow-inner selection:bg-purple-500/30 selection:text-purple-200"
          />
        </div>

        {/* Right: Live Interactive Sandbox Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-400">Live Sandboxed Test Preview</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Runner
            </span>
          </div>

          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative">
            <iframe
              key={previewKey}
              srcDoc={htmlCode}
              title="Game Preview"
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-0 bg-slate-950"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
