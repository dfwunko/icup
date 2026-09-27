import { HtmlJsGame, ScannedGameReport } from '../types';

// Predefined known candidate directories/entrypoints to probe
const CANDIDATE_GAME_PATHS = [
  {
    id: 'sacrewit',
    path: '/sacrewit/index.html',
    defaultTitle: 'Scarwrit',
    defaultDesc: 'A deckbuilder roguelite where your cards keep the record: 108 cards, 28 Seals, 15 floors, and permanent Codex tempers/scars.',
    defaultAuthor: 'Weekly Arcade',
    defaultTags: ['Roguelite', 'Deckbuilder', 'Turn-Based', 'HTML5/JS'],
    defaultIcon: '🕯️',
    files: [
      'index.html',
      'game.js',
      'aid.js',
      'styles.css',
      'scene.css',
      'art/atlas.json',
      'art/core.webp',
      'art/region-margins.webp',
      'art/faction-quill.webp',
      'art/faction-cinder.webp',
      'art/faction-thorn.webp',
      'art/faction-blot.webp'
    ]
  },
  {
    id: 'scarwrit-alias',
    path: '/games/scarwrit/index.html',
    defaultTitle: 'Scarwrit (Alias Entry)',
    defaultDesc: 'Direct aliased entry point to Scarwrit roguelite deckbuilder.',
    defaultAuthor: 'Weekly Arcade',
    defaultTags: ['Roguelite', 'Deckbuilder', 'Direct Path'],
    defaultIcon: '📜',
    files: ['index.html', 'game.js', 'styles.css', 'scene.css']
  }
];

export async function scanForGames(): Promise<ScannedGameReport[]> {
  const reports: ScannedGameReport[] = [];

  for (const candidate of CANDIDATE_GAME_PATHS) {
    try {
      const response = await fetch(candidate.path, { method: 'GET', cache: 'no-cache' });
      if (response.ok) {
        const html = await response.text();
        
        // Parse metadata from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const pageTitle = doc.querySelector('title')?.textContent?.trim() || candidate.defaultTitle;
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || candidate.defaultDesc;
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        
        // Clean title if it contains boilerplate like "Play X Online Free"
        let cleanTitle = ogTitle || pageTitle;
        if (cleanTitle.includes(' - ')) {
          cleanTitle = cleanTitle.split(' - ')[0].replace(/^Play\s+/i, '').trim();
        } else if (cleanTitle.includes('|')) {
          cleanTitle = cleanTitle.split('|')[0].trim();
        }

        reports.push({
          id: candidate.id,
          title: cleanTitle || candidate.defaultTitle,
          path: candidate.path,
          description: metaDesc,
          author: candidate.defaultAuthor,
          tags: candidate.defaultTags,
          icon: candidate.defaultIcon,
          detectedFiles: candidate.files,
          engine: 'Vanilla JS / Canvas 2D',
          sizeEstimate: 'Asset bundle verified',
          isRegistered: true
        });
      }
    } catch {
      // Endpoint unreachable or network issue
    }
  }

  return reports;
}

export async function probeCustomPath(customPath: string): Promise<ScannedGameReport | null> {
  const normalizedPath = customPath.startsWith('/') ? customPath : `/${customPath}`;
  try {
    const response = await fetch(normalizedPath, { method: 'GET', cache: 'no-cache' });
    if (!response.ok) return null;

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title')?.textContent?.trim() || 'Custom HTML Game';
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'Scanned custom web application entry point.';
    
    // Check for scripts and links
    const scripts = Array.from(doc.querySelectorAll('script[src]')).map(s => s.getAttribute('src') || '');
    const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href') || '');

    const detectedFiles = ['index.html', ...scripts.slice(0, 5), ...styles.slice(0, 5)];

    const id = 'custom-' + normalizedPath.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');

    return {
      id,
      title,
      path: normalizedPath,
      description: desc,
      author: 'Scanned Local Entry',
      tags: ['Scanned', 'HTML/JS', 'Local Entry'],
      icon: '🎮',
      detectedFiles,
      engine: 'Web Engine',
      sizeEstimate: `${Math.round(html.length / 1024)} KB HTML`,
      isRegistered: false
    };
  } catch {
    return null;
  }
}

export function convertReportToGame(report: ScannedGameReport): HtmlJsGame {
  const now = Date.now();
  return {
    id: 'scanned-' + report.id,
    title: report.title,
    description: report.description,
    author: report.author,
    tags: report.tags,
    entryUrl: report.path,
    type: 'entrypoint',
    source: 'scanned',
    icon: report.icon,
    detectedFiles: report.detectedFiles,
    createdAt: now,
    updatedAt: now,
  };
}
