import React from 'react';
import { useGame } from '../context/GameContext';
import { CLOAK_PROFILES } from '../data/initialGames';
import { EyeOff, Check, X, Globe, Shield } from 'lucide-react';

interface CloakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloakModal: React.FC<CloakModalProps> = ({ isOpen, onClose }) => {
  const { currentCloak, setCloakProfile, panicDisguise, setPanicDisguise } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stealth & Tab Cloaking</h3>
              <p className="text-[11px] text-neutral-500">Mask browser tab title and set panic disguise screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Presets */}
        <div className="mb-5">
          <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-2.5">
            Browser Tab Disguise
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setCloakProfile(null)}
              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                currentCloak === null
                  ? 'bg-neutral-900 border-neutral-600 text-white'
                  : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-xs font-medium text-neutral-200">Default NovaVault</div>
                  <div className="text-[10px] text-neutral-500">Uncloaked</div>
                </div>
              </div>
              {currentCloak === null && <Check className="w-3.5 h-3.5 text-white" />}
            </button>

            {CLOAK_PROFILES.map(profile => {
              const isSelected = currentCloak?.id === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => setCloakProfile(profile.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-600 text-white'
                      : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={profile.favicon}
                      alt={profile.name}
                      className="w-4 h-4 rounded-xs"
                      onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div>
                      <div className="text-xs font-medium text-neutral-200">{profile.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{profile.previewDomain}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panic Screen Target */}
        <div className="mb-5">
          <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-2">
            Panic Key (Esc / P) Target Screen
          </label>
          <div className="flex flex-wrap gap-2">
            {(['classroom', 'docs', 'calculator', 'wikipedia'] as const).map(disguise => (
              <button
                key={disguise}
                onClick={() => setPanicDisguise(disguise)}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors cursor-pointer ${
                  panicDisguise === disguise
                    ? 'bg-neutral-900 border-neutral-600 text-white font-medium'
                    : 'bg-neutral-950 border-neutral-900 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {disguise}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-900 rounded-lg p-3 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Instant Panic Hotkey:</span>
          <div className="space-x-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 font-bold">Esc</kbd>
            <span className="text-neutral-600">or</span>
            <kbd className="px-1.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 font-bold">P</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
