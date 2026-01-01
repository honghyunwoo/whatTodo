import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  BoardSize,
  DEFAULT_STATS,
  Direction,
  GameHistoryEntry,
  GameStats,
  GameStatus,
  GRID_SIZE,
  Tile,
  WINNING_TILES,
} from '@/types/game';
import { GAME_THEMES, getTileColor } from '@/types/themes';
import { generateId } from '@/utils/id';

interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  status: GameStatus;
  gridSize: number;
  currentTheme: string;

  // Undo 관련
  history: GameHistoryEntry[];
  undoCount: number;
  moveCount: number;
  gameStartedAt?: number;

  // 통계
  stats: GameStats;
}

interface GameActions {
  // 게임 제어
  newGame: () => void;
  move: (direction: Direction) => boolean;

  // 상태 확인
  canMove: () => boolean;

  // 점수 저장
  updateBestScore: () => void;

  // 테마 관리
  setTheme: (themeId: string) => void;
  getTheme: () => (typeof GAME_THEMES)[keyof typeof GAME_THEMES];
  getTileColors: (value: number) => { bg: string; text: string };

  // Undo 관련
  undo: () => boolean;
  canUndo: () => boolean;
  getUndoCount: () => number;

  // 보드 크기
  setGridSize: (size: BoardSize) => void;

  // 통계 관련
  updateStats: (result: 'win' | 'lose') => void;
  getStats: () => GameStats;
  resetStats: () => void;
}

// 빈 셀 찾기
const getEmptyCells = (tiles: Tile[], gridSize: number): { row: number; col: number }[] => {
  const occupied = new Set(tiles.map((t) => `${t.row}-${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (!occupied.has(`${row}-${col}`)) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
};

// 랜덤 타일 생성
const createRandomTile = (tiles: Tile[], gridSize: number): Tile | null => {
  const emptyCells = getEmptyCells(tiles, gridSize);
  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4; // 90% 확률로 2, 10% 확률로 4

  return {
    id: generateId(),
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true,
  };
};

// 타일 이동 및 합치기 로직
const moveTiles = (
  tiles: Tile[],
  direction: Direction,
  gridSize: number
): { newTiles: Tile[]; score: number; moved: boolean } => {
  // 이동 방향에 따른 설정
  const isHorizontal = direction === 'left' || direction === 'right';
  const isReverse = direction === 'right' || direction === 'down';

  // 타일을 그리드로 변환
  const grid: (Tile | null)[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );

  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = { ...tile, isNew: false, isMerged: false };
  });

  let totalScore = 0;
  let moved = false;
  const newTiles: Tile[] = [];

  // 각 행/열에 대해 이동 처리
  for (let i = 0; i < gridSize; i++) {
    // 현재 라인의 타일들 추출
    const line: (Tile | null)[] = [];
    for (let j = 0; j < gridSize; j++) {
      const row = isHorizontal ? i : j;
      const col = isHorizontal ? j : i;
      line.push(grid[row][col]);
    }

    // 이동 방향에 따라 순서 조정
    if (isReverse) line.reverse();

    // 타일 합치기
    const merged: Tile[] = [];
    let prevTile: Tile | null = null;

    for (const tile of line) {
      if (!tile) continue;

      if (prevTile && prevTile.value === tile.value) {
        // 합치기
        const newValue = prevTile.value * 2;
        merged[merged.length - 1] = {
          ...prevTile,
          value: newValue,
          isMerged: true,
          id: generateId(), // 새 ID 부여
        };
        totalScore += newValue;
        prevTile = null;
      } else {
        merged.push({ ...tile });
        prevTile = tile;
      }
    }

    // 새 위치 계산 (reverse 없이 직접 인덱싱)
    // merged 배열은 이동 방향의 "시작점" 순서로 정렬됨
    // isReverse일 때: 끝에서부터 배치, 아닐 때: 처음부터 배치
    for (let j = 0; j < merged.length; j++) {
      const tile = merged[j];
      if (!tile) continue; // 안전 체크

      // 위치 계산: isReverse면 끝에서부터, 아니면 처음부터
      const newPos = isReverse ? gridSize - 1 - j : j;

      const newRow = isHorizontal ? i : newPos;
      const newCol = isHorizontal ? newPos : i;

      // 이동 확인
      if (tile.row !== newRow || tile.col !== newCol) {
        moved = true;
      }

      newTiles.push({
        ...tile,
        row: newRow,
        col: newCol,
      });
    }
  }

  return { newTiles, score: totalScore, moved };
};

// 이동 가능한지 확인
const checkCanMove = (tiles: Tile[], gridSize: number): boolean => {
  // 빈 셀이 있으면 이동 가능
  if (getEmptyCells(tiles, gridSize).length > 0) return true;

  // 인접한 같은 값 타일이 있는지 확인
  const grid: (number | null)[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );

  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile.value;
  });

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const value = grid[row][col];
      if (value === null) continue;

      // 오른쪽 확인
      if (col < gridSize - 1 && grid[row][col + 1] === value) return true;
      // 아래 확인
      if (row < gridSize - 1 && grid[row + 1][col] === value) return true;
    }
  }

  return false;
};

// 승리 확인 (보드 크기에 따른 승리 조건)
const checkWin = (tiles: Tile[], gridSize: number): boolean => {
  const winningTile = WINNING_TILES[gridSize as BoardSize] || 2048;
  return tiles.some((tile) => tile.value >= winningTile);
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      tiles: [],
      score: 0,
      bestScore: 0,
      status: 'playing',
      gridSize: GRID_SIZE,
      currentTheme: 'classic',

      // Undo 관련
      history: [],
      undoCount: 0,
      moveCount: 0,
      gameStartedAt: undefined,

      // 통계
      stats: DEFAULT_STATS,

      // ========================================
      // 게임 제어
      // ========================================

      newGame: () => {
        const gridSize = get().gridSize;
        const tiles: Tile[] = [];

        // 초기 타일 2개 생성
        const tile1 = createRandomTile(tiles, gridSize);
        if (tile1) tiles.push(tile1);

        const tile2 = createRandomTile(tiles, gridSize);
        if (tile2) tiles.push(tile2);

        set({
          tiles,
          score: 0,
          status: 'playing',
          history: [], // 히스토리 초기화
          undoCount: 0, // Undo 카운트 초기화
          moveCount: 0, // 이동 횟수 초기화
          gameStartedAt: Date.now(), // 시작 시간 기록
        });
      },

      move: (direction: Direction) => {
        const { tiles, score, status, gridSize, history, stats } = get();

        // 게임이 끝났으면 이동 불가
        if (status !== 'playing') return false;

        // 현재 상태를 히스토리에 저장 (이동 전)
        const newHistory = [
          { tiles: tiles.map((t) => ({ ...t })), score, timestamp: Date.now() },
          ...history,
        ].slice(0, 3); // 최대 3개만 유지

        const { newTiles, score: addedScore, moved } = moveTiles(tiles, direction, gridSize);

        if (!moved) return false;

        // 새 타일 추가
        const newTile = createRandomTile(newTiles, gridSize);
        if (newTile) {
          newTiles.push(newTile);
        }

        const newScore = score + addedScore;

        // 최고 타일 업데이트
        const maxTile = Math.max(...newTiles.map((t) => t.value));
        if (maxTile > stats.highestTile) {
          set({
            stats: { ...stats, highestTile: maxTile },
          });
        }

        // 상태 업데이트
        let newStatus: GameStatus = 'playing';

        if (checkWin(newTiles, gridSize)) {
          newStatus = 'won';
        } else if (!checkCanMove(newTiles, gridSize)) {
          newStatus = 'lost';
        }

        set({
          tiles: newTiles,
          score: newScore,
          status: newStatus,
          history: newHistory,
          moveCount: get().moveCount + 1,
        });

        // 최고 점수 업데이트
        get().updateBestScore();

        // 게임 종료 시 통계 업데이트
        if (newStatus === 'won' || newStatus === 'lost') {
          get().updateStats(newStatus === 'won' ? 'win' : 'lose');
        }

        return true;
      },

      canMove: () => {
        const { tiles, gridSize } = get();
        return checkCanMove(tiles, gridSize);
      },

      updateBestScore: () => {
        const { score, bestScore } = get();
        if (score > bestScore) {
          set({ bestScore: score });
        }
      },

      // ========================================
      // 테마 관리
      // ========================================

      setTheme: (themeId) => {
        if (GAME_THEMES[themeId]) {
          set({ currentTheme: themeId });
        }
      },

      getTheme: () => {
        const { currentTheme } = get();
        return GAME_THEMES[currentTheme] || GAME_THEMES.classic;
      },

      getTileColors: (value) => {
        const { currentTheme } = get();
        return getTileColor(currentTheme, value);
      },

      // ========================================
      // Undo 시스템
      // ========================================

      undo: () => {
        const { history, status, stats } = get();

        // Undo 불가 조건
        if (history.length === 0) return false;
        if (status !== 'playing') return false;

        const [previousState, ...remainingHistory] = history;

        set({
          tiles: previousState.tiles,
          score: previousState.score,
          history: remainingHistory,
          undoCount: get().undoCount + 1,
          stats: {
            ...stats,
            totalUndos: stats.totalUndos + 1,
          },
        });

        return true;
      },

      canUndo: () => {
        const { history, status } = get();
        return history.length > 0 && status === 'playing';
      },

      getUndoCount: () => {
        return get().history.length;
      },

      // ========================================
      // 보드 크기
      // ========================================

      setGridSize: (size: BoardSize) => {
        set({ gridSize: size });
      },

      // ========================================
      // 통계 시스템
      // ========================================

      updateStats: (result) => {
        const { score, moveCount, gameStartedAt, stats } = get();
        const gameDuration = gameStartedAt ? Date.now() - gameStartedAt : 0;

        const newGamesPlayed = stats.gamesPlayed + 1;
        const newGamesWon = stats.gamesWon + (result === 'win' ? 1 : 0);
        const newTotalScore = stats.totalScore + score;
        const newTotalMoves = stats.totalMoves + moveCount;

        // 연승 계산
        const newCurrentStreak = result === 'win' ? stats.currentStreak + 1 : 0;
        const newBestStreak = Math.max(stats.bestStreak, newCurrentStreak);

        // 최단 시간 승리
        let newFastestWin = stats.fastestWin;
        if (result === 'win') {
          if (!newFastestWin || gameDuration < newFastestWin) {
            newFastestWin = gameDuration;
          }
        }

        set({
          stats: {
            ...stats,
            gamesPlayed: newGamesPlayed,
            gamesWon: newGamesWon,
            totalScore: newTotalScore,
            totalMoves: newTotalMoves,
            currentStreak: newCurrentStreak,
            bestStreak: newBestStreak,
            fastestWin: newFastestWin,
            averageScore: Math.round(newTotalScore / newGamesPlayed),
            lastPlayedAt: new Date().toISOString(),
          },
        });
      },

      getStats: () => get().stats,

      resetStats: () => {
        set({ stats: DEFAULT_STATS });
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS + '/game',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[GameStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
      // 게임 상태 전체 저장 (앱 종료해도 유지)
      partialize: (state) => ({
        tiles: state.tiles,
        score: state.score,
        bestScore: state.bestScore,
        status: state.status,
        gridSize: state.gridSize,
        currentTheme: state.currentTheme,
        history: state.history,
        undoCount: state.undoCount,
        moveCount: state.moveCount,
        gameStartedAt: state.gameStartedAt,
        stats: state.stats,
      }),
    }
  )
);
