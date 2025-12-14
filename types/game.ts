// 2048 게임 타입 정의

// 타일 타입
export interface Tile {
  id: string;
  value: number; // 2, 4, 8, 16, ... 2048
  row: number;
  col: number;
  isNew?: boolean; // 새로 생성된 타일 (애니메이션용)
  isMerged?: boolean; // 합쳐진 타일 (애니메이션용)
}

// 게임 상태
export type GameStatus = 'playing' | 'won' | 'lost';

// 이동 방향
export type Direction = 'up' | 'down' | 'left' | 'right';

// 게임 상태 인터페이스
export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  status: GameStatus;
  gridSize: number; // 4x4 기본
}

// 타일 색상 매핑
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
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
  4096: { bg: '#3c3a32', text: '#f9f6f2' },
  8192: { bg: '#3c3a32', text: '#f9f6f2' },
};

// 그리드 상수
export const GRID_SIZE = 4;
export const WINNING_TILE = 2048;
