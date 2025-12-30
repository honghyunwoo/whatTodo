/**
 * Session Store
 * 30초/1분/5분 세션 관리 + 스마트 콘텐츠 선택 (30-50-20 비율)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  Expression,
  SessionType,
  SessionStatus,
  SessionContent,
  SessionRecord,
  SessionExpressionRecord,
  SESSION_CONFIG,
} from '@/types/scenario';
import { generateId } from '@/utils/id';

// ─────────────────────────────────────
// 콘텐츠 선택 비율 (PRD 핵심)
// ─────────────────────────────────────

const CONTENT_RATIO = {
  success: 0.3, // 30% - 자신감 부여 (이미 아는 것)
  weakness: 0.5, // 50% - 실력 향상 (약점)
  expansion: 0.2, // 20% - 새로운 도전 (확장)
};

// ─────────────────────────────────────
// State 타입
// ─────────────────────────────────────

interface SessionStoreState {
  // 현재 세션
  status: SessionStatus;
  currentSession: {
    id: string;
    type: SessionType;
    scenarioId: string;
    startedAt: Date | null;
    expressions: Expression[];
    currentIndex: number;
    answers: SessionExpressionRecord[];
    timeRemaining: number; // 초 단위
    isPaused: boolean;
  } | null;

  // 세션 히스토리
  history: SessionRecord[];

  // 통계
  todaySessionCount: number;
  todayStreak: number;
  lastSessionDate: string | null;
}

interface SessionStoreActions {
  // 세션 관리
  startSession: (
    type: SessionType,
    scenarioId: string,
    allExpressions: Expression[],
    userProgress?: Map<string, number> // expressionId -> 정답률 (0-100)
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => SessionRecord | null;
  cancelSession: () => void;

  // 학습 진행
  recordAnswer: (
    expressionId: string,
    isCorrect: boolean,
    userAnswer?: string,
    timeSpent?: number
  ) => void;
  nextExpression: () => boolean; // 다음 표현이 있으면 true
  getCurrentExpression: () => Expression | null;
  getSessionProgress: () => { current: number; total: number; percentage: number };

  // 타이머
  tick: () => void; // 1초마다 호출
  getTimeRemaining: () => { minutes: number; seconds: number };

  // 콘텐츠 선택
  selectSmartContent: (
    allExpressions: Expression[],
    count: number,
    userProgress?: Map<string, number>
  ) => SessionContent;

  // 결과 조회
  getLastSession: () => SessionRecord | null;
  getTodaySessions: () => SessionRecord[];
  getSessionStats: () => {
    totalSessions: number;
    averageScore: number;
    averageTime: number;
    byType: Record<SessionType, number>;
  };

  // 초기화
  resetTodayStats: () => void;
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialState: SessionStoreState = {
  status: 'idle',
  currentSession: null,
  history: [],
  todaySessionCount: 0,
  todayStreak: 0,
  lastSessionDate: null,
};

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/**
 * 오늘 날짜 문자열
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 배열 셔플 (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useSessionStore = create<SessionStoreState & SessionStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────
      // 세션 관리
      // ─────────────────────────────────────

      startSession: (type, scenarioId, allExpressions, userProgress) => {
        const config = SESSION_CONFIG[type];
        const { selectSmartContent, lastSessionDate, todaySessionCount, todayStreak } = get();

        // 스마트 콘텐츠 선택
        const content = selectSmartContent(allExpressions, config.expressionCount, userProgress);
        const selectedExpressions = [...content.success, ...content.weakness, ...content.expansion];

        // 셔플하여 순서 섞기
        const shuffledExpressions = shuffleArray(selectedExpressions);

        // 오늘 첫 세션인지 확인
        const today = getTodayString();
        const isNewDay = lastSessionDate !== today;

        set({
          status: 'active',
          currentSession: {
            id: generateId(),
            type,
            scenarioId,
            startedAt: new Date(),
            expressions: shuffledExpressions,
            currentIndex: 0,
            answers: [],
            timeRemaining: config.duration,
            isPaused: false,
          },
          todaySessionCount: isNewDay ? 1 : todaySessionCount + 1,
          todayStreak: isNewDay ? 1 : todayStreak + 1,
          lastSessionDate: today,
        });
      },

      pauseSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          status: 'paused',
          currentSession: {
            ...currentSession,
            isPaused: true,
          },
        });
      },

      resumeSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          status: 'active',
          currentSession: {
            ...currentSession,
            isPaused: false,
          },
        });
      },

      endSession: () => {
        const { currentSession } = get();
        if (!currentSession) return null;

        // 점수 계산
        const correctCount = currentSession.answers.filter((a) => a.isCorrect).length;
        const totalCount = currentSession.answers.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        const record: SessionRecord = {
          id: currentSession.id,
          type: currentSession.type,
          scenarioId: currentSession.scenarioId,
          startedAt: currentSession.startedAt!,
          completedAt: new Date(),
          expressions: currentSession.answers,
          totalCount,
          correctCount,
          score,
        };

        set((state) => ({
          status: 'completed',
          currentSession: null,
          history: [record, ...state.history].slice(0, 100), // 최근 100개만 유지
        }));

        return record;
      },

      cancelSession: () => {
        set({
          status: 'idle',
          currentSession: null,
        });
      },

      // ─────────────────────────────────────
      // 학습 진행
      // ─────────────────────────────────────

      recordAnswer: (expressionId, isCorrect, userAnswer, timeSpent = 0) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const existingAnswerIndex = currentSession.answers.findIndex(
          (a) => a.expressionId === expressionId
        );

        const newAnswer: SessionExpressionRecord = {
          expressionId,
          isCorrect,
          userAnswer,
          timeSpent,
          attempts:
            existingAnswerIndex >= 0 ? currentSession.answers[existingAnswerIndex].attempts + 1 : 1,
        };

        const updatedAnswers =
          existingAnswerIndex >= 0
            ? currentSession.answers.map((a, i) => (i === existingAnswerIndex ? newAnswer : a))
            : [...currentSession.answers, newAnswer];

        set({
          currentSession: {
            ...currentSession,
            answers: updatedAnswers,
          },
        });
      },

      nextExpression: () => {
        const { currentSession } = get();
        if (!currentSession) return false;

        const nextIndex = currentSession.currentIndex + 1;
        if (nextIndex >= currentSession.expressions.length) {
          return false; // 더 이상 표현 없음
        }

        set({
          currentSession: {
            ...currentSession,
            currentIndex: nextIndex,
          },
        });

        return true;
      },

      getCurrentExpression: () => {
        const { currentSession } = get();
        if (!currentSession) return null;

        return currentSession.expressions[currentSession.currentIndex] || null;
      },

      getSessionProgress: () => {
        const { currentSession } = get();
        if (!currentSession) {
          return { current: 0, total: 0, percentage: 0 };
        }

        const current = currentSession.currentIndex + 1;
        const total = currentSession.expressions.length;
        const percentage = Math.round((current / total) * 100);

        return { current, total, percentage };
      },

      // ─────────────────────────────────────
      // 타이머
      // ─────────────────────────────────────

      tick: () => {
        const { currentSession, status } = get();
        if (!currentSession || status !== 'active' || currentSession.isPaused) return;

        const newTimeRemaining = currentSession.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // 시간 종료
          get().endSession();
        } else {
          set({
            currentSession: {
              ...currentSession,
              timeRemaining: newTimeRemaining,
            },
          });
        }
      },

      getTimeRemaining: () => {
        const { currentSession } = get();
        if (!currentSession) {
          return { minutes: 0, seconds: 0 };
        }

        const minutes = Math.floor(currentSession.timeRemaining / 60);
        const seconds = currentSession.timeRemaining % 60;

        return { minutes, seconds };
      },

      // ─────────────────────────────────────
      // 스마트 콘텐츠 선택 (30-50-20 비율)
      // ─────────────────────────────────────

      selectSmartContent: (allExpressions, count, userProgress) => {
        // 각 카테고리 개수 계산
        const successCount = Math.round(count * CONTENT_RATIO.success);
        const weaknessCount = Math.round(count * CONTENT_RATIO.weakness);
        const expansionCount = count - successCount - weaknessCount; // 나머지

        // 진행률 기반 분류
        const categorized = {
          success: [] as Expression[], // 정답률 >= 80%
          weakness: [] as Expression[], // 정답률 30-79%
          expansion: [] as Expression[], // 정답률 < 30% 또는 새로운 것
        };

        for (const expression of allExpressions) {
          const progress = userProgress?.get(expression.id);

          if (progress === undefined || progress < 30) {
            categorized.expansion.push(expression);
          } else if (progress >= 80) {
            categorized.success.push(expression);
          } else {
            categorized.weakness.push(expression);
          }
        }

        // 셔플하고 선택
        const result: SessionContent = {
          success: shuffleArray(categorized.success).slice(0, successCount),
          weakness: shuffleArray(categorized.weakness).slice(0, weaknessCount),
          expansion: shuffleArray(categorized.expansion).slice(0, expansionCount),
        };

        // 부족한 카테고리 보충
        const totalSelected =
          result.success.length + result.weakness.length + result.expansion.length;
        const shortage = count - totalSelected;

        if (shortage > 0) {
          // 남은 표현들에서 보충
          const selectedIds = new Set([
            ...result.success.map((e) => e.id),
            ...result.weakness.map((e) => e.id),
            ...result.expansion.map((e) => e.id),
          ]);

          const remaining = allExpressions.filter((e) => !selectedIds.has(e.id));
          const additional = shuffleArray(remaining).slice(0, shortage);

          // weakness에 추가 (실력 향상 위주)
          result.weakness.push(...additional);
        }

        return result;
      },

      // ─────────────────────────────────────
      // 결과 조회
      // ─────────────────────────────────────

      getLastSession: () => {
        const { history } = get();
        return history[0] || null;
      },

      getTodaySessions: () => {
        const { history } = get();
        const today = getTodayString();

        return history.filter((session) => {
          const sessionDate = new Date(session.startedAt).toISOString().split('T')[0];
          return sessionDate === today;
        });
      },

      getSessionStats: () => {
        const { history } = get();

        if (history.length === 0) {
          return {
            totalSessions: 0,
            averageScore: 0,
            averageTime: 0,
            byType: { '30s': 0, '1m': 0, '5m': 0 },
          };
        }

        // 전체 세션 수
        const totalSessions = history.length;

        // 평균 점수
        const averageScore = Math.round(
          history.reduce((sum, s) => sum + s.score, 0) / totalSessions
        );

        // 평균 시간 (초)
        const averageTime = Math.round(
          history.reduce((sum, s) => {
            const config = SESSION_CONFIG[s.type];
            return sum + config.duration;
          }, 0) / totalSessions
        );

        // 타입별 세션 수
        const byType: Record<SessionType, number> = { '30s': 0, '1m': 0, '5m': 0 };
        for (const session of history) {
          byType[session.type]++;
        }

        return { totalSessions, averageScore, averageTime, byType };
      },

      // ─────────────────────────────────────
      // 초기화
      // ─────────────────────────────────────

      resetTodayStats: () => {
        const today = getTodayString();
        const { lastSessionDate } = get();

        if (lastSessionDate !== today) {
          set({
            todaySessionCount: 0,
            todayStreak: 0,
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.SESSIONS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history.slice(0, 50), // 최근 50개만 저장
        todaySessionCount: state.todaySessionCount,
        todayStreak: state.todayStreak,
        lastSessionDate: state.lastSessionDate,
      }),
    }
  )
);
