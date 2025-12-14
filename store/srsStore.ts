/**
 * SRS Store - Spaced Repetition System
 * Manages word review scheduling using SM-2 algorithm
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { ReviewRating, SrsData } from '@/types/srs';
import {
  calculateSrsData,
  createInitialSrsData,
  getOverdueDays,
  isDueForReview,
  sortByReviewPriority,
} from '@/utils/srs';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface WordWithSrs {
  wordId: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  srsData: SrsData;
}

interface ReviewStats {
  totalReviews: number;
  correctReviews: number;
  averageEaseFactor: number;
  longestInterval: number;
  lastReviewDate: string | null;
}

// ─────────────────────────────────────
// State & Actions
// ─────────────────────────────────────

interface SrsState {
  words: WordWithSrs[];
  reviewStats: ReviewStats;
  dailyReviewGoal: number;
  todayReviewCount: number;
  lastReviewDate: string | null;
}

interface SrsActions {
  // Word management
  addWord: (word: Omit<WordWithSrs, 'srsData'>) => void;
  addWords: (words: Omit<WordWithSrs, 'srsData'>[]) => void;
  removeWord: (wordId: string) => void;

  // Review
  reviewWord: (wordId: string, rating: ReviewRating) => void;
  getWordsForReview: () => WordWithSrs[];
  getDueWordCount: () => number;

  // Stats
  getReviewStats: () => ReviewStats;
  getWordProgress: (wordId: string) => SrsData | undefined;
  getMasteredWords: () => WordWithSrs[];

  // Daily progress
  checkAndResetDaily: () => void;
  setDailyGoal: (goal: number) => void;
  getTodayProgress: () => { done: number; goal: number };

  // Utilities
  getWordById: (wordId: string) => WordWithSrs | undefined;
  getAllWords: () => WordWithSrs[];
  getOverdueWords: () => WordWithSrs[];
  resetAllProgress: () => void;
}

// ─────────────────────────────────────
// Helper functions
// ─────────────────────────────────────

const getToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useSrsStore = create<SrsState & SrsActions>()(
  persist(
    (set, get) => ({
      // Initial state
      words: [],
      reviewStats: {
        totalReviews: 0,
        correctReviews: 0,
        averageEaseFactor: 2.5,
        longestInterval: 0,
        lastReviewDate: null,
      },
      dailyReviewGoal: 20,
      todayReviewCount: 0,
      lastReviewDate: null,

      // Add a single word
      addWord: (wordData) => {
        const { words } = get();

        // Check if word already exists
        if (words.some((w) => w.wordId === wordData.wordId)) {
          return;
        }

        const newWord: WordWithSrs = {
          ...wordData,
          srsData: createInitialSrsData(wordData.wordId),
        };

        set({ words: [...words, newWord] });
      },

      // Add multiple words
      addWords: (wordDataList) => {
        const { words } = get();
        const existingIds = new Set(words.map((w) => w.wordId));

        const newWords: WordWithSrs[] = wordDataList
          .filter((wd) => !existingIds.has(wd.wordId))
          .map((wd) => ({
            ...wd,
            srsData: createInitialSrsData(wd.wordId),
          }));

        if (newWords.length > 0) {
          set({ words: [...words, ...newWords] });
        }
      },

      // Remove a word
      removeWord: (wordId) => {
        set((state) => ({
          words: state.words.filter((w) => w.wordId !== wordId),
        }));
      },

      // Review a word
      reviewWord: (wordId, rating) => {
        get().checkAndResetDaily();

        set((state) => {
          const wordIndex = state.words.findIndex((w) => w.wordId === wordId);
          if (wordIndex === -1) return state;

          const word = state.words[wordIndex];
          const newSrsData = calculateSrsData(word.srsData, rating);

          const updatedWords = [...state.words];
          updatedWords[wordIndex] = {
            ...word,
            srsData: {
              ...word.srsData,
              ...newSrsData,
            },
          };

          // Update stats
          const isCorrect = rating !== 'again';
          const newTotalReviews = state.reviewStats.totalReviews + 1;
          const newCorrectReviews = state.reviewStats.correctReviews + (isCorrect ? 1 : 0);

          // Calculate average ease factor
          const allEaseFactors = updatedWords.map((w) => w.srsData.easeFactor);
          const avgEaseFactor =
            allEaseFactors.reduce((sum, ef) => sum + ef, 0) / allEaseFactors.length;

          // Find longest interval
          const maxInterval = Math.max(...updatedWords.map((w) => w.srsData.interval));

          return {
            words: updatedWords,
            todayReviewCount: state.todayReviewCount + 1,
            reviewStats: {
              totalReviews: newTotalReviews,
              correctReviews: newCorrectReviews,
              averageEaseFactor: avgEaseFactor,
              longestInterval: maxInterval,
              lastReviewDate: new Date().toISOString(),
            },
          };
        });
      },

      // Get words due for review (sorted by priority)
      getWordsForReview: () => {
        const { words } = get();
        const dueWords = words.filter((w) => isDueForReview(w.srsData));
        return sortByReviewPriority(dueWords);
      },

      // Get count of due words
      getDueWordCount: () => {
        const { words } = get();
        return words.filter((w) => isDueForReview(w.srsData)).length;
      },

      // Get review stats
      getReviewStats: () => get().reviewStats,

      // Get word progress
      getWordProgress: (wordId) => {
        const word = get().words.find((w) => w.wordId === wordId);
        return word?.srsData;
      },

      // Get mastered words (interval >= 21 days)
      getMasteredWords: () => {
        return get().words.filter((w) => w.srsData.interval >= 21);
      },

      // Check and reset daily progress
      checkAndResetDaily: () => {
        const today = getToday();
        const { lastReviewDate } = get();

        if (lastReviewDate !== today) {
          set({
            todayReviewCount: 0,
            lastReviewDate: today,
          });
        }
      },

      // Set daily goal
      setDailyGoal: (goal) => {
        set({ dailyReviewGoal: Math.max(1, Math.min(100, goal)) });
      },

      // Get today's progress
      getTodayProgress: () => {
        get().checkAndResetDaily();
        const { todayReviewCount, dailyReviewGoal } = get();
        return { done: todayReviewCount, goal: dailyReviewGoal };
      },

      // Get word by ID
      getWordById: (wordId) => {
        return get().words.find((w) => w.wordId === wordId);
      },

      // Get all words
      getAllWords: () => get().words,

      // Get overdue words
      getOverdueWords: () => {
        return get().words.filter((w) => getOverdueDays(w.srsData) > 0);
      },

      // Reset all progress
      resetAllProgress: () => {
        set((state) => ({
          words: state.words.map((w) => ({
            ...w,
            srsData: createInitialSrsData(w.wordId),
          })),
          reviewStats: {
            totalReviews: 0,
            correctReviews: 0,
            averageEaseFactor: 2.5,
            longestInterval: 0,
            lastReviewDate: null,
          },
          todayReviewCount: 0,
        }));
      },
    }),
    {
      name: STORAGE_KEYS.SRS || 'srs-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─────────────────────────────────────
// Utility exports
// ─────────────────────────────────────

export type { WordWithSrs, ReviewStats };
