import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { Tile } from './Tile';

import { Direction, GRID_SIZE, Tile as TileType } from '@/types/game';
import { gameHaptics } from '@/services/hapticService';
import { useGameStore } from '@/store/gameStore';

interface GameBoardProps {
  tiles: TileType[];
  onMove: (direction: Direction) => void;
  gridSize?: number;
}

const BOARD_PADDING = 8;
const TILE_GAP = 8;

function GameBoardComponent({ tiles, onMove, gridSize = GRID_SIZE }: GameBoardProps) {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400);
  const tileSize = (boardSize - BOARD_PADDING * 2 - TILE_GAP * (gridSize + 1)) / gridSize;

  // Get current theme
  const getTheme = useGameStore((state) => state.getTheme);
  const theme = getTheme();

  // 스와이프 상태 추적
  const isProcessing = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSwipe = useCallback(
    (translationX: number, translationY: number) => {
      if (isProcessing.current) return;

      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      const threshold = 30;

      if (Math.max(absX, absY) < threshold) return;

      isProcessing.current = true;

      let direction: Direction;
      if (absX > absY) {
        direction = translationX > 0 ? 'right' : 'left';
      } else {
        direction = translationY > 0 ? 'down' : 'up';
      }

      // Haptic feedback on swipe (비동기, 에러 무시)
      gameHaptics.tileMove().catch(() => {});

      onMove(direction);

      // 잠시 후 처리 가능 상태로 복원
      timerRef.current = setTimeout(() => {
        isProcessing.current = false;
      }, 100);
    },
    [onMove]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        // 제스처 시작 조건을 느슨하게 설정하여 게임 보드 내에서 빠르게 캡처
        .activeOffsetX([-10, 10])
        .activeOffsetY([-10, 10])
        // 네비게이션 제스처보다 우선권 확보
        .hitSlop({ left: 20, right: 20, top: 20, bottom: 20 })
        .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
          handleSwipe(event.translationX, event.translationY);
        })
        .minDistance(10),
    [handleSwipe]
  );

  // 빈 셀 그리드 렌더링
  const emptyCells = useMemo(() => {
    const cells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        cells.push(
          <View
            key={`empty-${row}-${col}`}
            style={[
              styles.emptyCell,
              {
                width: tileSize,
                height: tileSize,
                left: col * (tileSize + TILE_GAP) + TILE_GAP,
                top: row * (tileSize + TILE_GAP) + TILE_GAP,
                backgroundColor: theme.emptyTileBg,
              },
            ]}
          />
        );
      }
    }
    return cells;
  }, [gridSize, tileSize, theme.emptyTileBg]);

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            backgroundColor: theme.boardBg,
          },
        ]}
      >
        {emptyCells}
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} tileSize={tileSize} gap={TILE_GAP} />
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 8,
    position: 'relative',
  },
  emptyCell: {
    borderRadius: 6,
    position: 'absolute',
  },
});

export const GameBoard = memo(GameBoardComponent);
