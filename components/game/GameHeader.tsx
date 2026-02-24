import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { StarDisplay, StreakBadge } from '@/components/reward';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useGameStore } from '@/store/gameStore';
import { gameHaptics } from '@/services/hapticService';

interface GameHeaderProps {
  score: number;
  bestScore: number;
  onNewGame: () => void;
  onShowStats?: () => void;
  onShowSettings?: () => void;
}

function GameHeaderComponent({
  score,
  bestScore,
  onNewGame,
  onShowStats,
  onShowSettings,
}: GameHeaderProps) {
  // Undo 관련
  const undo = useGameStore((state) => state.undo);
  const canUndo = useGameStore((state) => state.canUndo);
  const getUndoCount = useGameStore((state) => state.getUndoCount);

  const handleUndo = async () => {
    if (canUndo()) {
      await gameHaptics.tileMove();
      undo();
    }
  };

  const undoAvailable = canUndo();
  const remainingUndos = getUndoCount();

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>루틴 섬</Text>
          <View style={styles.rewardSection}>
            <StarDisplay size="sm" />
            <StreakBadge />
          </View>
        </View>
        <Text style={styles.subtitle}>베타: 현재는 2048 테스트 모드입니다</Text>
      </View>

      <View style={styles.controlSection}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{bestScore.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.buttonSection}>
          {/* 통계 버튼 */}
          {onShowStats && (
            <TouchableOpacity style={styles.iconButton} onPress={onShowStats} activeOpacity={0.7}>
              <Ionicons name="stats-chart" size={20} color="#f9f6f2" />
            </TouchableOpacity>
          )}

          {/* 설정 버튼 */}
          {onShowSettings && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onShowSettings}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#f9f6f2" />
            </TouchableOpacity>
          )}

          {/* Undo 버튼 */}
          <TouchableOpacity
            style={[styles.iconButton, !undoAvailable && styles.iconButtonDisabled]}
            onPress={handleUndo}
            activeOpacity={0.7}
            disabled={!undoAvailable}
          >
            <Ionicons name="arrow-undo" size={20} color={undoAvailable ? '#f9f6f2' : '#bbada0'} />
            {remainingUndos > 0 && (
              <View style={styles.undoBadge}>
                <Text style={styles.undoBadgeText}>{remainingUndos}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* New Game 버튼 */}
          <TouchableOpacity style={styles.newGameButton} onPress={onNewGame} activeOpacity={0.7}>
            <Text style={styles.newGameText}>New Game</Text>
          </TouchableOpacity>
        </View>
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
  titleSection: {
    marginBottom: SIZES.spacing.md,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#776e65',
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  rewardSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  controlSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreSection: {
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
  scoreValue: {
    color: '#ffffff',
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
  },
  buttonSection: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#8f7a66',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.sm,
    position: 'relative',
  },
  iconButtonDisabled: {
    backgroundColor: '#cdc1b4',
  },
  undoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#edc22e',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoBadgeText: {
    color: '#776e65',
    fontSize: 10,
    fontWeight: 'bold',
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
});

export const GameHeader = memo(GameHeaderComponent);
