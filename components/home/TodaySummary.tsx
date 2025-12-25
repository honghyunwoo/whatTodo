import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getTodayData, getTodayString, getKoreanDayOfWeek } from '@/utils/day';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useTaskStore } from '@/store/taskStore';
import { useJournalStore } from '@/store/journalStore';
import { useDiaryStore } from '@/store/diaryStore';

/**
 * TodaySummary: 홈 화면 상단의 오늘 요약 카드
 *
 * 기능:
 * - 오늘 날짜 및 요일 표시
 * - Todo 완료율 프로그레스 바
 * - 완료된 할 일 개수
 * - 학습 시간 표시
 * - 탭하면 Day Page로 이동
 */
export function TodaySummary() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Store 구독 (변경 감지용)
  const tasks = useTaskStore((state) => state.tasks);
  const journalEntries = useJournalStore((state) => state.entries);
  const diaryEntries = useDiaryStore((state) => state.entries);

  // 오늘 데이터 조회 (useMemo로 캐싱)

  const todayData = useMemo(() => {
    return getTodayData();
  }, [tasks, journalEntries, diaryEntries]);

  const today = getTodayString();
  const dayOfWeek = getKoreanDayOfWeek(today);

  // 날짜 포맷팅 (예: "12월 25일")
  const formattedDate = useMemo(() => {
    const date = new Date(today);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  }, [today]);

  const handlePress = () => {
    router.push(`/day/${today}`);
  };

  const progressColor = getProgressColor(todayData.summary.completionRate);

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.md,
      ]}
      onPress={handlePress}
    >
      {/* 날짜 헤더 */}
      <View style={styles.header}>
        <View style={styles.dateInfo}>
          <Text style={[styles.date, { color: colors.text }]}>{formattedDate}</Text>
          <View style={[styles.dayBadge, { backgroundColor: COLORS.primary + '20' }]}>
            <Text style={[styles.dayText, { color: COLORS.primary }]}>{dayOfWeek}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      {/* 완료율 프로그레스 바 */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>오늘의 진행도</Text>
          <Text style={[styles.progressPercentage, { color: progressColor }]}>
            {todayData.summary.completionRate}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${todayData.summary.completionRate}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {/* 통계 그리드 */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={todayData.summary.completedTodos > 0 ? COLORS.success : colors.textSecondary}
          />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {todayData.summary.completedTodos}/{todayData.summary.totalTodos}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>할 일</Text>
        </View>

        {todayData.summary.learningTime > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatLearningTime(todayData.summary.learningTime)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습</Text>
          </View>
        )}

        {todayData.summary.hasNote && (
          <View style={styles.statItem}>
            <Ionicons name="create-outline" size={20} color={COLORS.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>✓</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>기록</Text>
          </View>
        )}

        {todayData.summary.hasDiary && (
          <View style={styles.statItem}>
            <Ionicons name="book" size={20} color={COLORS.error} />
            <Text style={[styles.statValue, { color: colors.text }]}>✓</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>일기</Text>
          </View>
        )}
      </View>

      {/* 인사이트 메시지 */}
      {todayData.summary.insight && (
        <View style={[styles.insightBox, { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7' }]}>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            💡 {todayData.summary.insight}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * 완료율에 따른 프로그레스 바 색상
 */
function getProgressColor(rate: number): string {
  if (rate === 0) return COLORS.textSecondary;
  if (rate < 50) return COLORS.warning;
  if (rate < 100) return COLORS.primary;
  return COLORS.success;
}

/**
 * 학습 시간 포맷팅 (분 → "1시간 30분" 또는 "30분")
 */
function formatLearningTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  date: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  dateInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  dayBadge: {
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
  },
  dayText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  insightBox: {
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
  },
  insightText: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 18,
  },
  progressBar: {
    borderRadius: SIZES.borderRadius.sm,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: SIZES.borderRadius.sm,
    height: '100%',
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.xs,
  },
  progressLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  progressPercentage: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: SIZES.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
  },
  statValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
});
