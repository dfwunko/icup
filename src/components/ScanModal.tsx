import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Radar,
  X,
  Play,
  CheckCircle2,
  FolderSearch,
  Plus,
  Layers,
  Sparkles,
  FileCode,
  Globe,
  Terminal,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ScannedGameReport } from '../types';

export const ScanModal: React.FC = () => {
  const {
    isScanModalOpen,
    setIsScanModalOpen,
    isScanning,
    scanReports,
    runDirectoryScan,
    probePath,
    createEntryPoint,
    playGame,
    games
  } = useGame();

  const [customPath, setCustomPath] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<ScannedGameReport | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  if (!isScanModalOpen) return null;

  const handleManualProbe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;
    setIsProbing(true);
    setProbeError(null);
    setProbeResult(null);

    try {
      const result = await probePath(customPath.trim());
      if (result) {
        setProbeResult(result);
        if (!customTitle) setCustomTitle(result.title);
      } else {
        setProbeError(`No valid game entry point or HTML document found at "${customPath}".`);
      }
    } catch {
      setProbeError('Failed to inspect path. Check format and permissions.');
    } finally {
      setIsProbing(false);
    }
  };

  const handleRegisterCustom = () => {
    if (!probeResult && !customPath) return;
    const path = probeResult ? probeResult.path : customPath.trim();
    const title = customTitle.trim() || (probeResult ? probeResult.title : 'Custom Entry Point');
    const desc = probeResult ? probeResult.description : 'Manually registered web game entry point.';
    
    const newGame = createEntryPoint({
      title,
      path,
      description: desc,
      author: probeResult?.author || 'Local Entry',
      tags: probeResult?.tags || ['Entry Point', 'HTML/JS'],
      icon: probeResult?.icon || '🎮'
    });

    setIsScanModalOpen(false);
    playGame(newGame);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin text-white' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 font-mono flex items-center gap-2">
                Scanner & Entry Point Hub
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Detect HTML5/JS bundles, directories & web entry points
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScanModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {/* Action trigger row */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <div>
              <div className="font-semibold text-neutral-200">Filesystem Auto-Scanner</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">
                Scans public directory for standalone games (e.g. Scarwrit, HTML bundles)
              </div>
            </div>
            <button
              onClick={() => runDirectoryScan()}
              disabled={isScanning}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-medium transition-colors disabled:opacity-50 cursor-pointer text-[11px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Rescan Directory'}</span>
            </button>
          </div>

          {/* Scanned Games Report */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="uppercase tracking-wider">Detected Games ({scanReports.length})</span>
              <span className="text-neutral-500">Auto-synced with library</span>
            </div>

            {scanReports.length === 0 ? (
              <div className="p-8 text-center border border-neutral-900 rounded-xl bg-neutral-900/20 text-neutral-500">
                <FolderSearch className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>No games detected in default scan paths yet.</p>
                <p className="text-[10px] mt-1 text-neutral-600">
                  Place files in /public/ or use the custom entry point probe below.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {scanReports.map(report => {
                  const alreadyRegistered = games.some(g => g.entryUrl === report.path);
                  return (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl select-none">{report.icon}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-neutral-100 text-sm">{report.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Entry Point
                              </span>
                            </div>
                            <p className="text-neutral-400 text-[11px] mt-0.5 line-clamp-2">{report.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const existing = games.find(g => g.entryUrl === report.path);
                            if (existing) {
                              setIsScanModalOpen(false);
                              playGame(existing);
                            } else {
                              const game = createEntryPoint({
                                title: report.title,
                                path: report.path,
                                description: report.description,
                                author: report.author,
                                tags: report.tags,
                                icon: report.icon
                              });
                              setIsScanModalOpen(false);
                              playGame(game);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors cursor-pointer text-[11px] shrink-0"
                        >
                          <Play className="w-3 h-3 text-white fill-white" />
                          <span>Launch</span>
                        </button>
                      </div>

                      {/* File bundle inventory */}
                      <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                        <span className="text-neutral-500 font-semibold">Path:</span>
                        <code className="px-1.5 py-0.5 rounded bg-black border border-neutral-800 text-neutral-300">
                          {report.path}
                        </code>
                        {report.detectedFiles.slice(0, 5).map(f => (
                          <span key={f} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                            {f}
                          </span>
                        ))}
                        {report.detectedFiles.length > 5 && (
                          <span className="text-neutral-500">+{report.detectedFiles.length - 5} assets</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Entry Point Prober */}
          <div className="pt-4 border-t border-neutral-900 space-y-3">
            <div className="text-neutral-300 font-semibold flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Entry Point</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Provide a local path (e.g. <code className="text-neutral-200">/sacrewit/index.html</code>) or custom web URL to register as a playable entry point.
            </p>

            <form onSubmit={handleManualProbe} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    placeholder="/my-game/index.html or https://..."
                    className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProbing || !customPath.trim()}
                  className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {isProbing ? 'Probing...' : 'Probe Path'}
                </button>
              </div>

              {probeError && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-[11px] flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{probeError}</span>
                </div>
              )}

              {probeResult && (
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid Entry Point Detected
                    </span>
                    <span className="text-[10px] text-neutral-400">{probeResult.sizeEstimate}</span>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      placeholder="Game Title"
                      className="w-full px-2.5 py-1.5 rounded bg-black border border-neutral-800 text-neutral-100 text-xs font-semibold"
                    />
                    <p className="text-[11px] text-neutral-400">{probeResult.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterCustom}
                    className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Library & Launch</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-900 bg-neutral-900/30 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>NovaVault Game Discovery Engine</span>
          <button
            onClick={() => setIsScanModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
