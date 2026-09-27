import React, { useRef, useState } from 'react';
import { CustomGame } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Maximize2, Minimize2, Code, ArrowLeft } from 'lucide-react';

interface CustomSandboxGameProps {
  customGame: CustomGame;
  onEditCode?: () => void;
  onBack?: () => void;
}

export const CustomSandboxGame: React.FC<CustomSandboxGameProps> = ({
  customGame,
  onEditCode,
  onBack,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = () => {
    soundEngine.playClick();
    setReloadKey(k => k + 1);
  };

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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center bg-slate-950 p-4"
    >
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 z-20">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Vault
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-white">{customGame.title}</h2>
            <p className="text-xs text-purple-400 font-mono">By {customGame.author || 'Anonymous Dev'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onEditCode && (
            <button
              onClick={onEditCode}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Code className="w-4 h-4" /> Edit Code
            </button>
          )}
          <button
            onClick={handleReload}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 transition-all cursor-pointer"
            title="Reload Sandbox"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sandboxed Game IFrame */}
      <div className="w-full max-w-4xl flex-1 bg-slate-900 rounded-2xl border-2 border-purple-500/30 overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.2)]">
        <iframe
          key={reloadKey}
          ref={iframeRef}
          srcDoc={customGame.htmlCode}
          title={customGame.title}
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="w-full h-full border-0 bg-slate-950"
        />
      </div>
    </div>
  );
};
