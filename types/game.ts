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

/**
 * 게임 히스토리 엔트리 (Undo용)
 */
export interface GameHistoryEntry {
  tiles: Tile[];
  score: number;
  timestamp: number;
}

/**
 * 게임 통계
 */
export interface GameStats {
  gamesPlayed: number;           // 총 플레이 횟수
  gamesWon: number;              // 승리 횟수
  totalScore: number;            // 누적 점수
  highestTile: number;           // 최고 타일 (2048, 4096 등)
  totalMoves: number;            // 총 이동 횟수
  totalUndos: number;            // 총 Undo 사용 횟수
  currentStreak: number;         // 현재 연승
  bestStreak: number;            // 최고 연승
  fastestWin?: number;           // 최단 시간 승리 (ms)
  averageScore: number;          // 평균 점수
  lastPlayedAt?: string;         // 마지막 플레이 시간
}

/**
 * 지원하는 보드 크기
 */
export type BoardSize = 3 | 4 | 5 | 6;

export const BOARD_SIZES: { size: BoardSize; name: string; difficulty: string }[] = [
  { size: 3, name: '3×3', difficulty: '쉬움' },
  { size: 4, name: '4×4', difficulty: '보통' },
  { size: 5, name: '5×5', difficulty: '어려움' },
  { size: 6, name: '6×6', difficulty: '매우 어려움' },
];

/**
 * 승리 조건 (보드 크기별)
 */
export const WINNING_TILES: Record<BoardSize, number> = {
  3: 512,
  4: 2048,
  5: 4096,
  6: 8192,
};

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

// 기본 통계
export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalScore: 0,
  highestTile: 0,
  totalMoves: 0,
  totalUndos: 0,
  currentStreak: 0,
  bestStreak: 0,
  averageScore: 0,
};
