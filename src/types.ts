export type GameCategory = 'all' | 'action' | 'arcade' | 'retro' | 'puzzle' | 'runner' | 'idle' | 'sandbox';

export interface GameMetadata {
  id: string;
  title: string;
  category: 'action' | 'arcade' | 'retro' | 'puzzle' | 'runner' | 'idle' | 'sandbox';
  description: string;
  tags: string[];
  controls: { key: string; action: string }[];
  accentColor: string;
  badge?: string;
  popular?: boolean;
  featured?: boolean;
}

export interface CustomGame {
  id: string;
  title: string;
  author: string;
  description: string;
  htmlCode: string;
  createdAt: number;
  updatedAt: number;
}

export interface GameScoreRecord {
  gameId: string;
  score: number;
  date: number;
  rank?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface CloakProfile {
  id: string;
  name: string;
  tabTitle: string;
  favicon: string;
  previewUrl: string;
  disguiseType: 'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia';
}
