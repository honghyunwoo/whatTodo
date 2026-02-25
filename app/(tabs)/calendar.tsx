/**
 * Calendar Tab (리디자인)
 *
 * Soft Brutalism + 한지 스타일:
 * - 우아한 날짜 선택 UI
 * - 인장 스타일 활동 마커
 * - 한지 색상 요약 카드
 */

import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { MonthView } from '@/components/calendar';
import { PALETTE, TYPOGRAPHY, SPACE, RADIUS, SHADOW, withOpacity } from '@/constants/design';
import { useDiaryStore } from '@/store/diaryStore';
import { useLearnStore } from '@/store/learnStore';
import { useTaskStore } from '@/store/taskStore';
import { formatDateToString } from '@/utils/day';

// 날짜 포맷 (YYYY-MM-DD → MM월 DD일)
function formatDateDisplay(dateStr: string): { month: string; day: string; weekday: string } {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return {
    month: `${month}월`,
    day: `${day}`,
    weekday: `${weekday}요일`,
  };
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(() => formatDateToString(new Date()));

  const storeTasks = useTaskStore((state) => state.tasks);
  const storeProgress = useLearnStore((state) => state.progress);
  const storeEntries = useDiaryStore((state) => state.entries);

  // Memoize to avoid new array references on each render
  const tasks = useMemo(() => storeTasks ?? [], [storeTasks]);
  const progress = useMemo(() => storeProgress ?? [], [storeProgress]);
  const entries = useMemo(() => storeEntries ?? [], [storeEntries]);

  // 활동이 있는 날짜들 (마커 표시용)
  const markedDates = useMemo(() => {
    const dates = new Set<string>();

    tasks.forEach((task) => {
      if (task.dueDate) {
        dates.add(task.dueDate);
      }

      if (task.completedAt) {
        dates.add(task.completedAt.split('T')[0]);
      }

      if (!task.dueDate && task.createdAt) {
        const createdDate = formatDateToString(new Date(task.createdAt));
        dates.add(createdDate);
      }
    });

    progress.forEach((p) => {
      if (p.lastAttempt) {
        dates.add(p.lastAttempt.split('T')[0]);
      }
    });

    entries.forEach((entry) => {
      dates.add(entry.date);
    });

    return Array.from(dates);
  }, [tasks, progress, entries]);

  // 선택된 날짜의 활동 요약
  const selectedDayData = useMemo(() => {
    const dueDateTasks = tasks.filter((task) => task.dueDate === selectedDate);

    const completedOnDate = tasks.filter(
      (task) => task.completedAt && task.completedAt.split('T')[0] === selectedDate
    );

    const dayProgress = progress.filter((p) => {
      if (!p.lastAttempt) return false;
      return p.lastAttempt.split('T')[0] === selectedDate;
    });

    const dayEntry = entries.find((e) => e.date === selectedDate);

    return {
      tasksTotal: dueDateTasks.length,
      tasksCompleted: dueDateTasks.filter((t) => t.completed).length,
      tasksCompletedOnDate: completedOnDate.length,
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
    selectedDayData.tasksCompletedOnDate > 0 ||
    selectedDayData.learnActivities > 0 ||
    selectedDayData.hasDiary;

  const dateDisplay = formatDateDisplay(selectedDate);
  const isToday = selectedDate === formatDateToString(new Date());

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 헤더 */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar-outline" size={24} color={PALETTE.seal.blue} />
          </View>
          <Text style={styles.headerTitle}>캘린더</Text>
        </Animated.View>

        {/* 월간 뷰 */}
        <MonthView
          selectedDate={selectedDate}
          markedDates={markedDates}
          onSelectDate={handleSelectDate}
        />

        {/* 선택된 날짜 요약 */}
        <View style={styles.summarySection}>
          {/* 날짜 헤더 */}
          <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.dateHeader}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateMonth}>{dateDisplay.month}</Text>
              <Text style={styles.dateDay}>{dateDisplay.day}</Text>
              <View
                style={[
                  styles.weekdayBadge,
                  {
                    backgroundColor: isToday
                      ? withOpacity(PALETTE.seal.vermilion, 0.1)
                      : PALETTE.paper.warm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    { color: isToday ? PALETTE.seal.vermilion : PALETTE.ink.medium },
                  ]}
                >
                  {isToday ? '오늘' : dateDisplay.weekday}
                </Text>
              </View>
            </View>
          </Animated.View>

          {hasActivity ? (
            <Animated.View entering={FadeInUp.delay(150).duration(300)}>
              <Pressable
                style={({ pressed }) => [
                  styles.summaryCard,
                  SHADOW.md,
                  pressed && styles.cardPressed,
                ]}
                onPress={handleGoToDay}
              >
                {/* 통계 행 */}
                <View style={styles.summaryRow}>
                  {/* 할일 */}
                  <View style={styles.summaryItem}>
                    <View
                      style={[
                        styles.summaryIconBg,
                        { backgroundColor: withOpacity(PALETTE.functional.todo, 0.1) },
                      ]}
                    >
                      <Text style={styles.summaryEmoji}>
                        {selectedDayData.tasksCompleted === selectedDayData.tasksTotal &&
                        selectedDayData.tasksTotal > 0
                          ? '✅'
                          : '📋'}
                      </Text>
                    </View>
                    <Text style={styles.summaryValue}>
                      {selectedDayData.tasksCompleted}/{selectedDayData.tasksTotal}
                    </Text>
                    <Text style={styles.summaryLabel}>할 일</Text>
                  </View>

                  {/* 구분선 */}
                  <View style={styles.divider} />

                  {/* 학습 */}
                  <View style={styles.summaryItem}>
                    <View
                      style={[
                        styles.summaryIconBg,
                        { backgroundColor: withOpacity(PALETTE.seal.blue, 0.1) },
                      ]}
                    >
                      <Text style={styles.summaryEmoji}>
                        {selectedDayData.learnActivities > 0 ? '📚' : '📖'}
                      </Text>
                    </View>
                    <Text style={styles.summaryValue}>{selectedDayData.learnActivities}</Text>
                    <Text style={styles.summaryLabel}>학습</Text>
                  </View>

                  {/* 구분선 */}
                  <View style={styles.divider} />

                  {/* 일기 */}
                  <View style={styles.summaryItem}>
                    <View
                      style={[
                        styles.summaryIconBg,
                        { backgroundColor: withOpacity(PALETTE.functional.diary, 0.1) },
                      ]}
                    >
                      <Text style={styles.summaryEmoji}>
                        {selectedDayData.hasDiary ? '📝' : '📓'}
                      </Text>
                    </View>
                    <Text style={styles.summaryValue}>
                      {selectedDayData.hasDiary ? '작성' : '-'}
                    </Text>
                    <Text style={styles.summaryLabel}>일기</Text>
                  </View>
                </View>

                {/* 상세 보기 버튼 */}
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailText}>상세 보기</Text>
                  <View style={styles.viewDetailArrow}>
                    <Ionicons name="arrow-forward" size={16} color={PALETTE.seal.blue} />
                  </View>
                </View>

                {selectedDayData.tasksCompletedOnDate > 0 && (
                  <View style={styles.completedInfoRow}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color={PALETTE.functional.todo}
                    />
                    <Text style={styles.completedInfoText}>
                      이 날짜에 완료 처리 {selectedDayData.tasksCompletedOnDate}개
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(150).duration(300)}
              style={[styles.emptyCard, SHADOW.sm]}
            >
              {/* 장식 원 */}
              <View style={styles.emptyIconWrapper}>
                <Text style={styles.emptyEmoji}>🌙</Text>
              </View>

              <Text style={styles.emptyTitle}>이 날의 기록이 없습니다</Text>
              <Text style={styles.emptySubtitle}>새로운 기록을 시작해보세요</Text>

              <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                onPress={handleGoToDay}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>기록 추가하기</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.paper.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACE.xxxl,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: withOpacity(PALETTE.seal.blue, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.ink.black,
    letterSpacing: -0.3,
  },

  // 요약 섹션
  summarySection: {
    marginTop: SPACE.lg,
    paddingHorizontal: SPACE.md,
  },

  // 날짜 헤더
  dateHeader: {
    marginBottom: SPACE.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACE.xs,
  },
  dateMonth: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.medium,
  },
  dateDay: {
    fontSize: TYPOGRAPHY.size.hero,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: PALETTE.ink.black,
    letterSpacing: -1,
  },
  weekdayBadge: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xxs,
    borderRadius: RADIUS.full,
    marginLeft: SPACE.sm,
  },
  weekdayText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },

  // 요약 카드
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACE.lg,
    borderWidth: 1,
    borderColor: PALETTE.paper.aged,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
  },
  summaryEmoji: {
    fontSize: 24,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.ink.black,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: PALETTE.ink.medium,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: PALETTE.paper.aged,
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACE.lg,
    paddingTop: SPACE.md,
    borderTopWidth: 1,
    borderTopColor: PALETTE.paper.aged,
    gap: SPACE.xs,
  },
  viewDetailText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: PALETTE.seal.blue,
  },
  viewDetailArrow: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: withOpacity(PALETTE.seal.blue, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedInfoRow: {
    alignItems: 'center',
    borderTopColor: PALETTE.paper.aged,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: SPACE.xs,
    justifyContent: 'center',
    marginTop: SPACE.sm,
    paddingTop: SPACE.sm,
  },
  completedInfoText: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },

  // 빈 상태
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACE.xl,
    paddingVertical: SPACE.xxl,
    borderWidth: 1,
    borderColor: PALETTE.paper.aged,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: withOpacity(PALETTE.seal.gold, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.lg,
    borderWidth: 2,
    borderColor: withOpacity(PALETTE.seal.gold, 0.2),
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.ink.black,
    marginBottom: SPACE.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.size.md,
    color: PALETTE.ink.medium,
    marginBottom: SPACE.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.seal.blue,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.sm,
    gap: SPACE.xs,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
});
