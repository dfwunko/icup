import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HtmlJsGame, CloakProfile } from '../types';
import { INITIAL_HTML_GAMES, CLOAK_PROFILES } from '../data/initialGames';

interface GameContextType {
  games: HtmlJsGame[];
  activeGame: HtmlJsGame | null;
  activeTab: 'library' | 'runner' | 'editor' | 'embed';
  setActiveTab: (tab: 'library' | 'runner' | 'editor' | 'embed') => void;
  playGame: (game: HtmlJsGame) => void;
  closeGame: () => void;
  addGame: (game: Omit<HtmlJsGame, 'id' | 'createdAt' | 'updatedAt'>) => HtmlJsGame;
  updateGame: (id: string, game: Partial<HtmlJsGame>) => void;
  deleteGame: (id: string) => void;
  toggleFavorite: (id: string) => void;
  resetToDefaults: () => void;
  isPanicActive: boolean;
  triggerPanic: (active?: boolean) => void;
  panicDisguise: 'classroom' | 'docs' | 'calculator' | 'wikipedia';
  setPanicDisguise: (type: 'classroom' | 'docs' | 'calculator' | 'wikipedia') => void;
  currentCloak: CloakProfile | null;
  setCloakProfile: (profileId: string | null) => void;
  directEmbedCode: string;
  setDirectEmbedCode: (code: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<HtmlJsGame[]>(() => {
    try {
      const saved = localStorage.getItem('novavault_clean_games');
      return saved ? JSON.parse(saved) : INITIAL_HTML_GAMES;
    } catch {
      return INITIAL_HTML_GAMES;
    }
  });

  const [activeGame, setActiveGame] = useState<HtmlJsGame | null>(() => {
    return null;
  });

  const [activeTab, setActiveTab] = useState<'library' | 'runner' | 'editor' | 'embed'>('library');
  const [isPanicActive, setIsPanicActive] = useState<boolean>(false);
  const [panicDisguise, setPanicDisguise] = useState<'classroom' | 'docs' | 'calculator' | 'wikipedia'>('classroom');
  const [currentCloak, setCurrentCloak] = useState<CloakProfile | null>(null);
  const [directEmbedCode, setDirectEmbedCode] = useState<string>('');

  // Persist games to local storage
  useEffect(() => {
    try {
      localStorage.setItem('novavault_clean_games', JSON.stringify(games));
    } catch {}
  }, [games]);

  // Stealth hotkey listener (P or Esc or ~)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if (e.key === 'Escape') {
          setIsPanicActive(prev => !prev);
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === '`' || e.key === 'Escape') {
        setIsPanicActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerPanic = (active?: boolean) => {
    setIsPanicActive(prev => (active !== undefined ? active : !prev));
  };

  const setCloakProfile = (profileId: string | null) => {
    if (!profileId) {
      setCurrentCloak(null);
      document.title = 'NovaVault — Minimal Unblocked HTML & JS Games';
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

  const playGame = (game: HtmlJsGame) => {
    setActiveGame(game);
    setActiveTab('runner');
  };

  const closeGame = () => {
    setActiveTab('library');
  };

  const addGame = (gameData: Omit<HtmlJsGame, 'id' | 'createdAt' | 'updatedAt'>): HtmlJsGame => {
    const now = Date.now();
    const newGame: HtmlJsGame = {
      id: 'game-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      ...gameData,
      createdAt: now,
      updatedAt: now,
    };
    setGames(prev => [newGame, ...prev]);
    setActiveGame(newGame);
    return newGame;
  };

  const updateGame = (id: string, updates: Partial<HtmlJsGame>) => {
    setGames(prev =>
      prev.map(g => {
        if (g.id === id) {
          const updated = { ...g, ...updates, updatedAt: Date.now() };
          if (activeGame?.id === id) {
            setActiveGame(updated);
          }
          return updated;
        }
        return g;
      })
    );
  };

  const deleteGame = (id: string) => {
    setGames(prev => {
      const filtered = prev.filter(g => g.id !== id);
      if (activeGame?.id === id) {
        setActiveGame(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const toggleFavorite = (id: string) => {
    setGames(prev =>
      prev.map(g => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g))
    );
  };

  const resetToDefaults = () => {
    setGames(INITIAL_HTML_GAMES);
    setActiveGame(INITIAL_HTML_GAMES[0]);
  };

  return (
    <GameContext.Provider
      value={{
        games,
        activeGame,
        activeTab,
        setActiveTab,
        playGame,
        closeGame,
        addGame,
        updateGame,
        deleteGame,
        toggleFavorite,
        resetToDefaults,
        isPanicActive,
        triggerPanic,
        panicDisguise,
        setPanicDisguise,
        currentCloak,
        setCloakProfile,
        directEmbedCode,
        setDirectEmbedCode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
