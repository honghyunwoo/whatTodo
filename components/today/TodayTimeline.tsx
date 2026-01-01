/**
 * TodayTimeline - 오늘의 타임라인 (리디자인)
 *
 * Soft Brutalism + 한지 스타일:
 * - 우아한 섹션 헤더
 * - 인장 스타일 통계 배지
 * - 부드러운 빈 상태 디자인
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { PALETTE, TYPOGRAPHY, SPACE, RADIUS, SHADOW, withOpacity } from '@/constants/design';
import { useTaskStore } from '@/store/taskStore';
import { useDiaryStore } from '@/store/diaryStore';

import { EntryCard, TimelineEntry } from './EntryCard';

// 오늘 날짜 문자열
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 시간 포맷
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

export function TodayTimeline() {
  // Store
  const tasks = useTaskStore((state) => state.tasks);
  const diaryEntries = useDiaryStore((state) => state.entries);

  // 오늘 날짜
  const today = getTodayString();

  // 오늘의 타임라인 항목들
  const timelineEntries = useMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];

    // 오늘 할일 추가
    tasks
      .filter((task) => task.dueDate === today)
      .forEach((task) => {
        entries.push({
          type: 'todo',
          data: task,
          time: formatTime(task.createdAt),
        });
      });

    // 오늘 완료된 할일도 추가 (완료 시간 기준)
    tasks
      .filter(
        (task) =>
          task.completed &&
          task.completedAt &&
          task.completedAt.startsWith(today) &&
          task.dueDate !== today // 이미 위에서 추가된 것 제외
      )
      .forEach((task) => {
        entries.push({
          type: 'todo',
          data: task,
          time: formatTime(task.completedAt!),
        });
      });

    // 오늘 일기/메모 추가
    diaryEntries
      .filter((entry) => entry.date === today)
      .forEach((entry) => {
        const isMemo = entry.tags?.includes('메모');
        entries.push({
          type: isMemo ? 'memo' : 'diary',
          data: entry,
          time: formatTime(entry.createdAt),
        });
      });

    // 시간순 정렬 (최신이 위)
    entries.sort((a, b) => {
      const timeA =
        a.type === 'todo'
          ? new Date(a.data.completedAt || a.data.createdAt).getTime()
          : new Date(a.data.createdAt).getTime();
      const timeB =
        b.type === 'todo'
          ? new Date(b.data.completedAt || b.data.createdAt).getTime()
          : new Date(b.data.createdAt).getTime();
      return timeB - timeA; // 최신이 위
    });

    return entries;
  }, [tasks, diaryEntries, today]);

  // 통계
  const stats = useMemo(() => {
    const todos = timelineEntries.filter((e) => e.type === 'todo');
    const completedTodos = todos.filter((e) => e.type === 'todo' && e.data.completed).length;
    const memos = timelineEntries.filter((e) => e.type === 'memo').length;
    const diaries = timelineEntries.filter((e) => e.type === 'diary').length;

    return {
      total: timelineEntries.length,
      todos: todos.length,
      completedTodos,
      memos,
      diaries,
    };
  }, [timelineEntries]);

  // 빈 상태
  if (timelineEntries.length === 0) {
    return (
      <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyContainer}>
        <View style={[styles.emptyCard, SHADOW.md]}>
          {/* 장식 원 */}
          <View style={styles.emptyIconWrapper}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="sunny-outline" size={36} color={PALETTE.seal.gold} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>오늘의 기록이 없어요</Text>
          <Text style={styles.emptySubtitle}>위에서 메모, 할일, 또는 일기를 추가해보세요</Text>

          {/* 힌트 아이콘들 */}
          <View style={styles.emptyHints}>
            <View
              style={[
                styles.hintBadge,
                { backgroundColor: withOpacity(PALETTE.functional.memo, 0.1) },
              ]}
            >
              <Text style={styles.hintEmoji}>📝</Text>
              <Text style={[styles.hintText, { color: PALETTE.functional.memo }]}>메모</Text>
            </View>
            <View
              style={[
                styles.hintBadge,
                { backgroundColor: withOpacity(PALETTE.functional.todo, 0.1) },
              ]}
            >
              <Text style={styles.hintEmoji}>✓</Text>
              <Text style={[styles.hintText, { color: PALETTE.functional.todo }]}>할일</Text>
            </View>
            <View
              style={[
                styles.hintBadge,
                { backgroundColor: withOpacity(PALETTE.functional.diary, 0.1) },
              ]}
            >
              <Text style={styles.hintEmoji}>📖</Text>
              <Text style={[styles.hintText, { color: PALETTE.functional.diary }]}>일기</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 섹션 헤더 */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="time-outline" size={18} color={PALETTE.ink.medium} />
          </View>
          <Text style={styles.headerTitle}>오늘의 기록</Text>
        </View>

        {/* 통계 배지들 */}
        <View style={styles.headerStats}>
          {stats.todos > 0 && (
            <View
              style={[
                styles.statBadge,
                { backgroundColor: withOpacity(PALETTE.functional.todo, 0.1) },
              ]}
            >
              <Text style={[styles.statNumber, { color: PALETTE.functional.todo }]}>
                {stats.completedTodos}/{stats.todos}
              </Text>
            </View>
          )}
          {stats.memos > 0 && (
            <View
              style={[
                styles.statBadge,
                { backgroundColor: withOpacity(PALETTE.functional.memo, 0.1) },
              ]}
            >
              <Text style={[styles.statNumber, { color: PALETTE.functional.memo }]}>
                {stats.memos}
              </Text>
            </View>
          )}
          {stats.diaries > 0 && (
            <View
              style={[
                styles.statBadge,
                { backgroundColor: withOpacity(PALETTE.functional.diary, 0.1) },
              ]}
            >
              <Text style={[styles.statNumber, { color: PALETTE.functional.diary }]}>
                {stats.diaries}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* 타임라인 */}
      <View style={styles.timeline}>
        {timelineEntries.map((entry, index) => (
          <EntryCard
            key={entry.type === 'todo' ? `todo-${entry.data.id}` : `diary-${entry.data.id}`}
            entry={entry}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACE.md,
    marginTop: SPACE.lg,
    marginBottom: SPACE.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE.lg,
    paddingHorizontal: SPACE.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.paper.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.ink.black,
    letterSpacing: -0.3,
  },
  headerStats: {
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  statBadge: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xxs,
    borderRadius: RADIUS.full,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  timeline: {
    gap: SPACE.xs,
  },
  emptyContainer: {
    marginHorizontal: SPACE.md,
    marginTop: SPACE.xl,
  },
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
    marginBottom: SPACE.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: withOpacity(PALETTE.seal.gold, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: withOpacity(PALETTE.seal.gold, 0.2),
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.ink.black,
    marginBottom: SPACE.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.size.md,
    color: PALETTE.ink.medium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACE.lg,
  },
  emptyHints: {
    flexDirection: 'row',
    gap: SPACE.sm,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.lg,
    gap: SPACE.xs,
  },
  hintEmoji: {
    fontSize: 14,
  },
  hintText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default TodayTimeline;
