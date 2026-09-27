import { HtmlJsGame, CloakProfile } from '../types';

export const INITIAL_HTML_GAMES: HtmlJsGame[] = [];

export const CLOAK_PROFILES: CloakProfile[] = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    tabTitle: 'Classes - Google Classroom',
    favicon: 'https://ssl.gstatic.com/classroom/favicon.png',
    previewDomain: 'classroom.google.com',
    disguiseType: 'classroom',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    tabTitle: 'Untitled document - Google Docs',
    favicon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    previewDomain: 'docs.google.com',
    disguiseType: 'docs',
  },
  {
    id: 'calculator',
    name: 'Desmos Scientific Calculator',
    tabTitle: 'Desmos | Scientific Calculator',
    favicon: 'https://www.desmos.com/favicon.ico',
    previewDomain: 'desmos.com/scientific',
    disguiseType: 'calculator',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Article',
    tabTitle: 'Linear algebra - Wikipedia',
    favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    previewDomain: 'en.wikipedia.org',
    disguiseType: 'wikipedia',
  },
];
