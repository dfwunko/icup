import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameMetadata, CustomGame, GameScoreRecord, Achievement, CloakProfile } from '../types';
import { GAMES_LIST, CLOAK_PROFILES } from '../data/gamesList';
import { SAMPLE_CUSTOM_GAMES } from '../data/sampleCustomGames';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';

interface GameContextType {
  games: GameMetadata[];
  activeGame: GameMetadata | null;
  activeCustomGame: CustomGame | null;
  openGame: (gameId: string) => void;
  openCustomGame: (customGame: CustomGame) => void;
  closeGame: () => void;
  highScores: Record<string, number>;
  saveHighScore: (gameId: string, score: number) => boolean;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  recentGames: string[];
  customGames: CustomGame[];
  saveCustomGame: (game: Omit<CustomGame, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => CustomGame;
  deleteCustomGame: (id: string) => void;
  isPanicActive: boolean;
  triggerPanic: (active?: boolean) => void;
  panicDisguise: 'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia';
  setPanicDisguise: (type: 'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia') => void;
  currentCloak: CloakProfile | null;
  setCloakProfile: (profileId: string | null) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  gameStats: { totalPlays: number; gamesPlayed: Record<string, number> };
  gameModSpeed: number; // 0.75, 1.0, 1.25, 1.5
  setGameModSpeed: (speed: number) => void;
  isPracticeMode: boolean;
  setIsPracticeMode: (practice: boolean) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_play', title: 'First Drop', description: 'Launch any game in NovaVault', icon: '🎮' },
  { id: 'high_scorer', title: 'Arcade Legend', description: 'Score over 100 points in any game', icon: '🏆' },
  { id: 'stealth_ninja', title: 'Stealth Ninja', description: 'Trigger the Panic Button (Press P)', icon: '🥷' },
  { id: 'custom_coder', title: 'Game Architect', description: 'Create or launch a custom HTML5 game', icon: '💻' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Survive at high velocity in Slope 3D or Dino', icon: '⚡' },
  { id: 'favorite_collector', title: 'Vault Curator', description: 'Favorite 3 or more games', icon: '⭐' },
  { id: 'master_hacker', title: 'Digital Sovereign', description: 'Reach Level 5 Upgrades in Cyber Hacker', icon: '🤖' }
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [activeCustomGame, setActiveCustomGame] = useState<CustomGame | null>(null);
  const [isPanicActive, setIsPanicActive] = useState<boolean>(false);
  const [panicDisguise, setPanicDisguise] = useState<'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia'>('classroom');
  const [currentCloak, setCurrentCloak] = useState<CloakProfile | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabledState] = useState<boolean>(false);
  const [gameModSpeed, setGameModSpeed] = useState<number>(1.0);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  // Persistence: High Scores
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('novavault_highscores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persistence: Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('novavault_favorites');
      return saved ? JSON.parse(saved) : ['slope-3d', 'tetra-drop', 'space-defender'];
    } catch {
      return ['slope-3d', 'tetra-drop', 'space-defender'];
    }
  });

  // Persistence: Recent Games
  const [recentGames, setRecentGames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('novavault_recents');
      return saved ? JSON.parse(saved) : ['slope-3d', 'snake-neon', 'tetra-drop'];
    } catch {
      return ['slope-3d', 'snake-neon', 'tetra-drop'];
    }
  });

  // Persistence: Custom Games
  const [customGames, setCustomGames] = useState<CustomGame[]>(() => {
    try {
      const saved = localStorage.getItem('novavault_custom_games');
      return saved ? JSON.parse(saved) : SAMPLE_CUSTOM_GAMES;
    } catch {
      return SAMPLE_CUSTOM_GAMES;
    }
  });

  // Persistence: Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('novavault_achievements');
      if (saved) {
        const parsed: Achievement[] = JSON.parse(saved);
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const match = parsed.find(p => p.id === initial.id);
          return match || initial;
        });
      }
      return INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  // Game Stats
  const [gameStats, setGameStats] = useState<{ totalPlays: number; gamesPlayed: Record<string, number> }>(() => {
    try {
      const saved = localStorage.getItem('novavault_stats');
      return saved ? JSON.parse(saved) : { totalPlays: 0, gamesPlayed: {} };
    } catch {
      return { totalPlays: 0, gamesPlayed: {} };
    }
  });

  // Sync highScores
  useEffect(() => {
    try {
      localStorage.setItem('novavault_highscores', JSON.stringify(highScores));
    } catch {}
  }, [highScores]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('novavault_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Sync recents
  useEffect(() => {
    try {
      localStorage.setItem('novavault_recents', JSON.stringify(recentGames));
    } catch {}
  }, [recentGames]);

  // Sync custom games
  useEffect(() => {
    try {
      localStorage.setItem('novavault_custom_games', JSON.stringify(customGames));
    } catch {}
  }, [customGames]);

  // Sync achievements
  useEffect(() => {
    try {
      localStorage.setItem('novavault_achievements', JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  // Sync stats
  useEffect(() => {
    try {
      localStorage.setItem('novavault_stats', JSON.stringify(gameStats));
    } catch {}
  }, [gameStats]);

  // Sound Engine sync
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEngine.soundEnabled = enabled;
  };

  const setMusicEnabled = (enabled: boolean) => {
    setMusicEnabledState(enabled);
    soundEngine.toggleMusic(enabled);
  };

  // Keyboard shortcut listener for PANIC BUTTON ('P' key or 'Escape')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea/editable code area
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === '`') {
        setIsPanicActive(prev => {
          const next = !prev;
          if (next) unlockAchievement('stealth_ninja');
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerPanic = (active?: boolean) => {
    setIsPanicActive(prev => (active !== undefined ? active : !prev));
    unlockAchievement('stealth_ninja');
  };

  const setCloakProfile = (profileId: string | null) => {
    if (!profileId) {
      setCurrentCloak(null);
      document.title = 'NovaVault | Unblocked Games Hub';
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = '/favicon.ico';
      return;
    }

    const profile = CLOAK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      setCurrentCloak(profile);
      document.title = profile.tabTitle;
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = profile.favicon;
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev =>
      prev.map(ach => {
        if (ach.id === id && !ach.unlockedAt) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.85 }
            });
            soundEngine.playPowerup();
          } catch {}
          return { ...ach, unlockedAt: Date.now() };
        }
        return ach;
      })
    );
  };

  const saveHighScore = (gameId: string, score: number): boolean => {
    const currentHigh = highScores[gameId] || 0;
    if (score > currentHigh) {
      setHighScores(prev => ({ ...prev, [gameId]: score }));
      if (score >= 100) {
        unlockAchievement('high_scorer');
      }
      return true;
    }
    return false;
  };

  const toggleFavorite = (gameId: string) => {
    soundEngine.playClick();
    setFavorites(prev => {
      const next = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      if (next.length >= 3) {
        unlockAchievement('favorite_collector');
      }
      return next;
    });
  };

  const isFavorite = (gameId: string) => favorites.includes(gameId);

  const openGame = (gameId: string) => {
    const found = GAMES_LIST.find(g => g.id === gameId);
    if (found) {
      soundEngine.playClick();
      setActiveGame(found);
      setActiveCustomGame(null);

      // Track recents
      setRecentGames(prev => [gameId, ...prev.filter(id => id !== gameId)].slice(0, 10));

      // Track stats
      setGameStats(prev => ({
        totalPlays: prev.totalPlays + 1,
        gamesPlayed: {
          ...prev.gamesPlayed,
          [gameId]: (prev.gamesPlayed[gameId] || 0) + 1,
        }
      }));

      unlockAchievement('first_play');
    }
  };

  const openCustomGame = (game: CustomGame) => {
    soundEngine.playClick();
    setActiveCustomGame(game);
    setActiveGame(null);
    unlockAchievement('custom_coder');
  };

  const closeGame = () => {
    soundEngine.playClick();
    setActiveGame(null);
    setActiveCustomGame(null);
  };

  const saveCustomGame = (gameData: Omit<CustomGame, 'id' | 'createdAt' | 'updatedAt'>, id?: string): CustomGame => {
    const now = Date.now();
    let updatedGame: CustomGame;

    if (id) {
      updatedGame = {
        id,
        ...gameData,
        createdAt: customGames.find(g => g.id === id)?.createdAt || now,
        updatedAt: now,
      };
      setCustomGames(prev => prev.map(g => (g.id === id ? updatedGame : g)));
    } else {
      updatedGame = {
        id: 'custom-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        ...gameData,
        createdAt: now,
        updatedAt: now,
      };
      setCustomGames(prev => [updatedGame, ...prev]);
    }

    unlockAchievement('custom_coder');
    return updatedGame;
  };

  const deleteCustomGame = (id: string) => {
    setCustomGames(prev => prev.filter(g => g.id !== id));
  };

  return (
    <GameContext.Provider
      value={{
        games: GAMES_LIST,
        activeGame,
        activeCustomGame,
        openGame,
        openCustomGame,
        closeGame,
        highScores,
        saveHighScore,
        favorites,
        toggleFavorite,
        isFavorite,
        recentGames,
        customGames,
        saveCustomGame,
        deleteCustomGame,
        isPanicActive,
        triggerPanic,
        panicDisguise,
        setPanicDisguise,
        currentCloak,
        setCloakProfile,
        soundEnabled,
        setSoundEnabled,
        musicEnabled,
        setMusicEnabled,
        achievements,
        unlockAchievement,
        gameStats,
        gameModSpeed,
        setGameModSpeed,
        isPracticeMode,
        setIsPracticeMode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
