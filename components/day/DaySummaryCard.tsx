/**
 * Day Summary Card 컴포넌트
 *
 * 하루의 자동 생성된 요약을 표시
 * - 완료율, 학습 시간, 인사이트 등
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import type { DaySummary } from '@/types/day';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

interface DaySummaryCardProps {
  /** 자동 생성된 요약 데이터 */
  summary: DaySummary;
}

/**
 * 학습 시간 포맷팅
 */
function formatLearningTime(minutes: number): string {
  if (minutes === 0) return '0분';
  if (minutes < 60) return `${minutes}분`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

/**
 * 통계 항목 컴포넌트
 */
function StatItem({
  icon,
  label,
  value,
  color = COLORS.primary,
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

/**
 * 완료율 프로그레스 바
 */
function CompletionProgress({ rate }: { rate: number }) {
  const { colors } = useTheme();

  // 완료율에 따른 색상
  const getProgressColor = () => {
    if (rate === 100) return COLORS.success;
    if (rate >= 80) return COLORS.primary;
    if (rate >= 50) return '#F59E0B';
    return '#6B7280';
  };

  const progressColor = getProgressColor();

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.text }]}>완료율</Text>
        <Text style={[styles.progressValue, { color: progressColor }]}>{rate}%</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: progressColor,
              width: `${rate}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

/**
 * Day Summary Card 메인 컴포넌트
 */
export function DaySummaryCard({ summary }: DaySummaryCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.md,
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={[styles.title, { color: colors.text }]}>오늘 요약</Text>
        </View>
      </View>

      {/* 완료율 프로그레스 */}
      <CompletionProgress rate={summary.completionRate} />

      {/* 통계 그리드 */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="checkmark-circle-outline"
          label="완료한 할 일"
          value={`${summary.completedTodos}/${summary.totalTodos}`}
          color={COLORS.primary}
        />

        {summary.learningTime > 0 && (
          <StatItem
            icon="book-outline"
            label="학습 시간"
            value={formatLearningTime(summary.learningTime)}
            color="#8B5CF6"
          />
        )}

        {summary.hasNote && (
          <StatItem icon="document-text-outline" label="기록" value="작성 완료" color="#10B981" />
        )}

        {summary.hasDiary && (
          <StatItem icon="create-outline" label="일기" value="작성 완료" color="#F59E0B" />
        )}
      </View>

      {/* 인사이트 메시지 */}
      {summary.insight && (
        <View style={[styles.insightContainer, { backgroundColor: COLORS.primary + '10' }]}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.insightText, { color: COLORS.primary }]}>{summary.insight}</Text>
        </View>
      )}

      {/* 빈 날 안내 */}
      {summary.totalTodos === 0 && summary.learningTime === 0 && !summary.hasDiary && (
        <View style={styles.emptyState}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            이 날은 활동이 없었어요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  emoji: {
    fontSize: 24,
  },
  emptyState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
  },
  emptyText: {
    fontSize: SIZES.fontSize.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  insightContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  insightText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  progressBar: {
    borderRadius: SIZES.borderRadius.sm,
    height: 8,
    overflow: 'hidden',
  },
  progressContainer: {
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.lg,
  },
  progressFill: {
    borderRadius: SIZES.borderRadius.sm,
    height: '100%',
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statIconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
  },
  statValue: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
});
