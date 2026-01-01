/**
 * 테스트 시스템 Store
 *
 * 테스트 세션 관리 및 결과 저장
 * - placement: 배치 테스트
 * - diagnostic: 진단 테스트
 * - lesson: 레슨 테스트
 * - promotion: 승급 테스트
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActivityType, CEFRLevel } from '@/types/activity';
import type {
  TestType,
  TestMeta,
  TestQuestion,
  TestAnswer,
  TestSession,
  TestResult,
  TestHistoryEntry,
  ActivityScore,
  PlacementTestResult,
} from '@/types/test';

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

const TEST_STORAGE_KEY = 'test-store';

/** 테스트 통과 기준 (70%) */
const PASS_THRESHOLD = 70;

// ─────────────────────────────────────
// State & Actions
// ─────────────────────────────────────

interface TestState {
  /** 현재 테스트 세션 */
  currentSession: TestSession | null;

  /** 테스트 결과 히스토리 */
  testHistory: TestHistoryEntry[];

  /** 최근 테스트 결과 (상세) */
  lastResult: TestResult | null;

  /** 배치 테스트 결과 (레벨 추천용) */
  placementResult: PlacementTestResult | null;

  /** 각 레슨별 테스트 통과 여부 */
  lessonTestsPassed: Record<string, boolean>;

  /** 각 유닛별 승급 테스트 통과 여부 */
  promotionTestsPassed: Record<string, boolean>;
}

interface TestActions {
  // ─── 테스트 세션 관리 ───
  /** 테스트 시작 */
  startTest: (testMeta: TestMeta, questions: TestQuestion[]) => void;

  /** 문제 답변 제출 */
  answerQuestion: (
    questionId: string,
    userAnswer: string,
    timeSpent: number,
    hintUsed?: boolean
  ) => void;

  /** 다음 문제로 이동 */
  nextQuestion: () => void;

  /** 이전 문제로 이동 */
  prevQuestion: () => void;

  /** 특정 문제로 이동 */
  goToQuestion: (index: number) => void;

  /** 테스트 일시 정지 */
  pauseTest: () => void;

  /** 테스트 재개 */
  resumeTest: () => void;

  /** 테스트 제출 */
  submitTest: () => TestResult;

  /** 테스트 취소 */
  cancelTest: () => void;

  // ─── 결과 조회 ───
  /** 테스트 결과 조회 */
  getTestResult: (resultId: string) => TestHistoryEntry | undefined;

  /** 레슨 테스트 통과 여부 */
  isLessonTestPassed: (lessonId: string) => boolean;

  /** 승급 테스트 통과 여부 */
  isPromotionTestPassed: (unitId: string) => boolean;

  /** 테스트 응시 가능 여부 (쿨다운 체크) */
  canTakeTest: (testId: string, testType: TestType) => boolean;

  // ─── 배치 테스트 ───
  /** 배치 테스트 결과 저장 */
  savePlacementResult: (result: PlacementTestResult) => void;

  /** 추천 레벨 조회 */
  getRecommendedLevel: () => CEFRLevel | null;

  // ─── 유틸리티 ───
  /** 현재 진행률 (%) */
  getCurrentProgress: () => number;

  /** 현재 점수 (%) */
  getCurrentScore: () => number;

  /** 히스토리 초기화 */
  clearHistory: () => void;
}

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/** 활동별 점수 계산 */
function calculateActivityScores(
  questions: TestQuestion[],
  answers: TestAnswer[]
): Partial<Record<ActivityType, ActivityScore>> {
  const scores: Partial<Record<ActivityType, ActivityScore>> = {};

  const activityTypes: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const type of activityTypes) {
    const typeQuestions = questions.filter((q) => q.activityType === type);
    if (typeQuestions.length === 0) continue;

    const typeAnswers = answers.filter((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      return q?.activityType === type;
    });

    const correct = typeAnswers.filter((a) => a.correct).length;
    const total = typeQuestions.length;

    scores[type] = {
      type,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }

  return scores;
}

/** 피드백 메시지 생성 */
function generateFeedback(score: number, passed: boolean, testType: TestType): string {
  if (testType === 'placement' || testType === 'diagnostic') {
    if (score >= 90) return '훌륭해요! 높은 수준의 영어 실력을 가지고 계시네요.';
    if (score >= 70) return '좋은 기초가 있습니다. 꾸준한 학습으로 더 성장할 수 있어요!';
    if (score >= 50) return '기본기가 있습니다. 체계적인 학습이 도움이 될 거예요.';
    return '차근차근 기초부터 시작해봐요. 분명 성장할 수 있습니다!';
  }

  if (passed) {
    if (score >= 90) return '완벽해요! 다음 단계로 넘어갈 준비가 되었습니다.';
    if (score >= 80) return '훌륭해요! 테스트를 통과했습니다.';
    return '잘하셨어요! 테스트를 통과했습니다.';
  }

  return '아쉽네요. 복습 후 다시 도전해보세요!';
}

/** 추천 액션 생성 */
function generateRecommendations(
  testType: TestType,
  passed: boolean,
  activityScores: Partial<Record<ActivityType, ActivityScore>>
): string[] {
  const recommendations: string[] = [];

  // 약점 영역 찾기
  const weakAreas = Object.entries(activityScores)
    .filter(([_, score]) => score && score.percentage < 60)
    .map(([type, _]) => type as ActivityType);

  if (weakAreas.length > 0) {
    const areaNames: Record<ActivityType, string> = {
      vocabulary: '어휘',
      grammar: '문법',
      listening: '듣기',
      reading: '읽기',
      speaking: '말하기',
      writing: '쓰기',
    };

    const weakAreaNames = weakAreas.map((a) => areaNames[a]).join(', ');
    recommendations.push(`${weakAreaNames} 영역을 집중적으로 복습해보세요.`);
  }

  if (!passed && (testType === 'lesson' || testType === 'promotion')) {
    recommendations.push('레슨 내용을 다시 한 번 복습하고 재도전해보세요.');
    recommendations.push('플래시카드로 핵심 표현을 반복 학습해보세요.');
  }

  if (passed) {
    recommendations.push('다음 레슨으로 진행하세요!');
  }

  return recommendations;
}

// ─────────────────────────────────────
// Store 생성
// ─────────────────────────────────────

export const useTestStore = create<TestState & TestActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentSession: null,
      testHistory: [],
      lastResult: null,
      placementResult: null,
      lessonTestsPassed: {},
      promotionTestsPassed: {},

      // ─── 테스트 세션 관리 ───

      startTest: (testMeta, questions) => {
        const now = new Date().toISOString();

        const session: TestSession = {
          testId: testMeta.id,
          testType: testMeta.type,
          questions,
          currentIndex: 0,
          answers: [],
          startedAt: now,
          remainingTime: testMeta.timeLimit > 0 ? testMeta.timeLimit * 60 : null,
          status: 'active',
        };

        set({ currentSession: session });
      },

      answerQuestion: (questionId, userAnswer, timeSpent, hintUsed = false) => {
        set((state) => {
          if (!state.currentSession) return state;

          const question = state.currentSession.questions.find((q) => q.id === questionId);
          if (!question) return state;

          const correct = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();

          const answer: TestAnswer = {
            questionId,
            userAnswer,
            correct,
            timeSpent,
            hintUsed,
          };

          // 기존 답변 업데이트 또는 추가
          const existingIdx = state.currentSession.answers.findIndex(
            (a) => a.questionId === questionId
          );
          const updatedAnswers =
            existingIdx >= 0
              ? state.currentSession.answers.map((a, i) => (i === existingIdx ? answer : a))
              : [...state.currentSession.answers, answer];

          return {
            currentSession: {
              ...state.currentSession,
              answers: updatedAnswers,
            },
          };
        });
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const newIndex = Math.min(
            state.currentSession.currentIndex + 1,
            state.currentSession.questions.length - 1
          );

          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: newIndex,
            },
          };
        });
      },

      prevQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const newIndex = Math.max(state.currentSession.currentIndex - 1, 0);

          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: newIndex,
            },
          };
        });
      },

      goToQuestion: (index) => {
        set((state) => {
          if (!state.currentSession) return state;

          const validIndex = Math.max(
            0,
            Math.min(index, state.currentSession.questions.length - 1)
          );

          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: validIndex,
            },
          };
        });
      },

      pauseTest: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              status: 'paused',
            },
          };
        });
      },

      resumeTest: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              status: 'active',
            },
          };
        });
      },

      submitTest: () => {
        const { currentSession } = get();
        if (!currentSession) {
          throw new Error('No active test session');
        }

        const now = new Date().toISOString();

        // 점수 계산
        const correctCount = currentSession.answers.filter((a) => a.correct).length;
        const totalCount = currentSession.questions.length;
        const earnedPoints = currentSession.answers.reduce((sum, a) => {
          const q = currentSession.questions.find((q) => q.id === a.questionId);
          return a.correct ? sum + (q?.points ?? 1) : sum;
        }, 0);
        const totalPoints = currentSession.questions.reduce((sum, q) => sum + q.points, 0);
        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = score >= PASS_THRESHOLD;

        // 소요 시간 계산
        const timeSpent = currentSession.answers.reduce((sum, a) => sum + a.timeSpent, 0);

        // 활동별 점수
        const activityScores = calculateActivityScores(
          currentSession.questions,
          currentSession.answers
        );

        // 피드백 및 추천
        const feedback = generateFeedback(score, passed, currentSession.testType);
        const recommendations = generateRecommendations(
          currentSession.testType,
          passed,
          activityScores
        );

        // 결과 생성
        const result: TestResult = {
          id: `result-${Date.now()}`,
          testId: currentSession.testId,
          testType: currentSession.testType,
          level: 'A1', // TODO: 테스트 메타에서 가져오기
          score,
          earnedPoints,
          totalPoints,
          correctCount,
          totalCount,
          passed,
          timeSpent,
          completedAt: now,
          answers: currentSession.answers,
          activityScores,
          feedback,
          recommendations,
        };

        // 히스토리 항목 생성
        const historyEntry: TestHistoryEntry = {
          resultId: result.id,
          testId: currentSession.testId,
          testType: currentSession.testType,
          score,
          passed,
          completedAt: now,
        };

        // 상태 업데이트
        set((state) => {
          const updates: Partial<TestState> = {
            currentSession: null,
            lastResult: result,
            testHistory: [historyEntry, ...state.testHistory].slice(0, 100), // 최대 100개
          };

          // 레슨 테스트 통과 여부 저장
          if (currentSession.testType === 'lesson' && passed) {
            const lessonId = currentSession.testId.replace('test-', '');
            updates.lessonTestsPassed = {
              ...state.lessonTestsPassed,
              [lessonId]: true,
            };
          }

          // 승급 테스트 통과 여부 저장
          if (currentSession.testType === 'promotion' && passed) {
            const unitId = currentSession.testId.replace('promotion-', '');
            updates.promotionTestsPassed = {
              ...state.promotionTestsPassed,
              [unitId]: true,
            };
          }

          return updates;
        });

        return result;
      },

      cancelTest: () => {
        set({ currentSession: null });
      },

      // ─── 결과 조회 ───

      getTestResult: (resultId) => {
        return get().testHistory.find((h) => h.resultId === resultId);
      },

      isLessonTestPassed: (lessonId) => {
        return get().lessonTestsPassed[lessonId] ?? false;
      },

      isPromotionTestPassed: (unitId) => {
        return get().promotionTestsPassed[unitId] ?? false;
      },

      canTakeTest: (testId, testType) => {
        const { testHistory } = get();

        // 마지막 응시 기록 찾기
        const lastAttempt = testHistory.find((h) => h.testId === testId);
        if (!lastAttempt) return true;

        // 쿨다운 시간 (시간 단위)
        const cooldowns: Record<TestType, number> = {
          placement: 24,
          diagnostic: 0,
          lesson: 0,
          promotion: 1,
        };

        const cooldownHours = cooldowns[testType];
        if (cooldownHours === 0) return true;

        const lastTime = new Date(lastAttempt.completedAt).getTime();
        const now = Date.now();
        const hoursPassed = (now - lastTime) / (1000 * 60 * 60);

        return hoursPassed >= cooldownHours;
      },

      // ─── 배치 테스트 ───

      savePlacementResult: (result) => {
        set({ placementResult: result });
      },

      getRecommendedLevel: () => {
        const { placementResult } = get();
        return placementResult?.recommendedLevel ?? null;
      },

      // ─── 유틸리티 ───

      getCurrentProgress: () => {
        const { currentSession } = get();
        if (!currentSession) return 0;

        const answeredCount = currentSession.answers.length;
        const totalCount = currentSession.questions.length;

        return totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
      },

      getCurrentScore: () => {
        const { currentSession } = get();
        if (!currentSession) return 0;

        const correctCount = currentSession.answers.filter((a) => a.correct).length;
        const answeredCount = currentSession.answers.length;

        return answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
      },

      clearHistory: () => {
        set({
          testHistory: [],
          lastResult: null,
          placementResult: null,
          lessonTestsPassed: {},
          promotionTestsPassed: {},
        });
      },
    }),
    {
      name: TEST_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[TestStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
    }
  )
);
