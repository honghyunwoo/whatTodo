/**
 * Game Screen (루틴 섬 베타)
 * 현재는 2048 테스트 모드를 fallback으로 사용
 */

import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import {
  GameBoard,
  GameHeader,
  GameOverModal,
  GameStats,
  BoardSizeSelector,
} from '@/components/game';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useGameStore } from '@/store/gameStore';
import { Direction } from '@/types/game';

export default function GameScreen() {
  const tiles = useGameStore((state) => state.tiles);
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const status = useGameStore((state) => state.status);
  const newGame = useGameStore((state) => state.newGame);
  const move = useGameStore((state) => state.move);
  const gridSize = useGameStore((state) => state.gridSize);

  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 게임 시작 시 초기화 (저장된 게임이 없을 때만)
  useEffect(() => {
    if (tiles.length === 0) {
      newGame();
    }
  }, [tiles.length, newGame]);

  // 게임 오버/승리 시 모달 표시
  useEffect(() => {
    if (status === 'won' || status === 'lost') {
      setShowModal(true);
    }
  }, [status]);

  const handleMove = useCallback(
    (direction: Direction) => {
      move(direction);
    },
    [move]
  );

  const handleNewGame = useCallback(() => {
    setShowModal(false);
    newGame();
  }, [newGame]);

  const handleContinue = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleShowStats = useCallback(() => {
    setShowStats(true);
  }, []);

  const handleShowSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: '루틴 섬',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <GameHeader
          score={score}
          bestScore={bestScore}
          onNewGame={handleNewGame}
          onShowStats={handleShowStats}
          onShowSettings={handleShowSettings}
        />

        <View style={styles.boardContainer}>
          <GameBoard tiles={tiles} onMove={handleMove} gridSize={gridSize} />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>루틴 섬 베타: 2048 테스트 모드</Text>
          <Text style={styles.instructionSubtext}>
            다음 단계에서 정산/투자 루프로 교체됩니다 ({gridSize}x{gridSize} 보드)
          </Text>
        </View>

        <GameOverModal
          visible={showModal}
          status={status}
          score={score}
          onNewGame={handleNewGame}
          onContinue={status === 'won' ? handleContinue : undefined}
        />

        <GameStats visible={showStats} onClose={() => setShowStats(false)} />

        <BoardSizeSelector visible={showSettings} onClose={() => setShowSettings(false)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#faf8ef',
    flex: 1,
  },
  instructionSubtext: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
    textAlign: 'center',
  },
  instructions: {
    paddingBottom: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.md,
  },
  instructionText: {
    color: '#776e65',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});
