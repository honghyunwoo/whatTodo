/**
 * TodayExecutionCard
 *
 * Today 상단 실행 고정 카드:
 * - 오늘 dueDate 기준 Top3
 * - Next1 즉시 진입
 * - 1탭 완료/해제
 */

import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { PALETTE, RADIUS, SHADOW, SPACE, TYPOGRAPHY, withOpacity } from '@/constants/design';
import { useTaskStore } from '@/store/taskStore';
import { formatDateToString } from '@/utils/day';
import type { Task, TaskPriority } from '@/types/task';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음',
};

function sortTodayTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
    if (a.dueTime) return -1;
    if (b.dueTime) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function TodayExecutionCard() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);

  const today = formatDateToString(new Date());

  const todayTasks = useMemo(() => tasks.filter((task) => task.dueDate === today), [tasks, today]);

  const top3 = useMemo(
    () => sortTodayTasks(todayTasks.filter((task) => !task.completed)).slice(0, 3),
    [todayTasks]
  );

  const next1 = top3[0];
  const completedCount = todayTasks.filter((task) => task.completed).length;

  const handleOpenTask = useCallback(
    (taskId: string) => {
      router.push(`/task/${taskId}`);
    },
    [router]
  );

  const handleToggleTask = useCallback(
    (taskId: string) => {
      toggleComplete(taskId);
    },
    [toggleComplete]
  );

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(280)} style={styles.container}>
      <View style={[styles.card, SHADOW.md]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="flash-outline" size={18} color={PALETTE.functional.todo} />
            </View>
            <View>
              <Text style={styles.title}>오늘의 실행</Text>
              <Text style={styles.helper}>딱 3개만, 지금 1개부터</Text>
            </View>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {completedCount}/{todayTasks.length || 0}
            </Text>
          </View>
        </View>

        {top3.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              오늘 마감 할 일이 없어요. 한 줄 입력에서 추가해보세요
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {top3.map((task) => (
              <Pressable
                key={task.id}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => handleOpenTask(task.id)}
              >
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    handleToggleTask(task.id);
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={task.completed ? '할 일 미완료로 변경' : '할 일 완료로 변경'}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.completed && styles.checkboxDone,
                      task.completed && { borderColor: PALETTE.functional.todo },
                    ]}
                  >
                    {task.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </Pressable>

                <View style={styles.rowMain}>
                  <Text
                    style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Text style={styles.priorityText}>{PRIORITY_LABEL[task.priority]}</Text>
                    {task.dueTime ? <Text style={styles.timeText}>{task.dueTime}</Text> : null}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={PALETTE.ink.light} />
              </Pressable>
            ))}
          </View>
        )}

        {next1 ? (
          <View style={styles.next1Box}>
            <View style={styles.next1TextBox}>
              <Text style={styles.next1Label}>Next1</Text>
              <Text style={styles.next1Title} numberOfLines={1}>
                {next1.title}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.next1Button, pressed && styles.buttonPressed]}
              onPress={() => handleOpenTask(next1.id)}
            >
              <Text style={styles.next1ButtonText}>지금 시작</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACE.md,
    marginTop: SPACE.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: PALETTE.paper.aged,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACE.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.md,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: SPACE.sm,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: withOpacity(PALETTE.functional.todo, 0.12),
    borderRadius: RADIUS.md,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  title: {
    color: PALETTE.ink.black,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  helper: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: PALETTE.paper.warm,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xxs,
  },
  countText: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  emptyState: {
    backgroundColor: PALETTE.paper.cream,
    borderRadius: RADIUS.lg,
    marginBottom: SPACE.md,
    padding: SPACE.md,
  },
  emptyText: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: 20,
  },
  list: {
    gap: SPACE.xs,
  },
  row: {
    alignItems: 'center',
    backgroundColor: PALETTE.paper.cream,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    gap: SPACE.sm,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
  },
  rowPressed: {
    opacity: 0.82,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: PALETTE.paper.aged,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxDone: {
    backgroundColor: PALETTE.functional.todo,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    color: PALETTE.ink.black,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  taskTitleDone: {
    color: PALETTE.ink.light,
    textDecorationLine: 'line-through',
  },
  rowMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  priorityText: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  timeText: {
    color: PALETTE.ink.light,
    fontSize: TYPOGRAPHY.size.xs,
  },
  next1Box: {
    alignItems: 'center',
    borderTopColor: PALETTE.paper.aged,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: SPACE.sm,
    marginTop: SPACE.md,
    paddingTop: SPACE.md,
  },
  next1TextBox: {
    flex: 1,
    minWidth: 0,
  },
  next1Label: {
    color: PALETTE.ink.medium,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  next1Title: {
    color: PALETTE.ink.black,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: 2,
  },
  next1Button: {
    alignItems: 'center',
    backgroundColor: PALETTE.functional.todo,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 96,
    paddingHorizontal: SPACE.md,
  },
  next1ButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default TodayExecutionCard;
