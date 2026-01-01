/**
 * TodayTimeline - 오늘의 타임라인
 *
 * 메모/할일/일기를 시간순으로 통합 표시
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors, isDark } = useTheme();

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
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Ionicons name="today-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>오늘의 기록이 없어요</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            위에서 메모, 할일, 또는 일기를 추가해보세요
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 섹션 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>오늘의 기록</Text>
        <View style={styles.headerStats}>
          {stats.todos > 0 && (
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              할일 {stats.completedTodos}/{stats.todos}
            </Text>
          )}
          {stats.memos > 0 && (
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              메모 {stats.memos}
            </Text>
          )}
          {stats.diaries > 0 && (
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              일기 {stats.diaries}
            </Text>
          )}
        </View>
      </View>

      {/* 타임라인 */}
      <View style={styles.timeline}>
        {timelineEntries.map((entry, index) => (
          <EntryCard
            key={entry.type === 'todo' ? `todo-${entry.data.id}` : `diary-${entry.data.id}`}
            entry={entry}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  headerStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  statText: {
    fontSize: SIZES.fontSize.xs,
  },
  timeline: {
    gap: SIZES.spacing.sm,
  },
  emptyContainer: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.xl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SIZES.spacing.xl * 2,
    borderRadius: SIZES.borderRadius.lg,
  },
  emptyTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    marginTop: SIZES.spacing.md,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'center',
    marginTop: SIZES.spacing.xs,
  },
});

export default TodayTimeline;
