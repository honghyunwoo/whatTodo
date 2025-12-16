export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
  estimatedTime?: number; // 분 단위
  tags?: string[];
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'today' | 'week' | 'completed';

/**
 * 스마트 리스트 타입
 * - all: 전체 할 일
 * - today: 오늘 마감
 * - upcoming: 예정 (내일 이후)
 * - anytime: 언제든 (마감 없음)
 * - completed: 완료됨
 */
export type SmartListType = 'all' | 'today' | 'upcoming' | 'anytime' | 'completed';

export interface SmartListConfig {
  id: SmartListType;
  name: string;
  icon: string;
  color: string;
}

export type TaskSort = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFormData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  estimatedTime?: number;
  tags?: string[];
}
