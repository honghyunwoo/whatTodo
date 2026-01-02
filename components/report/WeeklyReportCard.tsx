/**
 * WeeklyReportCard - 주간 학습 리포트 카드
 * 주간 학습 통계를 시각적으로 보여주는 카드
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useReportStore, WeeklyReport } from '@/store/reportStore';

interface WeeklyReportCardProps {
  report?: WeeklyReport;
  compact?: boolean;
}

/**
 * WeeklyReportCard: 주간 학습 리포트를 보여주는 카드
 * - 총 학습 시간
 * - 완료한 활동 수
 * - 스트릭 유지 여부
 * - 개선률
 */
export function WeeklyReportCard({ report, compact = false }: WeeklyReportCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Store에서 현재 주 통계 가져오기
  const getCurrentWeekStats = useReportStore((state) => state.getCurrentWeekStats);
  const currentStats = useMemo(() => getCurrentWeekStats(), [getCurrentWeekStats]);

  // 리포트가 없으면 현재 주 통계 표시
  const displayData = useMemo(() => {
    if (report) {
      return {
        totalMinutes: report.totalMinutes,
        totalActivities: report.totalActivities,
        daysActive: report.daysActive,
        streakMaintained: report.streakMaintained,
        improvementRate: report.improvementRate,
        weekId: report.id,
        isCurrentWeek: false,
      };
    }

    return {
      ...currentStats,
      streakMaintained: false,
      improvementRate: 0,
      weekId: '이번 주',
      isCurrentWeek: true,
    };
  }, [report, currentStats]);

  // 시간 포맷
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  const handlePress = () => {
    if (report) {
      router.push(`/report/${report.id}`);
    }
  };

  if (compact) {
    return (
      <Pressable
        style={[
          styles.compactContainer,
          { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
          SHADOWS.sm,
        ]}
        onPress={handlePress}
      >
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]}>{displayData.weekId}</Text>
          <View style={styles.compactStats}>
            <Text style={[styles.compactStat, { color: colors.textSecondary }]}>
              {formatTime(displayData.totalMinutes)}
            </Text>
            <Text style={[styles.compactDivider, { color: colors.textSecondary }]}>|</Text>
            <Text style={[styles.compactStat, { color: colors.textSecondary }]}>
              {displayData.totalActivities}개 활동
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={isDark ? ['#2C2C2E', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
        style={[styles.gradient, SHADOWS.sm]}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.weekLabel, { color: colors.text }]}>
              {displayData.isCurrentWeek ? '이번 주' : displayData.weekId}
            </Text>
          </View>
          {!displayData.isCurrentWeek && (
            <View
              style={[
                styles.improvementBadge,
                {
                  backgroundColor:
                    displayData.improvementRate >= 0 ? COLORS.success + '20' : COLORS.danger + '20',
                },
              ]}
            >
              <Ionicons
                name={displayData.improvementRate >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={displayData.improvementRate >= 0 ? COLORS.success : COLORS.danger}
              />
              <Text
                style={[
                  styles.improvementText,
                  {
                    color: displayData.improvementRate >= 0 ? COLORS.success : COLORS.danger,
                  },
                ]}
              >
                {displayData.improvementRate > 0 ? '+' : ''}
                {displayData.improvementRate}%
              </Text>
            </View>
          )}
        </View>

        {/* 메인 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(displayData.totalMinutes)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습 시간</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {displayData.totalActivities}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>완료 활동</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="flame-outline" size={20} color={COLORS.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {displayData.daysActive}일
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>활동 일수</Text>
          </View>
        </View>

        {/* 스트릭 상태 */}
        {!displayData.isCurrentWeek && (
          <View
            style={[
              styles.streakBadge,
              {
                backgroundColor: displayData.streakMaintained
                  ? COLORS.success + '10'
                  : COLORS.textSecondary + '10',
              },
            ]}
          >
            <Ionicons
              name={displayData.streakMaintained ? 'trophy' : 'sad-outline'}
              size={16}
              color={displayData.streakMaintained ? COLORS.success : colors.textSecondary}
            />
            <Text
              style={[
                styles.streakText,
                {
                  color: displayData.streakMaintained ? COLORS.success : colors.textSecondary,
                },
              ]}
            >
              {displayData.streakMaintained ? '이번 주 스트릭 유지 성공!' : '스트릭 유지 실패'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.xs,
    padding: SIZES.spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactDivider: {
    fontSize: SIZES.fontSize.sm,
    marginHorizontal: SIZES.spacing.xs,
  },
  compactStat: {
    fontSize: SIZES.fontSize.sm,
  },
  compactStats: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  compactTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
  },
  gradient: {
    borderRadius: SIZES.borderRadius.lg,
    overflow: 'hidden',
    padding: SIZES.spacing.md,
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
    gap: SIZES.spacing.xs,
  },
  improvementBadge: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
  },
  improvementText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  statDivider: {
    backgroundColor: COLORS.border,
    height: 40,
    width: 1,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 36,
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xs,
    width: 36,
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
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: SIZES.borderRadius.full,
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
  },
  streakText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  weekLabel: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
