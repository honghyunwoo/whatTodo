/**
 * SRS Widget - 홈 화면 복습 위젯
 * 오늘 복습할 단어 수와 진행률을 보여주고 바로 복습 시작 가능
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useSrsStore } from '@/store/srsStore';
import { useWrongAnswerStore } from '@/store/wrongAnswerStore';

/**
 * SrsWidget: 홈 화면에 표시되는 SRS 복습 위젯
 * - 오늘 복습할 단어 수
 * - 복습 진행률
 * - 틀린 문제 수
 * - 빠른 복습 시작 버튼
 */
export function SrsWidget() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // SRS Store 구독
  const getDueWordCount = useSrsStore((state) => state.getDueWordCount);
  const getTodayProgress = useSrsStore((state) => state.getTodayProgress);

  // Wrong Answer Store 구독
  const getPendingCount = useWrongAnswerStore((state) => state.getPendingCount);

  // 통계 계산
  const stats = useMemo(() => {
    const dueWords = getDueWordCount();
    const todayProgress = getTodayProgress();
    const wrongAnswers = getPendingCount();

    return {
      dueWords,
      wrongAnswers,
      todayDone: todayProgress.done,
      todayGoal: todayProgress.goal,
      progressPercent: Math.min(100, Math.round((todayProgress.done / todayProgress.goal) * 100)),
    };
  }, [getDueWordCount, getTodayProgress, getPendingCount]);

  // 복습할 것이 없으면 표시하지 않음
  const hasReviews = stats.dueWords > 0 || stats.wrongAnswers > 0;

  const handlePress = () => {
    router.push('/(tabs)/learn');
  };

  if (!hasReviews) {
    return null;
  }

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
        },
        SHADOWS.sm,
      ]}
      onPress={handlePress}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="refresh-circle" size={28} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>오늘의 복습</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {stats.progressPercent}% 완료
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      {/* 통계 */}
      <View style={styles.statsContainer}>
        {stats.dueWords > 0 && (
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="book-outline" size={16} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.dueWords}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>복습 단어</Text>
          </View>
        )}

        {stats.wrongAnswers > 0 && (
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: COLORS.danger + '20' }]}>
              <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.wrongAnswers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>틀린 문제</Text>
          </View>
        )}

        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.todayDone}/{stats.todayGoal}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>오늘 완료</Text>
        </View>
      </View>

      {/* 진행률 바 */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.progressPercent}%`,
                backgroundColor: COLORS.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* CTA */}
      <View style={[styles.ctaContainer, { backgroundColor: COLORS.primary + '10' }]}>
        <Text style={[styles.ctaText, { color: COLORS.primary }]}>복습 시작하기</Text>
        <Ionicons name="play-circle" size={20} color={COLORS.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
    overflow: 'hidden',
    padding: SIZES.spacing.md,
  },
  ctaContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    justifyContent: 'center',
    marginTop: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
  },
  ctaText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  progressBar: {
    borderRadius: SIZES.borderRadius.full,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressContainer: {
    marginTop: SIZES.spacing.md,
  },
  progressFill: {
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  statBadge: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 32,
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xs,
    width: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  statValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
  },
  subtitle: {
    fontSize: SIZES.fontSize.xs,
  },
  title: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
