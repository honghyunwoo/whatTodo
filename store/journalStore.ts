/**
 * Journal Store - Learning Journal
 * Tracks daily learning records, streaks, and statistics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  ActivityLog,
  CreateJournalData,
  JournalEntry,
  LearningStreak,
  MonthlyStats,
  SkillProgress,
  StreakRecord,
  UpdateJournalData,
} from '@/types/journal';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface JournalState {
  entries: Record<string, JournalEntry>; // keyed by date (YYYY-MM-DD)
  streak: LearningStreak;
  skillProgress: SkillProgress;
}

interface JournalActions {
  // Entry management
  getEntry: (date: string) => JournalEntry | undefined;
  getTodayEntry: () => JournalEntry | undefined;
  createEntry: (data: CreateJournalData) => JournalEntry;
  updateEntry: (date: string, data: UpdateJournalData) => void;

  // Activity logging
  logActivity: (log: ActivityLog) => void;
  getActivitiesForDate: (date: string) => ActivityLog[];

  // Streak management
  updateStreak: () => void;
  getStreak: () => LearningStreak;

  // Skill progress
  updateSkillProgress: (skill: keyof Omit<SkillProgress, 'lastUpdated'>, value: number) => void;
  getSkillProgress: () => SkillProgress;

  // Statistics
  getMonthlyStats: (month: string) => MonthlyStats;
  getRecentEntries: (days: number) => JournalEntry[];
  getTotalLearningTime: () => number;

  // Utilities
  getEntriesInRange: (startDate: string, endDate: string) => JournalEntry[];
  exportData: () => JournalState;
}

// ─────────────────────────────────────
// Helper functions
// ─────────────────────────────────────

const getToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
};

const createEmptyEntry = (date: string): JournalEntry => {
  const now = new Date().toISOString();
  return {
    id: date,
    date,
    learningTime: 0,
    completedActivities: [],
    notes: '',
    starsEarned: 0,
    createdAt: now,
    updatedAt: now,
  };
};

const createInitialStreak = (): LearningStreak => ({
  currentStreak: 0,
  longestStreak: 0,
  lastLearningDate: '',
  streakHistory: [],
  totalLearningDays: 0,
  updatedAt: new Date().toISOString(),
});

const createInitialSkillProgress = (): SkillProgress => ({
  vocabulary: 0,
  grammar: 0,
  listening: 0,
  reading: 0,
  speaking: 0,
  writing: 0,
  lastUpdated: new Date().toISOString(),
});

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useJournalStore = create<JournalState & JournalActions>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: {},
      streak: createInitialStreak(),
      skillProgress: createInitialSkillProgress(),

      // Get entry by date
      getEntry: (date) => get().entries[date],

      // Get today's entry
      getTodayEntry: () => get().entries[getToday()],

      // Create new entry
      createEntry: (data) => {
        const { date, notes, mood, difficulty, tags } = data;
        const now = new Date().toISOString();

        const newEntry: JournalEntry = {
          id: date,
          date,
          learningTime: 0,
          completedActivities: [],
          notes: notes || '',
          mood,
          difficulty,
          tags: tags || [],
          starsEarned: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          entries: {
            ...state.entries,
            [date]: newEntry,
          },
        }));

        return newEntry;
      },

      // Update entry
      updateEntry: (date, data) => {
        set((state) => {
          const existing = state.entries[date];
          if (!existing) return state;

          return {
            entries: {
              ...state.entries,
              [date]: {
                ...existing,
                ...data,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      // Log an activity
      logActivity: (log) => {
        const today = getToday();

        set((state) => {
          let entry = state.entries[today];

          if (!entry) {
            entry = createEmptyEntry(today);
          }

          // Add activity log
          const updatedActivities = [...entry.completedActivities, log];

          // Calculate total learning time
          const totalTime = updatedActivities.reduce((sum, a) => sum + a.timeSpent, 0);

          const updatedEntry: JournalEntry = {
            ...entry,
            completedActivities: updatedActivities,
            learningTime: totalTime,
            updatedAt: new Date().toISOString(),
          };

          return {
            entries: {
              ...state.entries,
              [today]: updatedEntry,
            },
          };
        });

        // Update streak
        get().updateStreak();

        // Update skill progress based on activity type
        const skillKey = log.activityType as keyof Omit<SkillProgress, 'lastUpdated'>;
        const currentProgress = get().skillProgress[skillKey] || 0;
        // Increment by score/10 (so max 10 points per activity)
        const newProgress = Math.min(100, currentProgress + log.score / 10);
        get().updateSkillProgress(skillKey, newProgress);
      },

      // Get activities for a specific date
      getActivitiesForDate: (date) => {
        const entry = get().entries[date];
        return entry?.completedActivities || [];
      },

      // Update streak
      updateStreak: () => {
        const today = getToday();
        const yesterday = getYesterday();

        set((state) => {
          const { streak, entries } = state;
          const todayEntry = entries[today];

          // No activity today yet
          if (!todayEntry || todayEntry.completedActivities.length === 0) {
            return state;
          }

          // Already counted today
          if (streak.lastLearningDate === today) {
            return state;
          }

          let newStreak = 1;
          let newLongest = streak.longestStreak;
          const newTotal = streak.totalLearningDays + 1;

          // Check if yesterday had learning
          if (streak.lastLearningDate === yesterday) {
            newStreak = streak.currentStreak + 1;
          }

          if (newStreak > newLongest) {
            newLongest = newStreak;
          }

          // Update streak history (keep last 30 days)
          const newRecord: StreakRecord = {
            date: today,
            maintained: true,
            learningTime: todayEntry.learningTime,
            activitiesCompleted: todayEntry.completedActivities.length,
          };

          const newHistory = [newRecord, ...streak.streakHistory].slice(0, 30);

          return {
            streak: {
              currentStreak: newStreak,
              longestStreak: newLongest,
              lastLearningDate: today,
              streakHistory: newHistory,
              totalLearningDays: newTotal,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      // Get streak
      getStreak: () => get().streak,

      // Update skill progress
      updateSkillProgress: (skill, value) => {
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skill]: Math.min(100, Math.max(0, value)),
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      // Get skill progress
      getSkillProgress: () => get().skillProgress,

      // Get monthly stats
      getMonthlyStats: (month) => {
        const { entries } = get();
        const monthEntries = Object.values(entries).filter((e) => e.date.startsWith(month));

        const totalTime = monthEntries.reduce((sum, e) => sum + e.learningTime, 0);
        const totalActivities = monthEntries.reduce(
          (sum, e) => sum + e.completedActivities.length,
          0
        );
        const totalStars = monthEntries.reduce((sum, e) => sum + e.starsEarned, 0);

        // Find most productive day of week
        const dayCount: Record<string, number> = {};
        monthEntries.forEach((e) => {
          const dayName = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' });
          dayCount[dayName] = (dayCount[dayName] || 0) + e.learningTime;
        });

        const mostProductiveDay =
          Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        // Find favorite activity type
        const activityCount: Record<string, number> = {};
        monthEntries.forEach((e) => {
          e.completedActivities.forEach((a) => {
            activityCount[a.activityType] = (activityCount[a.activityType] || 0) + 1;
          });
        });

        const favoriteActivityType = Object.entries(activityCount).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];

        return {
          month,
          totalLearningTime: totalTime,
          learningDays: monthEntries.length,
          completedActivities: totalActivities,
          averageDailyTime:
            monthEntries.length > 0 ? Math.round(totalTime / monthEntries.length) : 0,
          totalStarsEarned: totalStars,
          mostProductiveDay,
          favoriteActivityType,
        };
      },

      // Get recent entries
      getRecentEntries: (days) => {
        const { entries } = get();
        const today = new Date();
        const recentDates: string[] = [];

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          recentDates.push(dateStr);
        }

        return recentDates.map((d) => entries[d]).filter(Boolean) as JournalEntry[];
      },

      // Get total learning time
      getTotalLearningTime: () => {
        const { entries } = get();
        return Object.values(entries).reduce((sum, e) => sum + e.learningTime, 0);
      },

      // Get entries in range
      getEntriesInRange: (startDate, endDate) => {
        const { entries } = get();
        return Object.values(entries).filter((e) => e.date >= startDate && e.date <= endDate);
      },

      // Export all data
      exportData: () => ({
        entries: get().entries,
        streak: get().streak,
        skillProgress: get().skillProgress,
      }),
    }),
    {
      name: STORAGE_KEYS.JOURNAL,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[JournalStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
    }
  )
);
