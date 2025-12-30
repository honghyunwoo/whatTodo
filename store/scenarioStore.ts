/**
 * Scenario Store
 * 시나리오 기반 학습 상태 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { Scenario, ScenarioCategory, ScenarioProgress, LearningStats } from '@/types/scenario';
import { loadAllScenarios } from '@/data/scenarios';

import { CEFRLevel } from '@/types/activity';
// ─────────────────────────────────────
// State 타입
// ─────────────────────────────────────

interface ScenarioState {
  // 시나리오 데이터
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;

  // 현재 선택된 시나리오
  currentScenarioId: string | null;
  currentExpressionIndex: number;

  // 진행 상태
  progress: Record<string, ScenarioProgress>; // scenarioId -> progress

  // 필터/정렬
  selectedCategory: ScenarioCategory | null;
  selectedLevel: CEFRLevel | null;

  // 통계
  stats: LearningStats;
}

interface ScenarioActions {
  // 시나리오 로드
  loadScenarios: () => Promise<void>;

  // 시나리오 선택
  selectScenario: (scenarioId: string) => void;
  clearCurrentScenario: () => void;

  // 진행 관리
  updateProgress: (
    scenarioId: string,
    expressionId: string,
    isCorrect: boolean,
    score?: number
  ) => void;
  completeScenario: (scenarioId: string, finalScore: number) => void;
  resetProgress: (scenarioId: string) => void;

  // 필터
  setCategory: (category: ScenarioCategory | null) => void;
  setLevel: (level: CEFRLevel | null) => void;

  // 표현 네비게이션
  nextExpression: () => void;
  prevExpression: () => void;
  goToExpression: (index: number) => void;

  // 조회
  getScenario: (scenarioId: string) => Scenario | undefined;
  getScenariosByCategory: (category: ScenarioCategory) => Scenario[];
  getScenariosByLevel: (level: CEFRLevel) => Scenario[];
  getFilteredScenarios: () => Scenario[];
  getProgress: (scenarioId: string) => ScenarioProgress | undefined;
  getRecommendedScenarios: () => Scenario[];

  // 통계 업데이트
  updateStats: () => void;

  // 유틸리티
  clearError: () => void;
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialStats: LearningStats = {
  totalExpressions: 0,
  masteredExpressions: 0,
  totalSessions: 0,
  totalTime: 0,
  averageScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  favoriteCategory: undefined,
};

const initialState: ScenarioState = {
  scenarios: [],
  isLoading: false,
  error: null,
  currentScenarioId: null,
  currentExpressionIndex: 0,
  progress: {},
  selectedCategory: null,
  selectedLevel: null,
  stats: initialStats,
};

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/**
 * 시나리오 JSON 데이터 로드
 */
async function loadScenarioData(): Promise<Scenario[]> {
  // 데이터 로더에서 모든 시나리오 로드
  return loadAllScenarios();
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────
      // 시나리오 로드
      // ─────────────────────────────────────

      loadScenarios: async () => {
        set({ isLoading: true, error: null });

        try {
          const scenarios = await loadScenarioData();
          set({ scenarios, isLoading: false });
        } catch (error) {
          console.error('[ScenarioStore] Load scenarios failed:', error);
          set({
            error: error instanceof Error ? error.message : '시나리오를 불러올 수 없습니다.',
            isLoading: false,
          });
        }
      },

      // ─────────────────────────────────────
      // 시나리오 선택
      // ─────────────────────────────────────

      selectScenario: (scenarioId: string) => {
        const { scenarios, progress } = get();
        const scenario = scenarios.find((s) => s.id === scenarioId);

        if (!scenario) {
          set({ error: '시나리오를 찾을 수 없습니다.' });
          return;
        }

        // 진행 정보가 없으면 초기화
        if (!progress[scenarioId]) {
          set((state) => ({
            progress: {
              ...state.progress,
              [scenarioId]: {
                scenarioId,
                completedExpressions: [],
                totalExpressions: scenario.expressions.length,
                progress: 0,
                isCompleted: false,
                practiceCount: 0,
              },
            },
          }));
        }

        set({
          currentScenarioId: scenarioId,
          currentExpressionIndex: 0,
          error: null,
        });
      },

      clearCurrentScenario: () => {
        set({
          currentScenarioId: null,
          currentExpressionIndex: 0,
        });
      },

      // ─────────────────────────────────────
      // 진행 관리
      // ─────────────────────────────────────

      updateProgress: (
        scenarioId: string,
        expressionId: string,
        isCorrect: boolean,
        score?: number
      ) => {
        set((state) => {
          const scenario = state.scenarios.find((s) => s.id === scenarioId);
          if (!scenario) return state;

          const existingProgress = state.progress[scenarioId] || {
            scenarioId,
            completedExpressions: [],
            totalExpressions: scenario.expressions.length,
            progress: 0,
            isCompleted: false,
            practiceCount: 0,
          };

          // 정답이면 완료 표현에 추가 (중복 방지)
          const completedExpressions =
            isCorrect && !existingProgress.completedExpressions.includes(expressionId)
              ? [...existingProgress.completedExpressions, expressionId]
              : existingProgress.completedExpressions;

          const progressPercent = Math.round(
            (completedExpressions.length / scenario.expressions.length) * 100
          );
          const isCompleted = completedExpressions.length === scenario.expressions.length;

          const updatedProgress: ScenarioProgress = {
            ...existingProgress,
            completedExpressions,
            progress: progressPercent,
            lastAccessed: new Date(),
            isCompleted,
            bestScore:
              score !== undefined
                ? Math.max(existingProgress.bestScore || 0, score)
                : existingProgress.bestScore,
            practiceCount: existingProgress.practiceCount + 1,
          };

          return {
            ...state,
            progress: {
              ...state.progress,
              [scenarioId]: updatedProgress,
            },
          };
        });
      },

      completeScenario: (scenarioId: string, finalScore: number) => {
        set((state) => {
          const existingProgress = state.progress[scenarioId];
          if (!existingProgress) return state;

          return {
            ...state,
            progress: {
              ...state.progress,
              [scenarioId]: {
                ...existingProgress,
                isCompleted: true,
                bestScore: Math.max(existingProgress.bestScore || 0, finalScore),
              },
            },
            stats: {
              ...state.stats,
              totalSessions: state.stats.totalSessions + 1,
            },
          };
        });

        // 통계 업데이트
        get().updateStats();
      },

      resetProgress: (scenarioId: string) => {
        const { scenarios } = get();
        const scenario = scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return;

        set((state) => ({
          progress: {
            ...state.progress,
            [scenarioId]: {
              scenarioId,
              completedExpressions: [],
              totalExpressions: scenario.expressions.length,
              progress: 0,
              isCompleted: false,
              practiceCount: state.progress[scenarioId]?.practiceCount || 0,
            },
          },
        }));
      },

      // ─────────────────────────────────────
      // 필터
      // ─────────────────────────────────────

      setCategory: (category: ScenarioCategory | null) => {
        set({ selectedCategory: category });
      },

      setLevel: (level: CEFRLevel | null) => {
        set({ selectedLevel: level });
      },

      // ─────────────────────────────────────
      // 표현 네비게이션
      // ─────────────────────────────────────

      nextExpression: () => {
        const { currentScenarioId, currentExpressionIndex, scenarios } = get();
        if (!currentScenarioId) return;

        const scenario = scenarios.find((s) => s.id === currentScenarioId);
        if (!scenario) return;

        const maxIndex = scenario.expressions.length - 1;
        if (currentExpressionIndex < maxIndex) {
          set({ currentExpressionIndex: currentExpressionIndex + 1 });
        }
      },

      prevExpression: () => {
        const { currentExpressionIndex } = get();
        if (currentExpressionIndex > 0) {
          set({ currentExpressionIndex: currentExpressionIndex - 1 });
        }
      },

      goToExpression: (index: number) => {
        const { currentScenarioId, scenarios } = get();
        if (!currentScenarioId) return;

        const scenario = scenarios.find((s) => s.id === currentScenarioId);
        if (!scenario) return;

        if (index >= 0 && index < scenario.expressions.length) {
          set({ currentExpressionIndex: index });
        }
      },

      // ─────────────────────────────────────
      // 조회
      // ─────────────────────────────────────

      getScenario: (scenarioId: string) => {
        return get().scenarios.find((s) => s.id === scenarioId);
      },

      getScenariosByCategory: (category: ScenarioCategory) => {
        return get().scenarios.filter((s) => s.category === category);
      },

      getScenariosByLevel: (level: CEFRLevel) => {
        return get().scenarios.filter((s) => s.level === level);
      },

      getFilteredScenarios: () => {
        const { scenarios, selectedCategory, selectedLevel } = get();
        let filtered = [...scenarios];

        if (selectedCategory) {
          filtered = filtered.filter((s) => s.category === selectedCategory);
        }
        if (selectedLevel) {
          filtered = filtered.filter((s) => s.level === selectedLevel);
        }

        return filtered;
      },

      getProgress: (scenarioId: string) => {
        return get().progress[scenarioId];
      },

      getRecommendedScenarios: () => {
        const { scenarios, progress, selectedLevel } = get();

        // 진행 중이거나 아직 시작 안 한 시나리오 우선
        const recommended = scenarios
          .filter((s) => {
            // 레벨 필터 적용
            if (selectedLevel && s.level !== selectedLevel) return false;

            const prog = progress[s.id];
            // 완료되지 않은 시나리오
            return !prog?.isCompleted;
          })
          .sort((a, b) => {
            const progA = progress[a.id];
            const progB = progress[b.id];

            // 진행 중인 것 우선
            if (progA && !progB) return -1;
            if (!progA && progB) return 1;

            // 진행률 높은 것 우선 (마무리하기 좋은)
            if (progA && progB) {
              return progB.progress - progA.progress;
            }

            // 난이도 낮은 것 우선
            return a.difficulty - b.difficulty;
          })
          .slice(0, 5);

        return recommended;
      },

      // ─────────────────────────────────────
      // 통계 업데이트
      // ─────────────────────────────────────

      updateStats: () => {
        const { scenarios, progress } = get();

        // 전체 표현 수
        const totalExpressions = scenarios.reduce((sum, s) => sum + s.expressions.length, 0);

        // 마스터한 표현 수
        const masteredExpressions = Object.values(progress).reduce(
          (sum, p) => sum + p.completedExpressions.length,
          0
        );

        // 평균 점수
        const scores = Object.values(progress)
          .filter((p) => p.bestScore !== undefined)
          .map((p) => p.bestScore!);
        const averageScore =
          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // 카테고리별 학습 횟수
        const categoryCount: Record<ScenarioCategory, number> = {
          travel: 0,
          business: 0,
          daily: 0,
          social: 0,
          emergency: 0,
        };

        for (const scenarioId of Object.keys(progress)) {
          const scenario = scenarios.find((s) => s.id === scenarioId);
          if (scenario) {
            categoryCount[scenario.category] += progress[scenarioId].practiceCount;
          }
        }

        // 가장 많이 학습한 카테고리
        const favoriteCategory = Object.entries(categoryCount).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] as ScenarioCategory | undefined;

        set((state) => ({
          stats: {
            ...state.stats,
            totalExpressions,
            masteredExpressions,
            averageScore,
            favoriteCategory:
              categoryCount[favoriteCategory || 'daily'] > 0 ? favoriteCategory : undefined,
          },
        }));
      },

      // ─────────────────────────────────────
      // 유틸리티
      // ─────────────────────────────────────

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEYS.SCENARIOS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        progress: state.progress,
        stats: state.stats,
        selectedLevel: state.selectedLevel,
      }),
    }
  )
);
