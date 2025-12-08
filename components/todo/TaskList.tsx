import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';

import { TaskItem } from './TaskItem';

interface TaskListProps {
  onTaskPress?: (task: Task) => void;
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>할 일이 없어요</Text>
      <Text style={styles.emptySubtitle}>+ 버튼을 눌러 새 할 일을 추가하세요</Text>
    </View>
  );
}

export function TaskList({ onTaskPress }: TaskListProps) {
  const tasks = useTaskStore((state) => state.getFilteredTasks());

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => <TaskItem task={item} onPress={onTaskPress} />,
    [onTaskPress]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.spacing.md,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: SIZES.spacing.sm,
  },
});
