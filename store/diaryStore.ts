import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateId } from '@/utils/id';

const DIARY_STORAGE_KEY = '@whatTodo:diary';

export type MoodType = 'happy' | 'sad' | 'angry' | 'tired' | 'neutral';

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: MoodType;
  createdAt: string;
  updatedAt: string;
}

interface DiaryState {
  entries: DiaryEntry[];
}

interface DiaryActions {
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: string) => DiaryEntry | undefined;
  getEntriesForMonth: (year: number, month: number) => DiaryEntry[];
  getAllDatesWithEntries: () => string[];
}

export const useDiaryStore = create<DiaryState & DiaryActions>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entryData) => {
        const now = new Date().toISOString();
        const newEntry: DiaryEntry = {
          ...entryData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ entries: [...state.entries, newEntry] }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      getEntryByDate: (date) => {
        return get().entries.find((entry) => entry.date === date);
      },

      getEntriesForMonth: (year, month) => {
        const monthStr = String(month + 1).padStart(2, '0');
        const prefix = `${year}-${monthStr}`;
        return get().entries.filter((entry) => entry.date.startsWith(prefix));
      },

      getAllDatesWithEntries: () => {
        return get().entries.map((entry) => entry.date);
      },
    }),
    {
      name: DIARY_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
