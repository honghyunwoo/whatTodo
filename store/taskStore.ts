import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { Task, TaskFilter, TaskFormData, TaskSort } from '@/types/task';
import { generateId } from '@/utils/id';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  sortBy: TaskSort;
}

interface TaskActions {
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  setSortBy: (sortBy: TaskSort) => void;
  getFilteredTasks: () => Task[];
  getCompletionRate: () => number;
  getTodayTasks: () => Task[];
}

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'all',
      sortBy: 'createdAt',

      addTask: (data) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...data,
          id: generateId(),
          completed: false,
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
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? now : undefined,
                  updatedAt: now,
                }
              : task
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),
      setSortBy: (sortBy) => set({ sortBy }),

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
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
