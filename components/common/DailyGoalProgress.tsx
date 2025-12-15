/**
 * Daily Goal Progress - Phase 0.5
 * 일일 목표 진행률 표시
 *
 * 심리학 원리: Goal Gradient Effect
 * - 목표에 가까울수록 더 빨리 진행하려는 경향
 * - "2/3 완료" > "66% 완료"
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface DailyGoalProgressProps {
  lessonsCompleted: number;
  dailyGoal: number;
  xpToday: number;
  streak: number;
  onPress?: () => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function DailyGoalProgress({
  lessonsCompleted,
  dailyGoal,
  xpToday,
  streak,
  onPress,
}: DailyGoalProgressProps) {
  // 진행률 계산
  const progress = useMemo(() => {
    return Math.min((lessonsCompleted / dailyGoal) * 100, 100);
  }, [lessonsCompleted, dailyGoal]);

  // 목표 달성 여부
  const isCompleted = lessonsCompleted >= dailyGoal;

  // 남은 레슨 수
  const remaining = Math.max(dailyGoal - lessonsCompleted, 0);

  // 동기부여 메시지
  const getMessage = () => {
    if (isCompleted) return '오늘 목표 달성!';
    if (remaining === 1) return '딱 1개만 더!';
    if (remaining === 2) return '거의 다 왔어요!';
    if (lessonsCompleted === 0) return '오늘의 첫 레슨을 시작해요!';
    return `${remaining}개 남았어요!`;
  };

  // 그라데이션 색상
  const gradientColors = isCompleted
    ? ['#34C759', '#30D158'] // 완료: 초록색
    : [COLORS.primary, '#5856D6']; // 진행 중: 파란색

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* 상단: 목표 & 스트릭 */}
        <View style={styles.header}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>오늘의 목표</Text>
            <View style={styles.goalCount}>
              <Text style={styles.currentCount}>{lessonsCompleted}</Text>
              <Text style={styles.separator}>/</Text>
              <Text style={styles.totalCount}>{dailyGoal}</Text>
              <Text style={styles.unitText}>레슨</Text>
            </View>
          </View>

          {/* 스트릭 배지 */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
            </View>
          )}
        </View>

        {/* 진행 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <MotiView
              animate={{ width: `${progress}%` }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.progressFill}
            />
          </View>
        </View>

        {/* 하단: 메시지 & XP */}
        <View style={styles.footer}>
          <View style={styles.messageContainer}>
            {isCompleted && (
              <MaterialCommunityIcons name="check-circle" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.message}>{getMessage()}</Text>
          </View>

          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>✨</Text>
            <Text style={styles.xpText}>{xpToday} XP</Text>
          </View>
        </View>

        {/* 보너스 힌트 (목표 완료 시) */}
        {isCompleted && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.bonusHint}
          >
            <Text style={styles.bonusText}>🎁 추가 학습 시 보너스 XP!</Text>
          </MotiView>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  goalCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentCount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 24,
    fontWeight: '300',
    marginHorizontal: 2,
  },
  totalCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 20,
    fontWeight: '600',
  },
  unitText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginLeft: SIZES.spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
  },
  fireEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: SIZES.spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.borderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.md,
  },
  xpIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bonusHint: {
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  bonusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DailyGoalProgress;
