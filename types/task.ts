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
