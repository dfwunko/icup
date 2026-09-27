export interface HtmlJsGame {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  htmlCode: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CloakProfile {
  id: string;
  name: string;
  tabTitle: string;
  favicon: string;
  previewDomain: string;
  disguiseType: 'classroom' | 'docs' | 'calculator' | 'canvas' | 'wikipedia';
}
