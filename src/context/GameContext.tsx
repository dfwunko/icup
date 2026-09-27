import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HtmlJsGame, CloakProfile, ScannedGameReport } from '../types';
import { INITIAL_HTML_GAMES, CLOAK_PROFILES } from '../data/initialGames';
import { scanForGames, convertReportToGame, probeCustomPath } from '../utils/gameScanner';

interface GameContextType {
  games: HtmlJsGame[];
  activeGame: HtmlJsGame | null;
  activeTab: 'library' | 'runner' | 'editor' | 'embed';
  setActiveTab: (tab: 'library' | 'runner' | 'editor' | 'embed') => void;
  playGame: (game: HtmlJsGame) => void;
  closeGame: () => void;
  addGame: (game: Omit<HtmlJsGame, 'id' | 'createdAt' | 'updatedAt'>) => HtmlJsGame;
  createEntryPoint: (data: { title: string; path: string; description?: string; author?: string; tags?: string[]; icon?: string }) => HtmlJsGame;
  updateGame: (id: string, game: Partial<HtmlJsGame>) => void;
  deleteGame: (id: string) => void;
  toggleFavorite: (id: string) => void;
  resetToDefaults: () => void;
  // Scanner
  isScanning: boolean;
  scanReports: ScannedGameReport[];
  runDirectoryScan: () => Promise<ScannedGameReport[]>;
  isScanModalOpen: boolean;
  setIsScanModalOpen: (open: boolean) => void;
  probePath: (path: string) => Promise<ScannedGameReport | null>;
  // Panic & Cloak
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

  const [activeGame, setActiveGame] = useState<HtmlJsGame | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'runner' | 'editor' | 'embed'>('library');
  const [isPanicActive, setIsPanicActive] = useState<boolean>(false);
  const [panicDisguise, setPanicDisguise] = useState<'classroom' | 'docs' | 'calculator' | 'wikipedia'>('classroom');
  const [currentCloak, setCurrentCloak] = useState<CloakProfile | null>(null);
  const [directEmbedCode, setDirectEmbedCode] = useState<string>('');

  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanReports, setScanReports] = useState<ScannedGameReport[]>([]);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);

  // Persist games to local storage
  useEffect(() => {
    try {
      localStorage.setItem('novavault_clean_games', JSON.stringify(games));
    } catch {}
  }, [games]);

  // Execute scan
  const runDirectoryScan = useCallback(async (): Promise<ScannedGameReport[]> => {
    setIsScanning(true);
    try {
      const reports = await scanForGames();
      setScanReports(reports);

      // Auto-register any scanned games that aren't already in library
      if (reports.length > 0) {
        setGames(prev => {
          const newGames = [...prev];
          let updated = false;

          for (const report of reports) {
            const exists = newGames.some(g => g.entryUrl === report.path || g.id === 'scanned-' + report.id);
            if (!exists) {
              const gameObj = convertReportToGame(report);
              newGames.unshift(gameObj);
              updated = true;
            }
          }

          return updated ? newGames : prev;
        });
      }

      return reports;
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Probe custom path
  const probePath = useCallback(async (path: string): Promise<ScannedGameReport | null> => {
    return await probeCustomPath(path);
  }, []);

  // Run initial scan on load to detect any files like /sacrewit/
  useEffect(() => {
    runDirectoryScan();
  }, [runDirectoryScan]);

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
      type: gameData.entryUrl ? 'entrypoint' : 'inline',
      source: 'custom',
      ...gameData,
      createdAt: now,
      updatedAt: now,
    };
    setGames(prev => [newGame, ...prev]);
    setActiveGame(newGame);
    return newGame;
  };

  const createEntryPoint = (data: { title: string; path: string; description?: string; author?: string; tags?: string[]; icon?: string }): HtmlJsGame => {
    const now = Date.now();
    const newGame: HtmlJsGame = {
      id: 'entry-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: data.title || 'Custom Entry Point',
      description: data.description || `Entry point located at ${data.path}`,
      author: data.author || 'Local Entry',
      tags: data.tags || ['Entry Point', 'HTML/JS'],
      entryUrl: data.path,
      icon: data.icon || '🚀',
      type: 'entrypoint',
      source: 'custom',
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
    setActiveGame(null);
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
        createEntryPoint,
        updateGame,
        deleteGame,
        toggleFavorite,
        resetToDefaults,
        isScanning,
        scanReports,
        runDirectoryScan,
        isScanModalOpen,
        setIsScanModalOpen,
        probePath,
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
