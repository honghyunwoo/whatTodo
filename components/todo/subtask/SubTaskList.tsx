import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/contexts/ThemeContext';
import { SIZES } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { SubTask, SubTaskFormData, SubTaskProgress as SubTaskProgressType } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';

import { SubTaskItem } from './SubTaskItem';
import { SubTaskInput } from './SubTaskInput';
import { SubTaskProgress } from './SubTaskProgress';

const MAX_SUBTASKS = 20;

interface SubTaskListProps {
  taskId: string;
  subtasks: SubTask[];
  showProgress?: boolean;
  editable?: boolean;
}

function SubTaskListComponent({
  taskId,
  subtasks,
  showProgress = true,
  editable = true,
}: SubTaskListProps) {
  const { isDark } = useTheme();
  const { addSubTask, updateSubTask, deleteSubTask, toggleSubTaskComplete, getSubTaskProgress } =
    useTaskStore();

  const progress: SubTaskProgressType = getSubTaskProgress(taskId);
  const maxReached = subtasks.length >= MAX_SUBTASKS;

  const handleAdd = useCallback(
    (title: string) => {
      const formData: SubTaskFormData = { title };
      addSubTask(taskId, formData);
    },
    [taskId, addSubTask]
  );

  const handleToggle = useCallback(
    (tId: string, subtaskId: string) => {
      toggleSubTaskComplete(tId, subtaskId);
    },
    [toggleSubTaskComplete]
  );

  const handleDelete = useCallback(
    (tId: string, subtaskId: string) => {
      deleteSubTask(tId, subtaskId);
    },
    [deleteSubTask]
  );

  const handleUpdate = useCallback(
    (tId: string, subtaskId: string, updates: Partial<SubTask>) => {
      updateSubTask(tId, subtaskId, updates);
    },
    [updateSubTask]
  );

  // Sort subtasks: incomplete first, then by order
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.order - b.order;
  });

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      {showProgress && <SubTaskProgress progress={progress} />}

      {/* Subtask list */}
      {subtasks.length > 0 && (
        <View style={styles.list}>
          {sortedSubtasks.map((subtask, index) => (
            <SubTaskItem
              key={subtask.id}
              subtask={subtask}
              taskId={taskId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              index={index}
            />
          ))}
        </View>
      )}

      {/* Empty state */}
      {subtasks.length === 0 && !editable && (
        <View style={[styles.emptyState, { backgroundColor: isDark ? '#2C2C2E' : '#F9F9FB' }]}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#A0A0A0' }]}>
            세부 항목이 없습니다
          </Text>
        </View>
      )}

      {/* Input for adding new subtasks */}
      {editable && <SubTaskInput onAdd={handleAdd} maxReached={maxReached} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.spacing.sm,
  },
  list: {
    gap: 2,
  },
  emptyState: {
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
  },
});

export const SubTaskList = memo(SubTaskListComponent);
