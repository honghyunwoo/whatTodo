import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { StarDisplay, StreakBadge } from '@/components/reward';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

interface GameHeaderProps {
  score: number;
  bestScore: number;
  onNewGame: () => void;
}

function GameHeaderComponent({ score, bestScore, onNewGame }: GameHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>2048</Text>
          <View style={styles.rewardSection}>
            <StarDisplay size="sm" />
            <StreakBadge />
          </View>
        </View>
        <Text style={styles.subtitle}>숫자를 합쳐 2048을 만드세요!</Text>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.scoreValue}>{bestScore}</Text>
        </View>

        <TouchableOpacity style={styles.newGameButton} onPress={onNewGame} activeOpacity={0.7}>
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    width: '100%',
  },
  newGameButton: {
    backgroundColor: '#8f7a66',
    borderRadius: SIZES.borderRadius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  newGameText: {
    color: '#f9f6f2',
    fontSize: SIZES.fontSize.sm,
    fontWeight: 'bold',
  },
  rewardSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#bbada0',
    borderRadius: SIZES.borderRadius.md,
    minWidth: 70,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  scoreLabel: {
    color: '#eee4da',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    justifyContent: 'flex-end',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  title: {
    color: '#776e65',
    fontSize: 48,
    fontWeight: 'bold',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleSection: {
    marginBottom: SIZES.spacing.md,
  },
});

export const GameHeader = memo(GameHeaderComponent);
