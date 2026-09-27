import { GameMetadata } from '../types';

export const GAMES_LIST: GameMetadata[] = [
  {
    id: 'slope-3d',
    title: 'Slope 3D Cyber Run',
    category: 'runner',
    description: 'High-speed pseudo-3D neon ball runner! Steer across twisting floating ramps, dodge red obstacles, and beat max distance.',
    tags: ['3D', 'Fast-Paced', 'Reflex', 'Endless'],
    controls: [
      { key: 'A / D or Left/Right', action: 'Steer Ball' },
      { key: 'Space', action: 'Jump / Boost' }
    ],
    accentColor: '#06b6d4',
    badge: 'HOT',
    popular: true,
    featured: true,
  },
  {
    id: 'snake-neon',
    title: 'Neon Snake Evolution',
    category: 'retro',
    description: 'The arcade classic reimagined with neon glow, speed boost trails, ghost mode, freeze orbs, and multiplier gems.',
    tags: ['Classic', 'Arcade', 'Powerups', 'Casual'],
    controls: [
      { key: 'Arrow Keys / WASD', action: 'Turn Snake' },
      { key: 'Space / Shift', action: 'Turbo Sprint' }
    ],
    accentColor: '#10b981',
    badge: 'CLASSIC',
    popular: true,
    featured: false,
  },
  {
    id: 'tetra-drop',
    title: 'Tetra Master 99',
    category: 'puzzle',
    description: 'Modern block falling puzzle with ghost pieces, hard drop instant slam, hold box, line clears, and retro sound FX.',
    tags: ['Puzzle', 'Retro', 'Strategy', 'Addictive'],
    controls: [
      { key: 'Left / Right', action: 'Move Block' },
      { key: 'Up / X', action: 'Rotate' },
      { key: 'Down', action: 'Soft Drop' },
      { key: 'Space', action: 'Hard Drop' },
      { key: 'C', action: 'Hold Piece' }
    ],
    accentColor: '#8b5cf6',
    badge: 'POPULAR',
    popular: true,
    featured: true,
  },
  {
    id: 'space-defender',
    title: 'Vortex Space Invaders',
    category: 'action',
    description: 'Galaga-inspired starfield shooter with multi-lasers, orbital shield drones, homing missiles, and massive mothership boss fights.',
    tags: ['Shooter', 'Action', 'Boss Fight', 'Upgrades'],
    controls: [
      { key: 'A / D or Left/Right', action: 'Move Starship' },
      { key: 'Space / Auto', action: 'Fire Lasers' },
      { key: 'B', action: 'Drop Super Bomb' }
    ],
    accentColor: '#f43f5e',
    badge: 'ACTION',
    popular: true,
    featured: true,
  },
  {
    id: 'brick-smasher',
    title: 'Hyper Breakout DX',
    category: 'arcade',
    description: 'Smash through unbreakable matrices of glowing bricks with multi-ball splitters, laser blasters, sticky pads, and fireball power.',
    tags: ['Arcade', 'Physics', 'Powerups', 'Levels'],
    controls: [
      { key: 'Mouse / Left-Right', action: 'Move Paddle' },
      { key: 'Space / Click', action: 'Launch / Shoot Lasers' }
    ],
    accentColor: '#f59e0b',
    popular: true,
  },
  {
    id: 'flappy-cyber',
    title: 'Cyber Wing Flap',
    category: 'arcade',
    description: 'One-tap flight navigation through futuristic neon cyber towers. Collect energy shields, coins, and reach supersonic speed.',
    tags: ['Arcade', 'One Button', 'Highscore'],
    controls: [
      { key: 'Space / Click / Tap', action: 'Flap Thrusters' }
    ],
    accentColor: '#ec4899',
    popular: true,
  },
  {
    id: 'game-2048',
    title: '2048 Neon Fusion',
    category: 'puzzle',
    description: 'Combine numbers smoothly to reach the 2048 and 4096 tiles! Features step undo, dynamic board themes, and auto-save.',
    tags: ['Puzzle', 'Math', 'Brain', 'Chill'],
    controls: [
      { key: 'Arrow Keys / WASD', action: 'Slide Grid' },
      { key: 'U', action: 'Undo Move' }
    ],
    accentColor: '#eab308',
    popular: false,
  },
  {
    id: 'dino-cyber',
    title: 'Chrome Dino 2099',
    category: 'runner',
    description: 'The offline dinosaur runner upgraded with double jumps, cyber cacti, laser turrets, pterodactyl swarms, and day-to-night transitions.',
    tags: ['Runner', 'Double Jump', 'Endless'],
    controls: [
      { key: 'Space / Up', action: 'Jump (Tap 2x for Double Jump)' },
      { key: 'Down', action: 'Dodge / Duck' }
    ],
    accentColor: '#14b8a6',
    popular: true,
  },
  {
    id: 'tower-stacker',
    title: 'Tower Stacker Deluxe',
    category: 'arcade',
    description: 'Precision timing stacker! Slice moving 3D-styled colored blocks to construct the tallest skyscraper possible without tipping over.',
    tags: ['Timing', 'Zen', '3D Style', 'Combo'],
    controls: [
      { key: 'Space / Click / Tap', action: 'Place Block' }
    ],
    accentColor: '#3b82f6',
    popular: false,
  },
  {
    id: 'idle-hacker',
    title: 'Cyber Hacker 3000',
    category: 'idle',
    description: 'Unblocked idle incremental game! Hack server nodes, buy quantum processors, hire botnets, launch cyber heists, and prestige.',
    tags: ['Idle', 'Clicker', 'Upgrades', 'Strategy'],
    controls: [
      { key: 'Click / Space', action: 'Hack Mainframe' }
    ],
    accentColor: '#22c55e',
    badge: 'IDLE',
    popular: true,
  },
  {
    id: 'crossy-cyber',
    title: 'Crossy Cyber Road',
    category: 'arcade',
    description: 'Hop across busy high-speed cyber highways, magnetic bullet trains, and floating energy logs over toxic digital rivers.',
    tags: ['Arcade', 'Timing', 'Obstacles'],
    controls: [
      { key: 'WASD / Arrow Keys', action: 'Hop in 4 Directions' }
    ],
    accentColor: '#6366f1',
    popular: true,
  },
  {
    id: 'typing-speed',
    title: 'Typing Speed Blast',
    category: 'action',
    description: 'Defend your cyber base by typing incoming falling vocabulary code words before they breach your shield perimeter! Tests WPM.',
    tags: ['Educational', 'Typing', 'Speed', 'Keyboard'],
    controls: [
      { key: 'Keyboard Keys', action: 'Type Matching Words' },
      { key: 'Enter', action: 'Submit Word' }
    ],
    accentColor: '#d946ef',
    popular: false,
  },
  {
    id: 'custom-studio',
    title: 'Custom HTML5 Game Maker',
    category: 'sandbox',
    description: 'Build, edit, paste, or test any HTML/JS/CSS game directly in a secure, sandboxed emulator. Save multiple custom games to your vault!',
    tags: ['Code', 'Sandbox', 'Creator', 'JavaScript'],
    controls: [
      { key: 'Editor', action: 'Write or paste HTML/JS' }
    ],
    accentColor: '#a855f7',
    badge: 'STUDIO',
    popular: true,
    featured: true,
  }
];

export const CLOAK_PROFILES = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    tabTitle: 'Classes - Google Classroom',
    favicon: 'https://ssl.gstatic.com/classroom/favicon.png',
    previewUrl: 'classroom.google.com',
    disguiseType: 'classroom' as const,
  },
  {
    id: 'docs',
    name: 'Google Docs',
    tabTitle: 'Untitled document - Google Docs',
    favicon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    previewUrl: 'docs.google.com',
    disguiseType: 'docs' as const,
  },
  {
    id: 'calculator',
    name: 'Desmos Scientific Calculator',
    tabTitle: 'Desmos | Scientific Calculator',
    favicon: 'https://www.desmos.com/favicon.ico',
    previewUrl: 'desmos.com/scientific',
    disguiseType: 'calculator' as const,
  },
  {
    id: 'canvas',
    name: 'Canvas LMS Dashboard',
    tabTitle: 'Dashboard - Canvas LMS',
    favicon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico',
    previewUrl: 'canvas.instructure.com',
    disguiseType: 'canvas' as const,
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Article',
    tabTitle: 'Quantum mechanics - Wikipedia',
    favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    previewUrl: 'en.wikipedia.org',
    disguiseType: 'wikipedia' as const,
  },
];
