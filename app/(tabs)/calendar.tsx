/**
 * Calendar Tab
 * 월별 캘린더 화면 - 날짜별 활동 마커 표시
 */

import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { MonthView } from '@/components/calendar';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useDiaryStore } from '@/store/diaryStore';
import { useLearnStore } from '@/store/learnStore';
import { useTaskStore } from '@/store/taskStore';
import { formatDateToString } from '@/utils/day';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(() => formatDateToString(new Date()));

  const tasks = useTaskStore((state) => state.tasks) ?? [];
  const progress = useLearnStore((state) => state.progress) ?? [];
  const entries = useDiaryStore((state) => state.entries) ?? [];

  // 활동이 있는 날짜들 (마커 표시용)
  const markedDates = useMemo(() => {
    const dates = new Set<string>();

    // Todo가 있는 날짜
    tasks.forEach((task) => {
      if (task.createdAt) {
        const date = formatDateToString(new Date(task.createdAt));
        dates.add(date);
      }
    });

    // 학습 진행이 있는 날짜
    progress.forEach((p) => {
      if (p.lastAttempt) {
        dates.add(p.lastAttempt.split('T')[0]); // ISO date에서 날짜만 추출
      }
    });

    // 일기가 있는 날짜
    entries.forEach((entry) => {
      dates.add(entry.date);
    });

    return Array.from(dates);
  }, [tasks, progress, entries]);

  // 선택된 날짜의 활동 요약
  const selectedDayData = useMemo(() => {
    const dayTasks = tasks.filter((task) => {
      if (!task.createdAt) return false;
      return formatDateToString(new Date(task.createdAt)) === selectedDate;
    });

    const dayProgress = progress.filter((p) => {
      if (!p.lastAttempt) return false;
      return p.lastAttempt.split('T')[0] === selectedDate;
    });

    const dayEntry = entries.find((e) => e.date === selectedDate);

    return {
      tasksTotal: dayTasks.length,
      tasksCompleted: dayTasks.filter((t) => t.completed).length,
      learnActivities: dayProgress.length,
      hasDiary: !!dayEntry,
    };
  }, [selectedDate, tasks, progress, entries]);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleGoToDay = useCallback(() => {
    router.push({
      pathname: '/day/[date]',
      params: { date: selectedDate },
    });
  }, [selectedDate]);

  const hasActivity =
    selectedDayData.tasksTotal > 0 ||
    selectedDayData.learnActivities > 0 ||
    selectedDayData.hasDiary;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <MonthView
          selectedDate={selectedDate}
          markedDates={markedDates}
          onSelectDate={handleSelectDate}
        />

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{selectedDate}</Text>

          {hasActivity ? (
            <TouchableOpacity style={styles.summaryCard} onPress={handleGoToDay}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>
                    {selectedDayData.tasksCompleted === selectedDayData.tasksTotal &&
                    selectedDayData.tasksTotal > 0
                      ? '✅'
                      : '📋'}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {selectedDayData.tasksCompleted}/{selectedDayData.tasksTotal}
                  </Text>
                  <Text style={styles.summaryLabel}>할 일</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>
                    {selectedDayData.learnActivities > 0 ? '📚' : '📖'}
                  </Text>
                  <Text style={styles.summaryValue}>{selectedDayData.learnActivities}</Text>
                  <Text style={styles.summaryLabel}>학습</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>{selectedDayData.hasDiary ? '📝' : '📓'}</Text>
                  <Text style={styles.summaryValue}>{selectedDayData.hasDiary ? '작성' : '-'}</Text>
                  <Text style={styles.summaryLabel}>일기</Text>
                </View>
              </View>

              <View style={styles.viewDetailRow}>
                <Text style={styles.viewDetailText}>상세 보기</Text>
                <Text style={styles.viewDetailArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🌙</Text>
              <Text style={styles.emptyText}>이 날의 기록이 없습니다</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleGoToDay}>
                <Text style={styles.addButtonText}>기록 추가하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.lg,
    marginTop: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.xl,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SIZES.spacing.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.xl,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  summaryEmoji: {
    fontSize: 24,
    marginBottom: SIZES.spacing.xs,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summarySection: {
    marginTop: SIZES.spacing.sm,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  viewDetailArrow: {
    color: COLORS.primary,
    fontSize: 20,
  },
  viewDetailRow: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
  },
  viewDetailText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginRight: SIZES.spacing.xs,
  },
});
