/**
 * 2048 Game Theme Definitions
 * Each theme defines colors for all tile values
 */

export interface TileColor {
  bg: string;
  text: string;
}

export interface GameTheme {
  id: string;
  name: string;
  cost: number; // Stars required to unlock (0 = free)
  boardBg: string;
  emptyTileBg: string;
  tiles: Record<number, TileColor>;
}

// Classic theme (always unlocked)
const classicTheme: GameTheme = {
  id: 'classic',
  name: 'Classic',
  cost: 0,
  boardBg: '#bbada0',
  emptyTileBg: 'rgba(238, 228, 218, 0.35)',
  tiles: {
    0: { bg: 'rgba(238, 228, 218, 0.35)', text: '#776e65' },
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
  },
};

// Ocean theme
const oceanTheme: GameTheme = {
  id: 'ocean',
  name: 'Ocean',
  cost: 500,
  boardBg: '#1a5276',
  emptyTileBg: 'rgba(174, 214, 241, 0.3)',
  tiles: {
    0: { bg: 'rgba(174, 214, 241, 0.3)', text: '#1a5276' },
    2: { bg: '#e0f7fa', text: '#006064' },
    4: { bg: '#b2ebf2', text: '#006064' },
    8: { bg: '#80deea', text: '#004d40' },
    16: { bg: '#4dd0e1', text: '#ffffff' },
    32: { bg: '#26c6da', text: '#ffffff' },
    64: { bg: '#00bcd4', text: '#ffffff' },
    128: { bg: '#00acc1', text: '#ffffff' },
    256: { bg: '#0097a7', text: '#ffffff' },
    512: { bg: '#00838f', text: '#ffffff' },
    1024: { bg: '#006064', text: '#ffffff' },
    2048: { bg: '#004d40', text: '#ffffff' },
  },
};

// Forest theme
const forestTheme: GameTheme = {
  id: 'forest',
  name: 'Forest',
  cost: 500,
  boardBg: '#2e7d32',
  emptyTileBg: 'rgba(200, 230, 201, 0.3)',
  tiles: {
    0: { bg: 'rgba(200, 230, 201, 0.3)', text: '#1b5e20' },
    2: { bg: '#e8f5e9', text: '#1b5e20' },
    4: { bg: '#c8e6c9', text: '#1b5e20' },
    8: { bg: '#a5d6a7', text: '#1b5e20' },
    16: { bg: '#81c784', text: '#ffffff' },
    32: { bg: '#66bb6a', text: '#ffffff' },
    64: { bg: '#4caf50', text: '#ffffff' },
    128: { bg: '#43a047', text: '#ffffff' },
    256: { bg: '#388e3c', text: '#ffffff' },
    512: { bg: '#2e7d32', text: '#ffffff' },
    1024: { bg: '#1b5e20', text: '#ffffff' },
    2048: { bg: '#004d40', text: '#ffffff' },
  },
};

// Sunset theme
const sunsetTheme: GameTheme = {
  id: 'sunset',
  name: 'Sunset',
  cost: 750,
  boardBg: '#e65100',
  emptyTileBg: 'rgba(255, 224, 178, 0.3)',
  tiles: {
    0: { bg: 'rgba(255, 224, 178, 0.3)', text: '#e65100' },
    2: { bg: '#fff3e0', text: '#e65100' },
    4: { bg: '#ffe0b2', text: '#e65100' },
    8: { bg: '#ffcc80', text: '#bf360c' },
    16: { bg: '#ffb74d', text: '#ffffff' },
    32: { bg: '#ffa726', text: '#ffffff' },
    64: { bg: '#ff9800', text: '#ffffff' },
    128: { bg: '#fb8c00', text: '#ffffff' },
    256: { bg: '#f57c00', text: '#ffffff' },
    512: { bg: '#ef6c00', text: '#ffffff' },
    1024: { bg: '#e65100', text: '#ffffff' },
    2048: { bg: '#bf360c', text: '#ffffff' },
  },
};

// Night theme
const nightTheme: GameTheme = {
  id: 'night',
  name: 'Night',
  cost: 750,
  boardBg: '#1a1a2e',
  emptyTileBg: 'rgba(100, 100, 130, 0.3)',
  tiles: {
    0: { bg: 'rgba(100, 100, 130, 0.3)', text: '#e0e0e0' },
    2: { bg: '#2d2d44', text: '#e0e0e0' },
    4: { bg: '#3d3d5c', text: '#e0e0e0' },
    8: { bg: '#4a4a6a', text: '#ffffff' },
    16: { bg: '#5c5c7a', text: '#ffffff' },
    32: { bg: '#6b6b8a', text: '#ffffff' },
    64: { bg: '#7a7a9a', text: '#ffffff' },
    128: { bg: '#8888aa', text: '#ffffff' },
    256: { bg: '#9999bb', text: '#1a1a2e' },
    512: { bg: '#aaaacc', text: '#1a1a2e' },
    1024: { bg: '#bbbbdd', text: '#1a1a2e' },
    2048: { bg: '#ccccee', text: '#1a1a2e' },
  },
};

// Cherry Blossom theme
const cherryTheme: GameTheme = {
  id: 'cherry',
  name: 'Cherry',
  cost: 1000,
  boardBg: '#ad1457',
  emptyTileBg: 'rgba(248, 187, 208, 0.3)',
  tiles: {
    0: { bg: 'rgba(248, 187, 208, 0.3)', text: '#880e4f' },
    2: { bg: '#fce4ec', text: '#880e4f' },
    4: { bg: '#f8bbd0', text: '#880e4f' },
    8: { bg: '#f48fb1', text: '#ffffff' },
    16: { bg: '#f06292', text: '#ffffff' },
    32: { bg: '#ec407a', text: '#ffffff' },
    64: { bg: '#e91e63', text: '#ffffff' },
    128: { bg: '#d81b60', text: '#ffffff' },
    256: { bg: '#c2185b', text: '#ffffff' },
    512: { bg: '#ad1457', text: '#ffffff' },
    1024: { bg: '#880e4f', text: '#ffffff' },
    2048: { bg: '#4a0025', text: '#ffffff' },
  },
};

// Export all themes
export const GAME_THEMES: Record<string, GameTheme> = {
  classic: classicTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  night: nightTheme,
  cherry: cherryTheme,
};

// Get theme list sorted by cost
export const getThemeList = (): GameTheme[] => {
  return Object.values(GAME_THEMES).sort((a, b) => a.cost - b.cost);
};

// Get tile color for a specific theme and value
export const getTileColor = (themeId: string, value: number): TileColor => {
  const theme = GAME_THEMES[themeId] || GAME_THEMES.classic;
  return theme.tiles[value] || theme.tiles[2048];
};
