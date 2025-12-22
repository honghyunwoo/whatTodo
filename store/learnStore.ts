import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  Activity,
  ActivityType,
  CEFRLevel,
  FlashCardResult,
  LearnProgress,
  QuizResult,
  WeekProgress,
} from '@/types/activity';
import { useRewardStore } from './rewardStore';

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

const ACTIVITY_TYPES: ActivityType[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'speaking',
  'writing',
];

export const WEEK_IDS = ['week-1', 'week-2', 'week-3', 'week-4', 'week-5', 'week-6', 'week-7', 'week-8'];

// ─────────────────────────────────────
// State & Actions
// ─────────────────────────────────────

interface LearnState {
  currentWeek: string;
  currentLevel: CEFRLevel;
  progress: LearnProgress[];
  weekProgress: WeekProgress[];
  streak: number;
  lastStudyDate: string | null;
}

interface LearnActions {
  // 주차/레벨 설정
  setCurrentWeek: (weekId: string) => void;
  setCurrentLevel: (level: CEFRLevel) => void;

  // 진행률 관리
  updateProgress: (progress: LearnProgress) => void;
  markActivityComplete: (
    activityId: string,
    weekId: string,
    type: ActivityType,
    score: number
  ) => void;

  // 퀴즈/플래시카드 결과 저장
  saveQuizResults: (activityId: string, results: QuizResult[]) => void;
  saveFlashCardResults: (activityId: string, results: FlashCardResult[]) => void;

  // 통계 조회
  getWeekCompletionRate: (weekId: string) => number;
  getActivityProgress: (activityId: string) => LearnProgress | undefined;
  getTotalWordsLearned: () => number;
  getTotalActivitiesCompleted: () => number;
  getStreak: () => number;

  // 주간 진행률
  initWeekProgress: (weekId: string) => void;
  getWeekProgress: (weekId: string) => WeekProgress | undefined;

  // 스트릭 관리
  updateStreak: () => void;

  // 초기화
  resetProgress: () => void;
}

// ─────────────────────────────────────
// Store 생성
// ─────────────────────────────────────

export const useLearnStore = create<LearnState & LearnActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentWeek: 'week-1',
      currentLevel: 'A1',
      progress: [],
      weekProgress: [],
      streak: 0,
      lastStudyDate: null,

      // 주차/레벨 설정
      setCurrentWeek: (weekId) => {
        if (WEEK_IDS.includes(weekId)) {
          set({ currentWeek: weekId });
        }
      },

      setCurrentLevel: (level) => set({ currentLevel: level }),

      // 진행률 업데이트
      updateProgress: (newProgress) => {
        set((state) => {
          const existingIndex = state.progress.findIndex(
            (p) => p.activityId === newProgress.activityId
          );

          if (existingIndex >= 0) {
            const updated = [...state.progress];
            updated[existingIndex] = { ...updated[existingIndex], ...newProgress };
            return { progress: updated };
          }

          return { progress: [...state.progress, newProgress] };
        });

        // 학습일 업데이트
        get().updateStreak();
      },

      // 활동 완료 처리
      markActivityComplete: (activityId, weekId, type, score) => {
        const now = new Date().toISOString();

        const newProgress: LearnProgress = {
          activityId,
          weekId,
          type,
          completed: true,
          score,
          timeSpent: 0,
          lastAttempt: now,
        };

        get().updateProgress(newProgress);

        // Earn learning stars (higher than Todo rewards!)
        const starsEarned = useRewardStore.getState().earnLearningStars(type, score);
        if (__DEV__) {
          console.log(`[Learning] Earned ${starsEarned} stars for ${type} (score: ${score})`);
        }

        // 주간 진행률 업데이트
        set((state) => {
          const weekIdx = state.weekProgress.findIndex((w) => w.weekId === weekId);

          if (weekIdx >= 0) {
            const updated = [...state.weekProgress];
            const week = { ...updated[weekIdx] };

            if (!week.activitiesCompleted.includes(activityId)) {
              week.activitiesCompleted = [...week.activitiesCompleted, activityId];
              week.totalScore =
                (week.totalScore * (week.activitiesCompleted.length - 1) + score) /
                week.activitiesCompleted.length;

              // 모든 활동 완료 시 completedAt 설정
              if (week.activitiesCompleted.length >= ACTIVITY_TYPES.length) {
                week.completedAt = now;
              }
            }

            updated[weekIdx] = week;
            return { weekProgress: updated };
          }

          return state;
        });
      },

      // 퀴즈 결과 저장
      saveQuizResults: (activityId, results) => {
        const correctCount = results.filter((r) => r.correct).length;
        const totalCount = results.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

        set((state) => {
          const existingIdx = state.progress.findIndex((p) => p.activityId === activityId);

          if (existingIdx >= 0) {
            const updated = [...state.progress];
            updated[existingIdx] = {
              ...updated[existingIdx],
              score,
              exercisesCorrect: correctCount,
              exercisesTotal: totalCount,
              timeSpent: (updated[existingIdx].timeSpent || 0) + totalTime,
              lastAttempt: new Date().toISOString(),
            };
            return { progress: updated };
          }

          return state;
        });
      },

      // 플래시카드 결과 저장
      saveFlashCardResults: (activityId, results) => {
        const knownCount = results.filter((r) => r.known).length;
        const totalCount = results.length;
        const score = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;

        set((state) => {
          const existingIdx = state.progress.findIndex((p) => p.activityId === activityId);

          if (existingIdx >= 0) {
            const updated = [...state.progress];
            updated[existingIdx] = {
              ...updated[existingIdx],
              score,
              wordsMastered: knownCount,
              lastAttempt: new Date().toISOString(),
            };
            return { progress: updated };
          }

          return state;
        });
      },

      // 주간 완료율 조회
      getWeekCompletionRate: (weekId) => {
        const { weekProgress } = get();
        const week = weekProgress.find((w) => w.weekId === weekId);

        if (!week) return 0;

        return Math.round((week.activitiesCompleted.length / ACTIVITY_TYPES.length) * 100);
      },

      // 활동 진행률 조회
      getActivityProgress: (activityId) => {
        return get().progress.find((p) => p.activityId === activityId);
      },

      // 총 학습 단어 수
      getTotalWordsLearned: () => {
        const { progress } = get();
        return progress
          .filter((p) => p.type === 'vocabulary')
          .reduce((sum, p) => sum + (p.wordsMastered || 0), 0);
      },

      // 완료한 활동 수
      getTotalActivitiesCompleted: () => {
        return get().progress.filter((p) => p.completed).length;
      },

      // 스트릭 조회
      getStreak: () => get().streak,

      // 주간 진행률 초기화
      initWeekProgress: (weekId) => {
        set((state) => {
          const exists = state.weekProgress.some((w) => w.weekId === weekId);

          if (exists) return state;

          const newWeekProgress: WeekProgress = {
            weekId,
            level: state.currentLevel,
            activitiesCompleted: [],
            totalScore: 0,
            startedAt: new Date().toISOString(),
          };

          return { weekProgress: [...state.weekProgress, newWeekProgress] };
        });
      },

      // 주간 진행률 조회
      getWeekProgress: (weekId) => {
        return get().weekProgress.find((w) => w.weekId === weekId);
      },

      // 스트릭 업데이트
      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastStudyDate, streak } = get();

        if (lastStudyDate === today) {
          // 오늘 이미 학습함
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastStudyDate === yesterdayStr) {
          // 어제 학습함 → 스트릭 증가
          set({ streak: streak + 1, lastStudyDate: today });
        } else {
          // 스트릭 리셋
          set({ streak: 1, lastStudyDate: today });
        }
      },

      // 진행률 초기화
      resetProgress: () => {
        set({
          progress: [],
          weekProgress: [],
          streak: 0,
          lastStudyDate: null,
          currentWeek: 'week-1',
        });
      },
    }),
    {
      name: STORAGE_KEYS.LEARN_PROGRESS,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────

/** 활동 ID 생성 */
export function createActivityId(weekId: string, type: ActivityType): string {
  return `${weekId}-${type}`;
}

/** 주차 번호 추출 */
export function getWeekNumber(weekId: string): number {
  const match = weekId.match(/week-(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/** 활동 타입 목록 */
export { ACTIVITY_TYPES };
