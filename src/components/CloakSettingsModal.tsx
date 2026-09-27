import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CLOAK_PROFILES } from '../data/gamesList';
import { soundEngine } from '../audio/soundEngine';
import { Shield, Check, X, Globe, EyeOff } from 'lucide-react';

interface CloakSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloakSettingsModal: React.FC<CloakSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentCloak, setCloakProfile, panicDisguise, setPanicDisguise } = useGame();
  const [customTitle, setCustomTitle] = useState('');
  const [customIcon, setCustomIcon] = useState('');

  if (!isOpen) return null;

  const handleSelectProfile = (id: string | null) => {
    soundEngine.playClick();
    setCloakProfile(id);
  };

  const handleApplyCustom = () => {
    if (customTitle.trim()) {
      soundEngine.playClick();
      document.title = customTitle;
      if (customIcon.trim()) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = customIcon;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-['Outfit']">STEALTH & TAB CLOAKING</h3>
              <p className="text-xs text-slate-400">Mask browser tabs and configure instant panic screen hotkey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Profiles */}
        <div className="my-6">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Quick Tab Cloak Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleSelectProfile(null)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                currentCloak === null
                  ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm font-bold">Default NovaVault</div>
                  <div className="text-[11px] text-slate-400">Original Arcade Branding</div>
                </div>
              </div>
              {currentCloak === null && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            {CLOAK_PROFILES.map(profile => {
              const isSelected = currentCloak?.id === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={profile.favicon}
                      alt={profile.name}
                      className="w-5 h-5 rounded"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{profile.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                        {profile.previewUrl}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panic Disguise Screen Target */}
        <div className="mb-6">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Panic Key (P / ~) Disguise Screen
          </label>
          <div className="flex flex-wrap gap-2">
            {(['classroom', 'docs', 'calculator', 'wikipedia'] as const).map(disguise => (
              <button
                key={disguise}
                onClick={() => {
                  soundEngine.playClick();
                  setPanicDisguise(disguise);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer ${
                  panicDisguise === disguise
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {disguise} Disguise
              </button>
            ))}
          </div>
        </div>

        {/* Hotkey Guide */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Instant Panic Trigger Hotkey:</span>
          <div className="flex items-center space-x-1.5 font-mono">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-bold">P</kbd>
            <span className="text-slate-500">or</span>
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-bold">`</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
