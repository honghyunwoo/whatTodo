/**
 * Day Page
 *
 * 특정 날짜의 전체 정보를 보여주는 페이지
 * - Todo 타임라인
 * - 자동 요약
 * - 한 줄 기록
 */

import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getDayData, getKoreanDayOfWeek } from '@/utils/day';
import { DayTimeline } from '@/components/day/DayTimeline';
import { DaySummaryCard } from '@/components/day/DaySummaryCard';
import { DayNoteSection } from '@/components/day/DayNoteSection';
import { useTaskStore } from '@/store/taskStore';
import { useJournalStore } from '@/store/journalStore';
import { useDiaryStore } from '@/store/diaryStore';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * 날짜 포맷팅 (YYYY-MM-DD → 1월 15일 (수))
 */
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getKoreanDayOfWeek(dateStr);

  return `${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * Day Page 메인 컴포넌트
 */
export default function DayPage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Store 구독 (변경 감지용)
  const tasks = useTaskStore((state) => state.tasks);
  const journalEntries = useJournalStore((state) => state.entries);
  const diaryEntries = useDiaryStore((state) => state.entries);

  // Day 데이터 조회 (useMemo로 캐싱)
  // Note: store subscriptions trigger re-render, dependencies trigger re-computation

  const dayData = useMemo(() => {
    if (!date) return null;
    return getDayData(date);
  }, [date, tasks, journalEntries, diaryEntries]);

  if (!date || !dayData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            날짜 정보를 찾을 수 없어요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={24} color={colors.text} />}
          onPress={() => router.back()}
        />
        <View style={styles.headerCenter}>
          <Text style={[styles.headerDate, { color: colors.text }]}>{formatDateHeader(date)}</Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>오늘</Text>
            </View>
          )}
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 자동 요약 카드 */}
        <DaySummaryCard summary={dayData.summary} />

        {/* Todo 타임라인 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘의 할 일</Text>
          </View>
          <DayTimeline todos={dayData.todos} date={date} />
        </View>

        {/* 한 줄 기록 */}
        <DayNoteSection date={date} existingNote={dayData.journalEntry?.notes} />

        {/* 일기 링크 (일기가 있다면) */}
        {dayData.diaryEntry && (
          <View style={styles.diaryLink}>
            <Ionicons name="book-outline" size={20} color={colors.text} />
            <Text style={[styles.diaryLinkText, { color: colors.text }]}>
              이 날의 일기를 작성했어요
            </Text>
            <IconButton
              icon={() => <Ionicons name="chevron-forward" size={20} color={colors.text} />}
              onPress={() => router.push(`/diary/${date}`)}
            />
          </View>
        )}

        {/* 하단 여백 */}
        <View style={{ height: SIZES.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  diaryLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  diaryLinkText: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  errorText: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.xs,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    justifyContent: 'center',
  },
  headerDate: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    gap: SIZES.spacing.sm,
    marginVertical: SIZES.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  todayBadge: {
    backgroundColor: '#EF4444',
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
});
