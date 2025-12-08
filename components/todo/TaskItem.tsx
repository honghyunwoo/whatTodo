import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, IconButton, Surface, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskPriority } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onPress?: (task: Task) => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: COLORS.priority.low,
  medium: COLORS.priority.medium,
  high: COLORS.priority.high,
  urgent: COLORS.priority.urgent,
};

function TaskItemComponent({ task, onPress }: TaskItemProps) {
  const { toggleComplete, deleteTask } = useTaskStore();

  const handleToggle = useCallback(() => {
    toggleComplete(task.id);
  }, [task.id, toggleComplete]);

  const handleDelete = useCallback(() => {
    deleteTask(task.id);
  }, [task.id, deleteTask]);

  const handlePress = useCallback(() => {
    onPress?.(task);
  }, [task, onPress]);

  return (
    <Surface style={styles.container} elevation={1}>
      <View
        style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
      />

      <Checkbox.Android
        status={task.completed ? 'checked' : 'unchecked'}
        onPress={handleToggle}
        color={COLORS.primary}
      />

      <View style={styles.content} onTouchEnd={handlePress}>
        <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        {task.dueDate && (
          <Text style={styles.dueDate}>{new Date(task.dueDate).toLocaleDateString('ko-KR')}</Text>
        )}
      </View>

      <IconButton
        icon="delete-outline"
        size={SIZES.icon.md}
        onPress={handleDelete}
        iconColor={COLORS.textSecondary}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  completedText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.xs,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
  },
  dueDate: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: SIZES.spacing.xs,
  },
  priorityIndicator: {
    height: '100%',
    width: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
  },
});

export const TaskItem = memo(TaskItemComponent);
