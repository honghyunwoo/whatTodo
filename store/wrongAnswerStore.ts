/**
 * Wrong Answer Store - 오답 복습 시스템
 * 틀린 문제를 저장하고 복습 세션을 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { ActivityType, ExerciseType } from '@/types/activity';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface WrongAnswer {
  id: string;
  exerciseId: string;
  lessonId: string;
  weekId: string;
  type: ActivityType;
  exerciseType: ExerciseType;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  attemptedAt: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  mastered: boolean; // 3회 연속 정답 시 true
  consecutiveCorrect: number; // 연속 정답 횟수
}

export interface ReviewSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswerIds: string[];
}

interface WrongAnswerStats {
  totalWrongAnswers: number;
  masteredCount: number;
  pendingReviewCount: number;
  averageReviewCount: number;
  lastSessionDate: string | null;
}

// ─────────────────────────────────────
// State & Actions
// ─────────────────────────────────────

interface WrongAnswerState {
  wrongAnswers: WrongAnswer[];
  sessions: ReviewSession[];
  stats: WrongAnswerStats;
}

interface WrongAnswerActions {
  // 오답 추가/관리
  addWrongAnswer: (
    answer: Omit<
      WrongAnswer,
      'id' | 'reviewCount' | 'lastReviewedAt' | 'mastered' | 'consecutiveCorrect'
    >
  ) => void;
  removeWrongAnswer: (id: string) => void;
  clearMastered: () => void;
  clearAll: () => void;

  // 복습
  reviewAnswer: (id: string, correct: boolean) => void;
  getWrongAnswersForReview: (limit?: number) => WrongAnswer[];
  getPendingCount: () => number;

  // 세션
  startReviewSession: (wrongAnswerIds: string[]) => string;
  completeReviewSession: (sessionId: string, correctAnswers: number) => void;
  getRecentSessions: (limit?: number) => ReviewSession[];

  // 통계
  getStats: () => WrongAnswerStats;
  getWrongAnswersByType: (type: ActivityType) => WrongAnswer[];
  getWrongAnswersByLesson: (lessonId: string) => WrongAnswer[];

  // 유틸리티
  getWrongAnswerById: (id: string) => WrongAnswer | undefined;
  hasPendingReviews: () => boolean;
}

// ─────────────────────────────────────
// Helper functions
// ─────────────────────────────────────

const generateId = (): string => {
  return `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const calculateStats = (wrongAnswers: WrongAnswer[]): WrongAnswerStats => {
  const masteredCount = wrongAnswers.filter((wa) => wa.mastered).length;
  const pendingReviewCount = wrongAnswers.filter((wa) => !wa.mastered).length;
  const totalReviewCount = wrongAnswers.reduce((sum, wa) => sum + wa.reviewCount, 0);

  return {
    totalWrongAnswers: wrongAnswers.length,
    masteredCount,
    pendingReviewCount,
    averageReviewCount: wrongAnswers.length > 0 ? totalReviewCount / wrongAnswers.length : 0,
    lastSessionDate: null, // 세션에서 업데이트
  };
};

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useWrongAnswerStore = create<WrongAnswerState & WrongAnswerActions>()(
  persist(
    (set, get) => ({
      // Initial state
      wrongAnswers: [],
      sessions: [],
      stats: {
        totalWrongAnswers: 0,
        masteredCount: 0,
        pendingReviewCount: 0,
        averageReviewCount: 0,
        lastSessionDate: null,
      },

      // 오답 추가
      addWrongAnswer: (answerData) => {
        const { wrongAnswers } = get();

        // 동일한 문제가 이미 있는지 확인 (exerciseId + lessonId 기준)
        const existingIndex = wrongAnswers.findIndex(
          (wa) => wa.exerciseId === answerData.exerciseId && wa.lessonId === answerData.lessonId
        );

        if (existingIndex !== -1) {
          // 기존 오답 업데이트 (최신 답변으로)
          const updated = [...wrongAnswers];
          updated[existingIndex] = {
            ...updated[existingIndex],
            userAnswer: answerData.userAnswer,
            attemptedAt: answerData.attemptedAt,
            consecutiveCorrect: 0, // 다시 틀렸으므로 리셋
            mastered: false,
          };
          set({
            wrongAnswers: updated,
            stats: calculateStats(updated),
          });
          return;
        }

        // 새 오답 추가
        const newWrongAnswer: WrongAnswer = {
          ...answerData,
          id: generateId(),
          reviewCount: 0,
          lastReviewedAt: null,
          mastered: false,
          consecutiveCorrect: 0,
        };

        const updatedAnswers = [...wrongAnswers, newWrongAnswer];
        set({
          wrongAnswers: updatedAnswers,
          stats: calculateStats(updatedAnswers),
        });
      },

      // 오답 제거
      removeWrongAnswer: (id) => {
        set((state) => {
          const updatedAnswers = state.wrongAnswers.filter((wa) => wa.id !== id);
          return {
            wrongAnswers: updatedAnswers,
            stats: calculateStats(updatedAnswers),
          };
        });
      },

      // 마스터한 오답 정리
      clearMastered: () => {
        set((state) => {
          const updatedAnswers = state.wrongAnswers.filter((wa) => !wa.mastered);
          return {
            wrongAnswers: updatedAnswers,
            stats: calculateStats(updatedAnswers),
          };
        });
      },

      // 전체 삭제
      clearAll: () => {
        set({
          wrongAnswers: [],
          sessions: [],
          stats: {
            totalWrongAnswers: 0,
            masteredCount: 0,
            pendingReviewCount: 0,
            averageReviewCount: 0,
            lastSessionDate: null,
          },
        });
      },

      // 복습 결과 기록
      reviewAnswer: (id, correct) => {
        set((state) => {
          const index = state.wrongAnswers.findIndex((wa) => wa.id === id);
          if (index === -1) return state;

          const updated = [...state.wrongAnswers];
          const answer = { ...updated[index] };

          answer.reviewCount += 1;
          answer.lastReviewedAt = new Date().toISOString();

          if (correct) {
            answer.consecutiveCorrect += 1;
            // 3회 연속 정답 시 마스터
            if (answer.consecutiveCorrect >= 3) {
              answer.mastered = true;
            }
          } else {
            answer.consecutiveCorrect = 0;
          }

          updated[index] = answer;

          return {
            wrongAnswers: updated,
            stats: calculateStats(updated),
          };
        });
      },

      // 복습할 오답 목록
      getWrongAnswersForReview: (limit = 10) => {
        const { wrongAnswers } = get();

        // 마스터하지 않은 것만, 오래된 순 + 복습 횟수 적은 순
        return wrongAnswers
          .filter((wa) => !wa.mastered)
          .sort((a, b) => {
            // 복습 횟수가 적은 것 우선
            if (a.reviewCount !== b.reviewCount) {
              return a.reviewCount - b.reviewCount;
            }
            // 오래된 것 우선
            return new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime();
          })
          .slice(0, limit);
      },

      // 대기 중인 복습 개수
      getPendingCount: () => {
        return get().wrongAnswers.filter((wa) => !wa.mastered).length;
      },

      // 복습 세션 시작
      startReviewSession: (wrongAnswerIds) => {
        const sessionId = `session_${Date.now()}`;
        const newSession: ReviewSession = {
          id: sessionId,
          startedAt: new Date().toISOString(),
          completedAt: null,
          totalQuestions: wrongAnswerIds.length,
          correctAnswers: 0,
          wrongAnswerIds,
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions].slice(0, 50), // 최대 50개 세션 유지
        }));

        return sessionId;
      },

      // 복습 세션 완료
      completeReviewSession: (sessionId, correctAnswers) => {
        set((state) => {
          const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
          if (sessionIndex === -1) return state;

          const updated = [...state.sessions];
          updated[sessionIndex] = {
            ...updated[sessionIndex],
            completedAt: new Date().toISOString(),
            correctAnswers,
          };

          return {
            sessions: updated,
            stats: {
              ...state.stats,
              lastSessionDate: new Date().toISOString(),
            },
          };
        });
      },

      // 최근 세션 목록
      getRecentSessions: (limit = 5) => {
        return get()
          .sessions.filter((s) => s.completedAt !== null)
          .slice(0, limit);
      },

      // 통계
      getStats: () => get().stats,

      // 활동 유형별 오답
      getWrongAnswersByType: (type) => {
        return get().wrongAnswers.filter((wa) => wa.type === type && !wa.mastered);
      },

      // 레슨별 오답
      getWrongAnswersByLesson: (lessonId) => {
        return get().wrongAnswers.filter((wa) => wa.lessonId === lessonId && !wa.mastered);
      },

      // ID로 오답 조회
      getWrongAnswerById: (id) => {
        return get().wrongAnswers.find((wa) => wa.id === id);
      },

      // 대기 중인 복습 있는지
      hasPendingReviews: () => {
        return get().wrongAnswers.some((wa) => !wa.mastered);
      },
    }),
    {
      name: STORAGE_KEYS.WRONG_ANSWERS || 'wrong-answers-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[WrongAnswerStore] rehydration failed:', error);
        } else if (state) {
          // 통계 재계산
          state.stats = calculateStats(state.wrongAnswers);
        }
      },
    }
  )
);
