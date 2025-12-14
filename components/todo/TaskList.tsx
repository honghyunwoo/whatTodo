import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';
import { EmptyState } from '@/components/common';

import { TaskItem } from './TaskItem';

interface TaskListProps {
  onTaskPress?: (task: Task) => void;
}

export function TaskList({ onTaskPress }: TaskListProps) {
  // 개별 상태를 분리해서 가져오기 (참조 안정성 확보)
  const allTasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);
  const sortBy = useTaskStore((state) => state.sortBy);

  // useMemo로 필터링 결과 캐싱 (무한 렌더링 방지)
  const tasks = useMemo(() => {
    let filtered = [...allTasks];

    // 필터링
    if (filter !== 'all') {
      filtered = filtered.filter((task) =>
        filter === 'completed' ? task.completed : !task.completed
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [allTasks, filter, sortBy]);

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item, index }) => <TaskItem task={item} onPress={onTaskPress} index={index} />,
    [onTaskPress]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (tasks.length === 0) {
    return (
      <EmptyState
        type="tasks"
        title="할 일이 없어요"
        description="+ 버튼을 눌러 새 할 일을 추가하세요"
      />
    );
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
  listContent: {
    paddingVertical: SIZES.spacing.sm,
  },
});
