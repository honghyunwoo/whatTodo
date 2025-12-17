import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  Task,
  TaskFilter,
  TaskFormData,
  TaskSort,
  SmartListType,
  SubTask,
  SubTaskFormData,
  SubTaskProgress,
} from '@/types/task';
import { generateId } from '@/utils/id';
import { useRewardStore } from './rewardStore';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  sortBy: TaskSort;
  smartList: SmartListType;
}

interface TaskActions {
  // 기본 태스크 액션
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  setSortBy: (sortBy: TaskSort) => void;
  setSmartList: (smartList: SmartListType) => void;
  getFilteredTasks: () => Task[];
  getCompletionRate: () => number;
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getAnytimeTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getSmartListTasks: () => Task[];
  getSmartListCount: (listType: SmartListType) => number;
  getTaskById: (id: string) => Task | undefined;

  // 서브태스크 액션
  addSubTask: (taskId: string, subtask: SubTaskFormData) => void;
  updateSubTask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;
  toggleSubTaskComplete: (taskId: string, subtaskId: string) => void;
  reorderSubTasks: (taskId: string, fromIndex: number, toIndex: number) => void;
  getSubTaskProgress: (taskId: string) => SubTaskProgress;
}

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

const INITIAL_TASK_STATE: TaskState = {
  tasks: [],
  filter: 'all',
  sortBy: 'createdAt',
  smartList: 'today',
};

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_TASK_STATE,

      addTask: (data) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...data,
          id: generateId(),
          completed: false,
          subtasks: [], // 기본값
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleComplete: (id) => {
        const now = new Date().toISOString();
        const { tasks } = get();
        const task = tasks.find((t) => t.id === id);

        if (!task) return;

        const wasCompleted = task.completed;
        const willBeCompleted = !wasCompleted;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: willBeCompleted,
                  completedAt: willBeCompleted ? now : undefined,
                  updatedAt: now,
                }
              : t
          ),
        }));

        // Award stars when completing a task (not when uncompleting)
        if (willBeCompleted) {
          useRewardStore.getState().earnStars(0, task.priority);
        }
      },

      setFilter: (filter) => set({ filter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSmartList: (smartList) => set({ smartList }),

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getFilteredTasks: () => {
        const { tasks, filter, sortBy } = get();
        let filtered = [...tasks];

        // 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
          case 'today':
            filtered = filtered.filter((t) => {
              if (!t.dueDate) return false;
              const dueDate = new Date(t.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() === today.getTime();
            });
            break;
          case 'week': {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            filtered = filtered.filter((t) => {
              if (!t.dueDate) return false;
              const dueDate = new Date(t.dueDate);
              return dueDate >= today && dueDate <= weekEnd;
            });
            break;
          }
          case 'completed':
            filtered = filtered.filter((t) => t.completed);
            break;
        }

        // 정렬
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'priority':
              return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            case 'dueDate':
              if (!a.dueDate && !b.dueDate) return 0;
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            case 'title':
              return a.title.localeCompare(b.title);
            case 'createdAt':
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        });

        return filtered;
      },

      getCompletionRate: () => {
        const { tasks } = get();
        if (tasks.length === 0) return 0;
        const completed = tasks.filter((t) => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
      },

      getTodayTasks: () => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tasks.filter((t) => {
          if (t.completed) return false;
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      },

      getUpcomingTasks: () => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tasks.filter((t) => {
          if (t.completed) return false;
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() >= tomorrow.getTime();
        });
      },

      getAnytimeTasks: () => {
        const { tasks } = get();
        return tasks.filter((t) => !t.completed && !t.dueDate);
      },

      getCompletedTasks: () => {
        const { tasks } = get();
        return tasks.filter((t) => t.completed);
      },

      getSmartListTasks: () => {
        const { smartList, tasks, sortBy } = get();
        let filtered: Task[];

        switch (smartList) {
          case 'today':
            filtered = get().getTodayTasks();
            break;
          case 'upcoming':
            filtered = get().getUpcomingTasks();
            break;
          case 'anytime':
            filtered = get().getAnytimeTasks();
            break;
          case 'completed':
            filtered = get().getCompletedTasks();
            break;
          case 'all':
          default:
            filtered = tasks.filter((t) => !t.completed);
            break;
        }

        // 정렬
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'priority': {
              const order = { urgent: 0, high: 1, medium: 2, low: 3 };
              return order[a.priority] - order[b.priority];
            }
            case 'dueDate':
              if (!a.dueDate && !b.dueDate) return 0;
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            case 'title':
              return a.title.localeCompare(b.title);
            case 'createdAt':
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        });

        return filtered;
      },

      getSmartListCount: (listType: SmartListType) => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (listType) {
          case 'today':
            return tasks.filter((t) => {
              if (t.completed || !t.dueDate) return false;
              const dueDate = new Date(t.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() === today.getTime();
            }).length;
          case 'upcoming':
            return tasks.filter((t) => {
              if (t.completed || !t.dueDate) return false;
              const dueDate = new Date(t.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() >= tomorrow.getTime();
            }).length;
          case 'anytime':
            return tasks.filter((t) => !t.completed && !t.dueDate).length;
          case 'completed':
            return tasks.filter((t) => t.completed).length;
          case 'all':
          default:
            return tasks.filter((t) => !t.completed).length;
        }
      },

      // ========================================
      // 서브태스크 액션
      // ========================================

      addSubTask: (taskId, subtaskData) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            // 최대 20개 제한
            if ((task.subtasks?.length || 0) >= 20) {
              return task;
            }

            const newSubTask: SubTask = {
              id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: subtaskData.title,
              completed: false,
              createdAt: new Date().toISOString(),
              order: task.subtasks?.length || 0,
            };

            return {
              ...task,
              subtasks: [...(task.subtasks || []), newSubTask],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateSubTask: (taskId, subtaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            return {
              ...task,
              subtasks: (task.subtasks || []).map((st) =>
                st.id === subtaskId ? { ...st, ...updates } : st
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      deleteSubTask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            return {
              ...task,
              subtasks: (task.subtasks || [])
                .filter((st) => st.id !== subtaskId)
                .map((st, index) => ({ ...st, order: index })), // 순서 재정렬
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      toggleSubTaskComplete: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            return {
              ...task,
              subtasks: (task.subtasks || []).map((st) => {
                if (st.id !== subtaskId) return st;

                return {
                  ...st,
                  completed: !st.completed,
                  completedAt: !st.completed ? new Date().toISOString() : undefined,
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      reorderSubTasks: (taskId, fromIndex, toIndex) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const subtasks = [...(task.subtasks || [])];
            const [moved] = subtasks.splice(fromIndex, 1);
            subtasks.splice(toIndex, 0, moved);

            return {
              ...task,
              subtasks: subtasks.map((st, index) => ({ ...st, order: index })),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      getSubTaskProgress: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || !task.subtasks || task.subtasks.length === 0) {
          return { total: 0, completed: 0, percentage: 0 };
        }

        const total = task.subtasks.length;
        const completed = task.subtasks.filter((st) => st.completed).length;
        const percentage = Math.round((completed / total) * 100);

        return { total, completed, percentage };
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState) => ({
        ...INITIAL_TASK_STATE,
        ...(persistedState as Partial<TaskState>),
      }),
    }
  )
);
