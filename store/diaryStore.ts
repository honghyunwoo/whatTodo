import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateId } from '@/utils/id';

const DIARY_STORAGE_KEY = '@whatTodo:diary';

export type MoodType =
  | 'happy'
  | 'excited'
  | 'peaceful'
  | 'sad'
  | 'angry'
  | 'tired'
  | 'anxious'
  | 'neutral';

export const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😊', label: '행복해요', color: '#FFD93D' },
  excited: { emoji: '🎉', label: '신나요', color: '#FF6B6B' },
  peaceful: { emoji: '😌', label: '평온해요', color: '#6BCB77' },
  sad: { emoji: '😢', label: '슬퍼요', color: '#4D96FF' },
  angry: { emoji: '😠', label: '화나요', color: '#FF6B6B' },
  tired: { emoji: '😴', label: '피곤해요', color: '#9B59B6' },
  anxious: { emoji: '😰', label: '불안해요', color: '#F39C12' },
  neutral: { emoji: '😐', label: '그저 그래요', color: '#95A5A6' },
};

/** 학습 기록 */
export interface LearningRecord {
  /** 활동 타입 */
  activityType: string;
  /** 레슨 또는 주차 ID */
  lessonId?: string;
  weekId?: string;
  /** 점수 */
  score: number;
  /** 학습 시간 (초) */
  timeSpent?: number;
  /** 완료 시간 */
  completedAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: MoodType;
  tags?: string[];
  weather?: string;
  /** 오늘의 학습 기록 */
  learningRecords?: LearningRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DiaryStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthEntries: number;
  moodDistribution: Record<MoodType, number>;
  lastEntryDate: string | null;
}

interface DiaryState {
  entries: DiaryEntry[];
  tags: string[];
  streak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

interface DiaryActions {
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: string) => DiaryEntry | undefined;
  getEntriesForMonth: (year: number, month: number) => DiaryEntry[];
  getAllDatesWithEntries: () => string[];
  searchEntries: (query: string) => DiaryEntry[];
  getEntriesByTag: (tag: string) => DiaryEntry[];
  getEntriesByMood: (mood: MoodType) => DiaryEntry[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  getStats: () => DiaryStats;
  updateStreak: () => void;
  getRecentEntries: (limit: number) => DiaryEntry[];
  /** 학습 기록 추가 (오늘 일기에 자동 기록) */
  addLearningRecord: (record: Omit<LearningRecord, 'completedAt'>) => void;
  /** 오늘의 학습 기록 조회 */
  getTodayLearningRecords: () => LearningRecord[];
  /** 특정 날짜의 학습 기록 조회 */
  getLearningRecordsByDate: (date: string) => LearningRecord[];
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useDiaryStore = create<DiaryState & DiaryActions>()(
  persist(
    (set, get) => ({
      entries: [],
      tags: [],
      streak: 0,
      longestStreak: 0,
      lastEntryDate: null,

      addEntry: (entryData) => {
        const now = new Date().toISOString();
        const newEntry: DiaryEntry = {
          ...entryData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        if (entryData.tags) {
          const currentTags = get().tags;
          const newTags = entryData.tags.filter((t) => !currentTags.includes(t));
          if (newTags.length > 0) {
            set((state) => ({ tags: [...state.tags, ...newTags] }));
          }
        }

        set((state) => ({ entries: [...state.entries, newEntry] }));
        get().updateStreak();
      },

      updateEntry: (id, updates) => {
        if (updates.tags) {
          const currentTags = get().tags;
          const newTags = updates.tags.filter((t) => !currentTags.includes(t));
          if (newTags.length > 0) {
            set((state) => ({ tags: [...state.tags, ...newTags] }));
          }
        }

        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
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

      searchEntries: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().entries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.content.toLowerCase().includes(lowerQuery) ||
            entry.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getEntriesByTag: (tag) => {
        return get().entries.filter((entry) => entry.tags?.includes(tag));
      },

      getEntriesByMood: (mood) => {
        return get().entries.filter((entry) => entry.mood === mood);
      },

      addTag: (tag) => {
        const currentTags = get().tags;
        if (!currentTags.includes(tag)) {
          set((state) => ({ tags: [...state.tags, tag] }));
        }
      },

      removeTag: (tag) => {
        set((state) => ({ tags: state.tags.filter((t) => t !== tag) }));
      },

      getStats: () => {
        const entries = get().entries;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const moodDistribution: Record<MoodType, number> = {
          happy: 0,
          excited: 0,
          peaceful: 0,
          sad: 0,
          angry: 0,
          tired: 0,
          anxious: 0,
          neutral: 0,
        };

        let thisMonthEntries = 0;

        entries.forEach((entry) => {
          if (entry.mood) {
            moodDistribution[entry.mood]++;
          }
          const entryDate = new Date(entry.date);
          if (entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear) {
            thisMonthEntries++;
          }
        });

        return {
          totalEntries: entries.length,
          currentStreak: get().streak,
          longestStreak: get().longestStreak,
          thisMonthEntries,
          moodDistribution,
          lastEntryDate: get().lastEntryDate,
        };
      },

      updateStreak: () => {
        const today = getTodayString();
        const yesterday = getYesterdayString();
        const lastEntry = get().lastEntryDate;
        const currentStreak = get().streak;
        const longestStreak = get().longestStreak;
        const todayEntry = get().entries.find((e) => e.date === today);

        if (!todayEntry) return;

        if (lastEntry === today) {
          return;
        }

        let newStreak = 1;
        if (lastEntry === yesterday) {
          newStreak = currentStreak + 1;
        }

        const newLongest = Math.max(longestStreak, newStreak);

        set({
          streak: newStreak,
          longestStreak: newLongest,
          lastEntryDate: today,
        });
      },

      getRecentEntries: (limit) => {
        return get()
          .entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      addLearningRecord: (record) => {
        const today = getTodayString();
        const now = new Date().toISOString();

        const newRecord: LearningRecord = {
          ...record,
          completedAt: now,
        };

        const existingEntry = get().entries.find((e) => e.date === today);

        if (existingEntry) {
          // 기존 일기에 학습 기록 추가
          const updatedRecords = [...(existingEntry.learningRecords || []), newRecord];
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.id === existingEntry.id
                ? { ...entry, learningRecords: updatedRecords, updatedAt: now }
                : entry
            ),
          }));
        } else {
          // 오늘 일기가 없으면 학습 기록만 있는 일기 자동 생성
          const activityLabels: Record<string, string> = {
            vocabulary: '단어',
            grammar: '문법',
            listening: '듣기',
            reading: '읽기',
            speaking: '말하기',
            writing: '쓰기',
          };
          const activityLabel = activityLabels[record.activityType] || record.activityType;

          const newEntry: DiaryEntry = {
            id: generateId(),
            date: today,
            title: `오늘의 영어 학습`,
            content: `${activityLabel} 학습을 완료했어요! (${record.score}점)`,
            tags: ['영어학습', activityLabel],
            learningRecords: [newRecord],
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({ entries: [...state.entries, newEntry] }));
          get().updateStreak();
        }
      },

      getTodayLearningRecords: () => {
        const today = getTodayString();
        const todayEntry = get().entries.find((e) => e.date === today);
        return todayEntry?.learningRecords || [];
      },

      getLearningRecordsByDate: (date) => {
        const entry = get().entries.find((e) => e.date === date);
        return entry?.learningRecords || [];
      },
    }),
    {
      name: DIARY_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const DAILY_PROMPTS = [
  '오늘 가장 감사했던 순간은?',
  '오늘 나를 웃게 만든 것은?',
  '오늘 배운 것이 있다면?',
  '내일 기대되는 일이 있나요?',
  '오늘 누구와 좋은 시간을 보냈나요?',
  '지금 이 순간 어떤 생각이 드나요?',
  '오늘 나에게 하고 싶은 말이 있다면?',
  '이번 주 가장 기억에 남는 일은?',
  '요즘 관심 있는 것이 있나요?',
  '오늘 힘들었던 일이 있나요?',
  '최근에 본 영화나 책 중 인상 깊었던 것은?',
  '오늘 먹은 음식 중 맛있었던 것은?',
  '지금 가장 원하는 것은 무엇인가요?',
  '오늘 나를 성장시킨 경험이 있나요?',
  '일주일 후의 나에게 하고 싶은 말은?',
];

export function getRandomPrompt(): string {
  const index = Math.floor(Math.random() * DAILY_PROMPTS.length);
  return DAILY_PROMPTS[index];
}

export function getTodayPrompt(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index];
}
