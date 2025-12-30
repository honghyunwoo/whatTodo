import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useTaskStore } from '@/store/taskStore';
import { useStreakStore } from '@/store/streakStore';
import { useLearnStore } from '@/store/learnStore';
import { useLessonStore } from '@/store/lessonStore';
import { useRewardStore } from '@/store/rewardStore';

/**
 * TodaySummary: Duolingo 스타일 홈 화면 히어로 섹션
 *
 * 단순화된 구조:
 * - 스트릭 표시 (동기부여)
 * - 오늘의 레슨 시작 CTA
 * - 미니 통계 (진행률, XP, 할일)
 */
export function TodaySummary() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Store 구독
  const tasks = useTaskStore((state) => state.tasks);
  const { currentStreak, longestStreak } = useStreakStore();
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const { stars, todayStarsEarned, totalStarsEarned } = useRewardStore();

  // 현재 레슨 정보
  const currentLessonId = useLessonStore((state) => state.currentLessonId);

  // 오늘 할일 통계
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate === today);
    const completed = todayTasks.filter((t) => t.completed).length;
    return { completed, total: todayTasks.length };
  }, [tasks]);

  // 진행률 계산 (레슨/주차 기반)
  const weekProgress = useLearnStore((state) => state.weekProgress);
  const progressPercent = useMemo(() => {
    if (!weekProgress || Object.keys(weekProgress).length === 0) return 0;

    // 현재 레벨의 주차 진행률 평균 계산
    const levelWeeks = Object.entries(weekProgress).filter(([weekId]) =>
      weekId.includes(currentLevel.toLowerCase())
    );

    if (levelWeeks.length === 0) return 0;

    const totalProgress = levelWeeks.reduce((sum, [, progress]) => {
      if (typeof progress === 'object' && progress !== null) {
        const p = progress as { completed?: number; total?: number };
        return sum + (p.total && p.total > 0 ? (p.completed || 0) / p.total : 0);
      }
      return sum;
    }, 0);

    return Math.round((totalProgress / levelWeeks.length) * 100);
  }, [weekProgress, currentLevel]);

  // CTA 핸들러
  const handleStartLesson = () => {
    if (currentLessonId) {
      router.push(`/learn/lesson/${currentLessonId}`);
    } else {
      router.push('/learn');
    }
  };

  const handleViewDetails = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/day/${today}`);
  };

  return (
    <View style={styles.container}>
      {/* 히어로 그라디언트 섹션 */}
      <LinearGradient
        colors={isDark ? ['#4338CA', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        {/* 스트릭 표시 */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak!</Text>
          {longestStreak > currentStreak && (
            <Text style={styles.streakBest}>최고: {longestStreak}일</Text>
          )}
        </View>

        {/* CTA 버튼 */}
        <Pressable style={styles.ctaButton} onPress={handleStartLesson}>
          <View style={styles.ctaContent}>
            <MaterialCommunityIcons name="play-circle" size={28} color="#6366F1" />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>오늘의 레슨 시작</Text>
              <Text style={styles.ctaSubtitle}>
                {currentLessonId
                  ? `${currentLevel} · 이어서 학습하기`
                  : `${currentLevel} 레벨 학습하기`}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </View>
        </Pressable>
      </LinearGradient>

      {/* 미니 통계 카드 */}
      <View style={[styles.statsRow, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Pressable style={styles.statCard} onPress={() => router.push('/learn')}>
          <Text style={styles.statEmoji}>📊</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{progressPercent}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>진행률</Text>
        </Pressable>

        <View style={[styles.statDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]} />

        <Pressable style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>+{stars}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>별</Text>
        </Pressable>

        <View style={[styles.statDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]} />

        <Pressable style={styles.statCard} onPress={handleViewDetails}>
          <Text style={styles.statEmoji}>✓</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {todayStats.completed}/{todayStats.total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>할일</Text>
        </Pressable>
      </View>

      {/* XP 진행 바 */}
      <View style={[styles.xpContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.xpHeader}>
          <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>오늘의 별</Text>
          <Text style={[styles.xpValue, { color: COLORS.primary }]}>+{todayStarsEarned} ⭐</Text>
        </View>
        <View style={[styles.xpBar, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
          <View
            style={[styles.xpFill, { width: `${Math.min((todayStarsEarned / 50) * 100, 100)}%` }]}
          />
        </View>
        <Text style={[styles.xpGoal, { color: colors.textSecondary }]}>일일 목표: 50 ⭐</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  heroGradient: {
    borderRadius: SIZES.borderRadius.xl,
    padding: SIZES.spacing.xl,
    ...SHADOWS.lg,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: SIZES.spacing.xs,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  streakBest: {
    fontSize: SIZES.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SIZES.spacing.xs,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    ...SHADOWS.md,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    color: '#1F2937',
  },
  ctaSubtitle: {
    fontSize: SIZES.fontSize.sm,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
  },
  xpContainer: {
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  xpLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  xpValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  xpGoal: {
    fontSize: SIZES.fontSize.xs,
    marginTop: SIZES.spacing.xs,
    textAlign: 'right',
  },
});
