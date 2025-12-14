/**
 * Stats View Component
 * Learning statistics dashboard
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { COLORS, withAlpha } from '@/constants/colors';
import { SHADOWS, SIZES } from '@/constants/sizes';
import { useLearnStore, ACTIVITY_TYPES, WEEK_IDS } from '@/store/learnStore';
import { useRewardStore } from '@/store/rewardStore';
import { useSrsStore } from '@/store/srsStore';
import type { ActivityType } from '@/types/activity';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface StatsViewProps {
  onClose?: () => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const SKILL_CONFIG: Record<ActivityType, { icon: string; label: string; color: string }> = {
  vocabulary: { icon: 'book-open-variant', label: '어휘', color: '#8b5cf6' },
  grammar: { icon: 'format-text', label: '문법', color: '#6366f1' },
  listening: { icon: 'headphones', label: '듣기', color: '#3b82f6' },
  reading: { icon: 'file-document-outline', label: '읽기', color: '#22c55e' },
  speaking: { icon: 'microphone', label: '말하기', color: '#f97316' },
  writing: { icon: 'fountain-pen-tip', label: '쓰기', color: '#ef4444' },
};

const LEVEL_NAMES: Record<string, string> = {
  A1: '입문',
  A2: '초급',
  B1: '중급',
  B2: '중상급',
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function StatsView({ onClose }: StatsViewProps) {
  // Stores
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const progress = useLearnStore((state) => state.progress);
  const weekProgress = useLearnStore((state) => state.weekProgress);
  const streak = useLearnStore((state) => state.streak);

  const totalStarsEarned = useRewardStore((state) => state.totalStarsEarned);
  const stars = useRewardStore((state) => state.stars);
  const longestStreak = useRewardStore((state) => state.longestStreak);
  const totalLearningActivities = useRewardStore((state) => state.totalLearningActivities);
  const perfectScores = useRewardStore((state) => state.perfectScores);

  const srsWords = useSrsStore((state) => state.words);
  const reviewStats = useSrsStore((state) => state.reviewStats);

  // ─────────────────────────────────────
  // Computed Stats
  // ─────────────────────────────────────

  const overallStats = useMemo(() => {
    const completedActivities = progress.filter((p) => p.completed).length;
    const totalWordsLearned = progress
      .filter((p) => p.type === 'vocabulary')
      .reduce((sum, p) => sum + (p.wordsMastered || 0), 0);
    const averageScore = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length)
      : 0;

    return {
      completedActivities,
      totalWordsLearned,
      averageScore,
    };
  }, [progress]);

  const skillStats = useMemo(() => {
    const stats: Record<ActivityType, { completed: number; total: number; avgScore: number }> = {} as any;

    ACTIVITY_TYPES.forEach((type) => {
      const typeProgress = progress.filter((p) => p.type === type);
      const completed = typeProgress.filter((p) => p.completed).length;
      const avgScore = typeProgress.length > 0
        ? Math.round(typeProgress.reduce((sum, p) => sum + (p.score || 0), 0) / typeProgress.length)
        : 0;

      stats[type] = {
        completed,
        total: 8, // 8 weeks per skill
        avgScore,
      };
    });

    return stats;
  }, [progress]);

  const weeklyStats = useMemo(() => {
    return WEEK_IDS.map((weekId) => {
      const week = weekProgress.find((w) => w.weekId === weekId);
      return {
        weekId,
        weekNumber: parseInt(weekId.replace('week-', ''), 10),
        completed: week?.activitiesCompleted.length || 0,
        total: ACTIVITY_TYPES.length,
        score: week?.totalScore || 0,
        isComplete: (week?.activitiesCompleted.length || 0) >= ACTIVITY_TYPES.length,
      };
    });
  }, [weekProgress]);

  const srsStats = useMemo(() => {
    const totalWords = srsWords.length;
    const masteredWords = srsWords.filter((w) => w.srsData.interval >= 21).length;
    const dueWords = srsWords.filter((w) => {
      const now = new Date();
      const nextReview = new Date(w.srsData.nextReviewDate);
      return now >= nextReview;
    }).length;

    return {
      totalWords,
      masteredWords,
      dueWords,
      totalReviews: reviewStats.totalReviews,
      accuracy: reviewStats.totalReviews > 0
        ? Math.round((reviewStats.correctReviews / reviewStats.totalReviews) * 100)
        : 0,
    };
  }, [srsWords, reviewStats]);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>학습 통계</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{currentLevel}</Text>
          <Text style={styles.levelName}>{LEVEL_NAMES[currentLevel]}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsRow}>
        <View style={styles.quickStat}>
          <MaterialCommunityIcons name="fire" size={28} color={COLORS.warning} />
          <Text style={styles.quickStatValue}>{streak}</Text>
          <Text style={styles.quickStatLabel}>연속 학습</Text>
        </View>
        <View style={styles.quickStat}>
          <MaterialCommunityIcons name="star" size={28} color={COLORS.warning} />
          <Text style={styles.quickStatValue}>{stars}</Text>
          <Text style={styles.quickStatLabel}>획득 별</Text>
        </View>
        <View style={styles.quickStat}>
          <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.success} />
          <Text style={styles.quickStatValue}>{totalLearningActivities}</Text>
          <Text style={styles.quickStatLabel}>완료 활동</Text>
        </View>
        <View style={styles.quickStat}>
          <MaterialCommunityIcons name="medal" size={28} color={COLORS.primary} />
          <Text style={styles.quickStatValue}>{perfectScores}</Text>
          <Text style={styles.quickStatLabel}>만점</Text>
        </View>
      </View>

      {/* Skill Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>영역별 진행률</Text>
          </View>

          <View style={styles.skillsContainer}>
            {ACTIVITY_TYPES.map((type) => {
              const config = SKILL_CONFIG[type];
              const stats = skillStats[type];
              const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <View key={type} style={styles.skillRow}>
                  <View style={styles.skillInfo}>
                    <View style={[styles.skillIcon, { backgroundColor: withAlpha(config.color, 0.1) }]}>
                      <MaterialCommunityIcons
                        name={config.icon as any}
                        size={16}
                        color={config.color}
                      />
                    </View>
                    <Text style={styles.skillLabel}>{config.label}</Text>
                  </View>

                  <View style={styles.skillProgress}>
                    <View style={styles.skillBarContainer}>
                      <View
                        style={[
                          styles.skillBar,
                          { width: `${percentage}%`, backgroundColor: config.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.skillText}>
                      {stats.completed}/{stats.total}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-week" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>주간 진행률</Text>
          </View>

          <View style={styles.weeksGrid}>
            {weeklyStats.map((week) => {
              const percentage = (week.completed / week.total) * 100;
              const isComplete = week.isComplete;

              return (
                <View
                  key={week.weekId}
                  style={[
                    styles.weekItem,
                    isComplete && styles.weekItemComplete,
                  ]}
                >
                  <Text style={[styles.weekNumber, isComplete && styles.weekNumberComplete]}>
                    W{week.weekNumber}
                  </Text>
                  <View style={styles.weekProgressRing}>
                    <View
                      style={[
                        styles.weekProgressFill,
                        {
                          height: `${percentage}%`,
                          backgroundColor: isComplete ? COLORS.success : COLORS.primary,
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.weekText}>{week.completed}/{week.total}</Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* SRS Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>간격 반복 학습</Text>
          </View>

          <View style={styles.srsStatsRow}>
            <View style={styles.srsStat}>
              <Text style={styles.srsStatValue}>{srsStats.totalWords}</Text>
              <Text style={styles.srsStatLabel}>전체 단어</Text>
            </View>
            <View style={styles.srsStatDivider} />
            <View style={styles.srsStat}>
              <Text style={styles.srsStatValue}>{srsStats.masteredWords}</Text>
              <Text style={styles.srsStatLabel}>마스터</Text>
            </View>
            <View style={styles.srsStatDivider} />
            <View style={styles.srsStat}>
              <Text style={[styles.srsStatValue, srsStats.dueWords > 0 && styles.srsStatValueWarning]}>
                {srsStats.dueWords}
              </Text>
              <Text style={styles.srsStatLabel}>오늘 복습</Text>
            </View>
          </View>

          <View style={styles.srsReviewStats}>
            <View style={styles.srsReviewStat}>
              <MaterialCommunityIcons name="repeat" size={20} color={COLORS.textSecondary} />
              <Text style={styles.srsReviewText}>
                총 {srsStats.totalReviews}회 복습
              </Text>
            </View>
            <View style={styles.srsReviewStat}>
              <MaterialCommunityIcons name="target" size={20} color={COLORS.success} />
              <Text style={styles.srsReviewText}>
                정확도 {srsStats.accuracy}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Achievement Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="trophy" size={24} color={COLORS.warning} />
            <Text style={styles.cardTitle}>업적</Text>
          </View>

          <View style={styles.achievementGrid}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: withAlpha(COLORS.warning, 0.1) }]}>
                <MaterialCommunityIcons name="star" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.achievementValue}>{totalStarsEarned}</Text>
              <Text style={styles.achievementLabel}>총 획득 별</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: withAlpha(COLORS.danger, 0.1) }]}>
                <MaterialCommunityIcons name="fire" size={24} color={COLORS.danger} />
              </View>
              <Text style={styles.achievementValue}>{longestStreak}</Text>
              <Text style={styles.achievementLabel}>최장 연속 학습</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: withAlpha(COLORS.success, 0.1) }]}>
                <MaterialCommunityIcons name="percent" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.achievementValue}>{overallStats.averageScore}%</Text>
              <Text style={styles.achievementLabel}>평균 점수</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: withAlpha(COLORS.primary, 0.1) }]}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.achievementValue}>{overallStats.totalWordsLearned}</Text>
              <Text style={styles.achievementLabel}>학습한 단어</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  levelBadge: {
    alignItems: 'flex-end',
  },
  levelText: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  levelName: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.sm,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.spacing.xs,
  },
  quickStatLabel: {
    fontSize: SIZES.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // Card
  card: {
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  cardTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
  },

  // Skills
  skillsContainer: {
    gap: SIZES.spacing.md,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  skillIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  skillLabel: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.text,
  },
  skillProgress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.spacing.md,
  },
  skillBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: 4,
  },
  skillText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.sm,
    width: 35,
    textAlign: 'right',
  },

  // Weekly
  weeksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  weekItem: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.sm,
    width: '11.5%',
    minWidth: 40,
  },
  weekItemComplete: {
    backgroundColor: withAlpha(COLORS.success, 0.1),
  },
  weekNumber: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  weekNumberComplete: {
    color: COLORS.success,
  },
  weekProgressRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: SIZES.spacing.xs,
  },
  weekProgressFill: {
    width: '100%',
    borderRadius: 12,
  },
  weekText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  // SRS
  srsStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  srsStat: {
    flex: 1,
    alignItems: 'center',
  },
  srsStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  srsStatValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  srsStatValueWarning: {
    color: COLORS.warning,
  },
  srsStatLabel: {
    fontSize: SIZES.fontSize.xs,
    color: COLORS.textSecondary,
  },
  srsReviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  srsReviewStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  srsReviewText: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Achievements
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SIZES.spacing.md,
  },
  achievementItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  achievementValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  achievementLabel: {
    fontSize: SIZES.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default StatsView;
