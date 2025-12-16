import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { Task, SmartListType } from '@/types/task';
import { EmptyState } from '@/components/common';

import { TaskItem } from './TaskItem';

// 스마트 리스트별 빈 상태 메시지
const EMPTY_MESSAGES: Record<SmartListType, { title: string; description: string }> = {
  today: {
    title: '오늘 할 일이 없어요',
    description: '오늘 마감인 할 일을 추가해보세요',
  },
  upcoming: {
    title: '예정된 할 일이 없어요',
    description: '미래 날짜로 할 일을 추가해보세요',
  },
  anytime: {
    title: '언제든 할 일이 없어요',
    description: '마감 없는 할 일을 추가해보세요',
  },
  completed: {
    title: '완료된 할 일이 없어요',
    description: '할 일을 완료하면 여기에 표시됩니다',
  },
  all: {
    title: '할 일이 없어요',
    description: '+ 버튼을 눌러 새 할 일을 추가하세요',
  },
};

interface TaskListProps {
  onTaskPress?: (task: Task) => void;
}

export function TaskList({ onTaskPress }: TaskListProps) {
  const smartList = useTaskStore((state) => state.smartList);
  const getSmartListTasks = useTaskStore((state) => state.getSmartListTasks);

  // 스마트 리스트에서 태스크 가져오기
  const tasks = getSmartListTasks();

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item, index }) => <TaskItem task={item} onPress={onTaskPress} index={index} />,
    [onTaskPress]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const emptyMessage = EMPTY_MESSAGES[smartList];

  if (tasks.length === 0) {
    return (
      <EmptyState type="tasks" title={emptyMessage.title} description={emptyMessage.description} />
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
