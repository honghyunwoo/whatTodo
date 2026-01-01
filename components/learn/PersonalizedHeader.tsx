/**
 * Personalized Header Component - Phase 0
 * 개인화된 홈/학습 화면 헤더
 *
 * 표시 정보:
 * 1. 시간대별 인사말 (이름 포함)
 * 2. 동기부여 메시지
 * 3. 일일 목표 진행률
 * 4. 스트릭 & XP 통계
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useUserStore } from '@/store/userStore';
import { useStreakStore } from '@/store/streakStore';
import { useRewardStore } from '@/store/rewardStore';
import {
  getGreeting,
  getMotivationalMessage,
  getDailyProgressMessage,
  UserContext,
} from '@/utils/personalization';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface PersonalizedHeaderProps {
  lessonsToday?: number;
  variant?: 'full' | 'compact';
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function PersonalizedHeader({
  lessonsToday = 0,
  variant = 'full',
}: PersonalizedHeaderProps) {
  // Stores
  const { name, dailyGoal } = useUserStore();
  const { currentStreak, longestStreak, lastStudyDate } = useStreakStore();
  const { stars: totalXP, todayLearningActivities } = useRewardStore();

  // 실제 오늘 레슨 수 (prop 또는 store에서)
  const actualLessonsToday = lessonsToday || todayLearningActivities;

  // 개인화된 메시지 생성
  const { greeting, motivation, progress } = useMemo(() => {
    const displayName = name || '학습자';

    const context: UserContext = {
      name: displayName,
      currentStreak,
      longestStreak,
      totalXP,
      lessonsToday: actualLessonsToday,
      dailyGoal,
      lastStudyDate,
      totalDaysStudied: 0,
    };

    return {
      greeting: getGreeting(displayName),
      motivation: getMotivationalMessage(context),
      progress: getDailyProgressMessage(actualLessonsToday, dailyGoal),
    };
  }, [name, currentStreak, longestStreak, totalXP, actualLessonsToday, dailyGoal, lastStudyDate]);

  // 진행률 계산
  const progressPercent = Math.min((actualLessonsToday / dailyGoal) * 100, 100);

  // Compact 버전
  if (variant === 'compact') {
    return <CompactHeader greeting={greeting} streak={currentStreak} xp={totalXP} />;
  }

  // Full 버전
  return (
    <LinearGradient
      colors={[COLORS.primary, '#5856D6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* 인사말 */}
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={styles.greeting}>{greeting}</Text>
      </Animated.View>

      {/* 동기부여 메시지 */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)}>
        <Text style={styles.motivation}>{motivation}</Text>
      </Animated.View>

      {/* 일일 목표 진행률 */}
      <Animated.View entering={FadeIn.duration(300).delay(200)} style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>오늘의 목표</Text>
          <Text style={styles.progressLabel}>
            {actualLessonsToday}/{dailyGoal}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.progressMessage}>{progress}</Text>
      </Animated.View>

      {/* 스트릭 & XP 통계 */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.statsContainer}>
        {/* 스트릭 */}
        <View style={styles.statItem}>
          <View>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>연속</Text>
        </View>

        <View style={styles.statDivider} />

        {/* XP */}
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────
// Compact Header (작은 버전)
// ─────────────────────────────────────

interface CompactHeaderProps {
  greeting: string;
  streak: number;
  xp: number;
}

function CompactHeader({ greeting, streak, xp }: CompactHeaderProps) {
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactGreeting}>{greeting}</Text>

      <View style={styles.compactStats}>
        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatEmoji}>🔥</Text>
          <Text style={styles.compactStatValue}>{streak}</Text>
        </View>

        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatEmoji}>⭐</Text>
          <Text style={styles.compactStatValue}>{xp.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  // Full Header
  container: {
    padding: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    borderBottomLeftRadius: SIZES.borderRadius.xl,
    borderBottomRightRadius: SIZES.borderRadius.xl,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  motivation: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SIZES.spacing.xs,
  },

  // Progress Section
  progressSection: {
    marginTop: SIZES.spacing.lg,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.xs,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: SIZES.borderRadius.full,
  },
  progressMessage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Compact Header
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.md,
  },
  compactGreeting: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  compactStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatEmoji: {
    fontSize: 14,
  },
  compactStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PersonalizedHeader;
