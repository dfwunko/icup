import React from 'react';
import { GameMetadata } from '../types';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { Play, Star, Trophy, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
  onOpen: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onOpen }) => {
  const { isFavorite, toggleFavorite, highScores } = useGame();
  const high = highScores[game.id] || 0;
  const fav = isFavorite(game.id);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'action': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'arcade': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'puzzle': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'retro': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'runner': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'idle': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'sandbox': return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getIconForGame = (id: string) => {
    switch (id) {
      case 'slope-3d': return '⚡';
      case 'snake-neon': return '🐍';
      case 'tetra-drop': return '🧱';
      case 'space-defender': return '🚀';
      case 'brick-smasher': return '🏓';
      case 'flappy-cyber': return '🕊️';
      case 'game-2048': return '🔢';
      case 'dino-cyber': return '🦖';
      case 'tower-stacker': return '🏢';
      case 'idle-hacker': return '💻';
      case 'crossy-cyber': return '🐸';
      case 'typing-speed': return '⌨️';
      case 'custom-studio': return '🛠️';
      default: return '🎮';
    }
  };

  return (
    <div
      onClick={onOpen}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Banner & Badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-800"
            style={{ backgroundColor: `${game.accentColor}18` }}
          >
            {getIconForGame(game.id)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(game.category)}`}>
                {game.category}
              </span>
              {game.badge && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  {game.badge}
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white font-['Outfit'] mt-1 group-hover:text-cyan-300 transition-colors line-clamp-1">
              {game.title}
            </h3>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleFavorite(game.id);
          }}
          className={`p-2 rounded-xl transition-all ${
            fav ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={fav ? 'Favorited' : 'Add to Favorites'}
        >
          <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
        {game.description}
      </p>

      {/* Tags and High Score Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-auto">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{high > 0 ? `${high.toLocaleString()} pts` : 'No score'}</span>
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            onOpen();
          }}
          className="flex items-center gap-1 text-xs font-bold font-mono px-3 py-1.5 bg-cyan-500/15 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 border border-cyan-500/30 rounded-xl transition-all"
        >
          <Play className="w-3 h-3 fill-current" /> PLAY
        </button>
      </div>
    </div>
  );
};
