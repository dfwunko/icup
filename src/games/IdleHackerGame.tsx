import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { Terminal, Cpu, Server, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeItem {
  id: string;
  name: string;
  cost: number;
  cps: number; // crypto per second
  count: number;
  icon: string;
  description: string;
}

export const IdleHackerGame: React.FC = () => {
  const { saveHighScore, highScores, unlockAchievement } = useGame();
  const [crypto, setCrypto] = useState<number>(0);
  const [totalMined, setTotalMined] = useState<number>(0);
  const [prestigeCount, setPrestigeCount] = useState<number>(0);
  const [prestigeBonus, setPrestigeBonus] = useState<number>(1);
  const [clickPower, setClickPower] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([
    'System initialized. Connect to mainframe node #001...',
    'Awaiting manual override injects...',
  ]);

  const [upgrades, setUpgrades] = useState<UpgradeItem[]>([
    { id: 'script', name: 'Auto-Spam Script', cost: 15, cps: 1, count: 0, icon: '📜', description: 'Lightweight bash automation script.' },
    { id: 'gpu', name: 'GPU Mining Rig', cost: 100, cps: 8, count: 0, icon: '⚡', description: 'Overclocked RTX tensor nodes.' },
    { id: 'botnet', name: 'IoT Botnet Swarm', cost: 1100, cps: 55, count: 0, icon: '🤖', description: 'Infiltrated smart fridge mesh network.' },
    { id: 'server', name: 'Darknet Server Farm', cost: 12000, cps: 320, count: 0, icon: '🖥️', description: 'Liquid-cooled undersea server arrays.' },
    { id: 'ai', name: 'Neural AI Infiltrator', cost: 130000, cps: 2100, count: 0, icon: '🧠', description: 'Self-evolving cyber exploit agent.' },
    { id: 'quantum', name: 'Quantum Core Supercomputer', cost: 1400000, cps: 18000, count: 0, icon: '⚛️', description: 'Decodes 2048-bit encryption in milliseconds.' },
  ]);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('novavault_idle_hacker');
      if (saved) {
        const data = JSON.parse(saved);
        setCrypto(data.crypto || 0);
        setTotalMined(data.totalMined || 0);
        setPrestigeCount(data.prestigeCount || 0);
        setPrestigeBonus(data.prestigeBonus || 1);
        setClickPower(data.clickPower || 1);
        if (data.upgrades) setUpgrades(data.upgrades);
      }
    } catch {}
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('novavault_idle_hacker', JSON.stringify({
        crypto,
        totalMined,
        prestigeCount,
        prestigeBonus,
        clickPower,
        upgrades,
      }));
    } catch {}
  }, [crypto, totalMined, prestigeCount, prestigeBonus, clickPower, upgrades]);

  const totalCps = upgrades.reduce((acc, u) => acc + u.cps * u.count, 0) * prestigeBonus;

  // Passive mining loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalCps > 0) {
        const generated = totalCps / 10;
        setCrypto(c => {
          const next = c + generated;
          saveHighScore('idle-hacker', Math.floor(next));
          return next;
        });
        setTotalMined(t => t + generated);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [totalCps, saveHighScore]);

  const handleManualHack = () => {
    soundEngine.playClick();
    const gained = clickPower * prestigeBonus;
    setCrypto(c => c + gained);
    setTotalMined(t => t + gained);

    if (Math.random() < 0.2) {
      const msgs = [
        'Exploit payload injected into node port 8080...',
        'Hash cracked: +50 hashes/sec block rewarded',
        'Firewall bypassed with zero-day exploit',
        'Intercepted encrypted crypto payload...',
      ];
      setLogs(prev => [msgs[Math.floor(Math.random() * msgs.length)], ...prev.slice(0, 7)]);
    }
  };

  const buyUpgrade = (id: string) => {
    const up = upgrades.find(u => u.id === id);
    if (!up || crypto < up.cost) return;

    soundEngine.playPowerup();
    setCrypto(c => c - up.cost);
    setUpgrades(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextCount = u.count + 1;
          if (nextCount >= 5) unlockAchievement('master_hacker');
          return {
            ...u,
            count: nextCount,
            cost: Math.floor(u.cost * 1.15),
          };
        }
        return u;
      })
    );
  };

  const prestigeReset = () => {
    if (totalMined < 100000) return;
    const gainedMultiplier = 1 + Math.floor(Math.sqrt(totalMined / 100000));
    setPrestigeBonus(prev => prev + gainedMultiplier);
    setPrestigeCount(p => p + 1);
    setCrypto(0);
    setClickPower(1 + gainedMultiplier);
    setUpgrades(prev => prev.map(u => ({ ...u, count: 0, cost: Math.floor(u.cost / Math.pow(1.15, u.count)) })));
    confetti({ particleCount: 100, spread: 80 });
    soundEngine.playPowerup();
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch select-none bg-slate-950 p-4 gap-4 overflow-y-auto">
      {/* Left Column: Mainframe Terminal & Clicker */}
      <div className="flex-1 flex flex-col items-center justify-between bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 relative">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Terminal className="w-6 h-6" />
            <span className="font-mono font-black text-lg tracking-wider">ROOT@MAINFRAME</span>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full">
            MULTI: x{prestigeBonus}
          </span>
        </div>

        {/* Crypto Balance Display */}
        <div className="text-center my-6">
          <span className="text-xs font-mono text-slate-400 block tracking-widest mb-1">TOTAL CRYPTO ASSETS</span>
          <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            ₿ {Math.floor(crypto).toLocaleString()}
          </div>
          <div className="text-sm font-mono text-emerald-300/80 mt-1">
            + {totalCps.toFixed(1)} ₿ / sec
          </div>
        </div>

        {/* Big Hack Mainframe Button */}
        <button
          onClick={handleManualHack}
          className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-1 shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer group flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-4 border-2 border-emerald-400/50 group-hover:border-emerald-300">
            <Cpu className="w-14 h-14 text-emerald-400 mb-2 animate-pulse" />
            <span className="font-mono font-black text-emerald-300 text-sm tracking-widest">INJECT HACK</span>
            <span className="font-mono text-xs text-slate-400 mt-1">+{clickPower * prestigeBonus} ₿/click</span>
          </div>
        </button>

        {/* Terminal Log Console */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400/80 mt-6 h-24 overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className="truncate">{`> ${log}`}</div>
          ))}
        </div>
      </div>

      {/* Right Column: Upgrades & Hardware Farm */}
      <div className="w-full md:w-96 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <span className="font-bold text-white text-base">HARDWARE UPGRADES</span>
          {totalMined >= 100000 && (
            <button
              onClick={prestigeReset}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-lg transition-all"
              title="Reset for permanent Multiplier Boost"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Quantum Prestige
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-3 overflow-y-auto pr-1">
          {upgrades.map(u => {
            const canAfford = crypto >= u.cost;
            return (
              <button
                key={u.id}
                onClick={() => buyUpgrade(u.id)}
                disabled={!canAfford}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  canAfford
                    ? 'bg-slate-950/80 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-900 cursor-pointer'
                    : 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{u.icon}</div>
                  <div>
                    <div className="font-bold text-sm text-white">{u.name}</div>
                    <div className="text-xs text-slate-400">+{u.cps * prestigeBonus} ₿/s</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-emerald-400">₿ {u.cost.toLocaleString()}</div>
                  <div className="text-[11px] font-mono text-slate-400">Owned: {u.count}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
