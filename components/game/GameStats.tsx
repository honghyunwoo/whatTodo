import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { SIZES } from '@/constants/sizes';
import { useGameStore } from '@/store/gameStore';
import { BlurModal } from '@/components/common';

interface GameStatsProps {
  visible: boolean;
  onClose: () => void;
}

function GameStatsComponent({ visible, onClose }: GameStatsProps) {
  const stats = useGameStore((state) => state.getStats());
  const resetStats = useGameStore((state) => state.resetStats);

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const formatTime = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <BlurModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>게임 통계</Text>

        <View style={styles.grid}>
          {/* 총 플레이 */}
          <StatBox
            icon="game-controller-outline"
            label="총 플레이"
            value={stats.gamesPlayed.toString()}
          />

          {/* 승리 횟수 */}
          <StatBox
            icon="trophy-outline"
            label="승리"
            value={stats.gamesWon.toString()}
            color="#edc22e"
          />

          {/* 승률 */}
          <StatBox icon="stats-chart-outline" label="승률" value={`${winRate}%`} color="#4CAF50" />

          {/* 최고 타일 */}
          <StatBox
            icon="star-outline"
            label="최고 타일"
            value={stats.highestTile > 0 ? stats.highestTile.toString() : '-'}
            color="#f59563"
          />

          {/* 평균 점수 */}
          <StatBox
            icon="calculator-outline"
            label="평균 점수"
            value={stats.averageScore > 0 ? stats.averageScore.toLocaleString() : '-'}
          />

          {/* 최고 연승 */}
          <StatBox
            icon="flame-outline"
            label="최고 연승"
            value={stats.bestStreak.toString()}
            color="#f65e3b"
          />

          {/* 총 이동 */}
          <StatBox
            icon="swap-horizontal-outline"
            label="총 이동"
            value={stats.totalMoves.toLocaleString()}
          />

          {/* 총 Undo */}
          <StatBox icon="arrow-undo-outline" label="총 Undo" value={stats.totalUndos.toString()} />

          {/* 최단 승리 */}
          <StatBox
            icon="timer-outline"
            label="최단 승리"
            value={formatTime(stats.fastestWin)}
            color="#00bcd4"
          />
        </View>

        {stats.lastPlayedAt && (
          <Text style={styles.lastPlayed}>
            마지막 플레이: {new Date(stats.lastPlayedAt).toLocaleDateString('ko-KR')}
          </Text>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={resetStats}>
          <Text style={styles.resetText}>통계 초기화</Text>
        </TouchableOpacity>
      </View>
    </BlurModal>
  );
}

interface StatBoxProps {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

function StatBox({ icon, label, value, color = '#776e65' }: StatBoxProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.statBox}
    >
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.spacing.lg,
    minWidth: 300,
  },
  title: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: '#776e65',
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    justifyContent: 'center',
  },
  statBox: {
    backgroundColor: '#faf8ef',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#eee4da',
  },
  statValue: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
    color: '#8f7a66',
    marginTop: 2,
  },
  lastPlayed: {
    fontSize: SIZES.fontSize.xs,
    color: '#8f7a66',
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
  resetButton: {
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.sm,
    alignItems: 'center',
  },
  resetText: {
    fontSize: SIZES.fontSize.sm,
    color: '#f65e3b',
  },
});

export const GameStats = memo(GameStatsComponent);
