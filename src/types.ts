export interface HtmlJsGame {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  htmlCode?: string;
  entryUrl?: string;
  type?: 'inline' | 'entrypoint' | 'file';
  source?: 'scanned' | 'custom' | 'imported';
  icon?: string;
  detectedFiles?: string[];
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ScannedGameReport {
  id: string;
  title: string;
  path: string;
  description: string;
  author: string;
  tags: string[];
  icon: string;
  detectedFiles: string[];
  engine?: string;
  sizeEstimate?: string;
  isRegistered: boolean;
}

export interface CloakProfile {
  id: string;
  name: string;
  tabTitle: string;
  favicon: string;
  previewDomain: string;
  disguiseType: 'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia';
}
