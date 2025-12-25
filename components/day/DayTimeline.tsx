/**
 * Day Timeline 컴포넌트
 *
 * 특정 날짜의 Todo를 시간 순서대로 표시
 * 완료된 것과 미완료된 것을 구분하여 표시
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { Task } from '@/types/task';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

interface DayTimelineProps {
  /** 해당 날짜의 Todo 리스트 */
  todos: Task[];
  /** 날짜 문자열 (YYYY-MM-DD) */
  date: string;
}

/**
 * 시간 포맷팅 (HH:mm → 오전/오후 h:mm)
 */
function formatTime(time?: string): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 완료 시간 포맷팅 (ISO 문자열 → 시간만)
 */
function formatCompletedTime(completedAt?: string): string {
  if (!completedAt) return '';

  const date = new Date(completedAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Todo 아이템 (타임라인용)
 */
function TodoTimelineItem({ todo, onPress }: { todo: Task; onPress: () => void }) {
  const { colors, isDark } = useTheme();

  const priorityColors = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#6B7280',
  };

  const priorityLabels = {
    urgent: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  return (
    <Pressable
      style={[
        styles.todoItem,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        todo.completed && styles.todoCompleted,
      ]}
      onPress={onPress}
    >
      {/* 왼쪽: 시간 & 체크 아이콘 */}
      <View style={styles.todoLeft}>
        {todo.dueTime && (
          <Text style={[styles.todoTime, { color: colors.textSecondary }]}>
            {formatTime(todo.dueTime)}
          </Text>
        )}
        <View
          style={[
            styles.checkIcon,
            {
              backgroundColor: todo.completed ? COLORS.primary : 'transparent',
              borderColor: todo.completed ? COLORS.primary : colors.border,
            },
          ]}
        >
          {todo.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </View>

      {/* 중앙: Todo 내용 */}
      <View style={styles.todoContent}>
        <Text
          style={[
            styles.todoTitle,
            { color: colors.text },
            todo.completed && styles.todoTitleCompleted,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>

        <View style={styles.todoMeta}>
          {/* 우선순위 */}
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[todo.priority] }]}>
            <Text style={styles.priorityText}>{priorityLabels[todo.priority]}</Text>
          </View>

          {/* 완료 시간 */}
          {todo.completed && todo.completedAt && (
            <Text style={[styles.completedTime, { color: colors.textSecondary }]}>
              {formatCompletedTime(todo.completedAt)} 완료
            </Text>
          )}

          {/* 서브태스크 */}
          {todo.subtasks && todo.subtasks.length > 0 && (
            <Text style={[styles.subtaskCount, { color: colors.textSecondary }]}>
              {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
            </Text>
          )}
        </View>
      </View>

      {/* 오른쪽: 화살표 */}
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

/**
 * Day Timeline 메인 컴포넌트
 */
export function DayTimeline({ todos, date }: DayTimelineProps) {
  const { colors } = useTheme();
  const router = useRouter();

  // 완료된 Todo (completedAt 순서로 정렬)
  const completedTodos = todos
    .filter((t) => t.completed && t.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

  // 미완료 Todo (dueTime 있으면 시간순, 없으면 생성순)
  const incompleteTodos = todos
    .filter((t) => !t.completed)
    .sort((a, b) => {
      // dueTime이 둘 다 있으면 시간순
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      // dueTime 있는 것 우선
      if (a.dueTime) return -1;
      if (b.dueTime) return 1;
      // 둘 다 없으면 생성순
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const handleTodoPress = (todoId: string) => {
    router.push(`/task/${todoId}`);
  };

  // Todo가 없는 경우
  if (todos.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          이 날짜에 할 일이 없어요
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 완료된 Todo */}
      {completedTodos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              완료 ({completedTodos.length})
            </Text>
          </View>
          {completedTodos.map((todo) => (
            <TodoTimelineItem key={todo.id} todo={todo} onPress={() => handleTodoPress(todo.id)} />
          ))}
        </View>
      )}

      {/* 미완료 Todo */}
      {incompleteTodos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              미완료 ({incompleteTodos.length})
            </Text>
          </View>
          {incompleteTodos.map((todo) => (
            <TodoTimelineItem key={todo.id} todo={todo} onPress={() => handleTodoPress(todo.id)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  checkIcon: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  completedTime: {
    fontSize: SIZES.fontSize.xs,
    marginLeft: SIZES.spacing.xs,
  },
  container: {
    gap: SIZES.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xl * 2,
  },
  emptyText: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
  },
  priorityBadge: {
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: 2,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  section: {
    gap: SIZES.spacing.xs,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  subtaskCount: {
    fontSize: SIZES.fontSize.xs,
    marginLeft: SIZES.spacing.xs,
  },
  todoCompleted: {
    opacity: 0.6,
  },
  todoContent: {
    flex: 1,
    gap: SIZES.spacing.xs,
  },
  todoItem: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  todoLeft: {
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    minWidth: 60,
  },
  todoMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  todoTime: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  todoTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
  },
});
