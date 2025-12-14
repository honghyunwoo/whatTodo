import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { GameBoard, GameHeader, GameOverModal } from '@/components/game';
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

  const [showModal, setShowModal] = useState(false);

  // 게임 시작 시 초기화
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

  return (
    <View style={styles.container}>
      <GameHeader score={score} bestScore={bestScore} onNewGame={handleNewGame} />

      <View style={styles.boardContainer}>
        <GameBoard tiles={tiles} onMove={handleMove} />
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>스와이프로 타일을 이동하세요</Text>
        <Text style={styles.instructionSubtext}>같은 숫자끼리 합쳐집니다!</Text>
      </View>

      <GameOverModal
        visible={showModal}
        status={status}
        score={score}
        onNewGame={handleNewGame}
        onContinue={status === 'won' ? handleContinue : undefined}
      />
    </View>
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
