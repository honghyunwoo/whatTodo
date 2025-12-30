/**
 * 레슨 기반 학습 Store
 *
 * 레슨 → 유닛 → 레벨 계층 구조로 진행률 관리
 * 기존 learnStore와 병행 사용 (점진적 마이그레이션)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import type { ActivityType, CEFRLevel } from '@/types/activity';
import type {
  LessonMeta,
  LessonStatus,
  ParsedLessonId,
  ParsedUnitId,
  UnitMeta,
  LESSONS_PER_UNIT,
  UNITS_PER_LEVEL,
} from '@/types/lesson';
import type {
  ActivityProgress,
  LearningSession,
  LearningStats,
  LessonProgress,
  LevelProgress,
  UnitProgress,
  LESSON_PASS_THRESHOLD,
} from '@/types/progress';
import { isStoreHydrated } from '@/hooks/useStoreReady';
import { useDiaryStore } from './diaryStore';
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

/** 스토리지 키 (신규) */
const LESSON_STORAGE_KEY = 'lesson-progress';

// ─────────────────────────────────────
// State & Actions
// ─────────────────────────────────────

interface LessonState {
  /** 현재 레벨 */
  currentLevel: CEFRLevel;

  /** 현재 레슨 ID (진행 중인 레슨) */
  currentLessonId: string | null;

  /** 레슨별 진행률 */
  lessonProgress: LessonProgress[];

  /** 유닛별 진행률 */
  unitProgress: UnitProgress[];

  /** 레벨별 진행률 */
  levelProgress: LevelProgress[];

  /** 현재 학습 세션 */
  session: LearningSession;

  /** 통계 */
  stats: LearningStats;
}

interface LessonActions {
  // ─── 레슨 관리 ───
  /** 레슨 시작 */
  startLesson: (lessonId: string) => void;

  /** 활동 완료 */
  completeActivity: (
    lessonId: string,
    type: ActivityType,
    result: Partial<ActivityProgress>
  ) => void;

  /** 레슨 완료 */
  completeLesson: (lessonId: string, testPassed?: boolean) => void;

  /** 레슨 진행률 조회 */
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;

  /** 레슨 상태 조회 */
  getLessonStatus: (lessonId: string) => LessonStatus;

  // ─── 유닛 관리 ───
  /** 유닛 진행률 조회 */
  getUnitProgress: (unitId: string) => UnitProgress | undefined;

  /** 유닛 완료 처리 */
  completeUnit: (unitId: string, promotionTestPassed: boolean) => void;

  // ─── 레벨 관리 ───
  /** 현재 레벨 설정 */
  setCurrentLevel: (level: CEFRLevel) => void;

  /** 레벨 진행률 조회 */
  getLevelProgress: (levelId: string) => LevelProgress | undefined;

  // ─── 세션 관리 ───
  /** 세션 업데이트 */
  updateSession: (updates: Partial<LearningSession>) => void;

  /** 오늘 학습 시간 추가 */
  addTimeSpentToday: (seconds: number) => void;

  // ─── 통계 ───
  /** 통계 업데이트 */
  updateStats: () => void;

  /** 스트릭 업데이트 */
  updateStreak: () => void;

  // ─── 유틸리티 ───
  /** 다음 레슨 ID 조회 */
  getNextLessonId: (currentLessonId: string) => string | null;

  /** 레슨 잠금 해제 여부 */
  isLessonUnlocked: (lessonId: string) => boolean;

  /** 초기화 */
  resetProgress: () => void;
}

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/** 레슨 ID 파싱: "a1-u1-l1" → { level: 'A1', unitNumber: 1, lessonNumber: 1 } */
export function parseLessonId(lessonId: string): ParsedLessonId | null {
  const match = lessonId.match(/^(a[12]|b[12]|c[12])-u(\d+)-l(\d+)$/i);
  if (!match) return null;

  const level = match[1].toUpperCase() as CEFRLevel;
  const unitNumber = parseInt(match[2], 10);
  const lessonNumber = parseInt(match[3], 10);

  return {
    level,
    unitNumber,
    lessonNumber,
    unitId: `${level.toLowerCase()}-u${unitNumber}`,
    levelId: level.toLowerCase(),
  };
}

/** 유닛 ID 파싱: "a1-u1" → { level: 'A1', unitNumber: 1 } */
export function parseUnitId(unitId: string): ParsedUnitId | null {
  const match = unitId.match(/^(a[12]|b[12]|c[12])-u(\d+)$/i);
  if (!match) return null;

  const level = match[1].toUpperCase() as CEFRLevel;
  const unitNumber = parseInt(match[2], 10);

  return {
    level,
    unitNumber,
    levelId: level.toLowerCase(),
  };
}

/** 레슨 ID 생성 */
export function createLessonId(level: CEFRLevel, unitNumber: number, lessonNumber: number): string {
  return `${level.toLowerCase()}-u${unitNumber}-l${lessonNumber}`;
}

/** 유닛 ID 생성 */
export function createUnitId(level: CEFRLevel, unitNumber: number): string {
  return `${level.toLowerCase()}-u${unitNumber}`;
}

/** 레벨 ID 생성 */
export function createLevelId(level: CEFRLevel): string {
  return level.toLowerCase();
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialSession: LearningSession = {
  currentLessonId: null,
  currentActivityType: null,
  startedAt: null,
  lessonsCompletedToday: 0,
  timeSpentToday: 0,
};

const initialStats: LearningStats = {
  totalLessonsCompleted: 0,
  totalTimeSpent: 0,
  averageScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  levelProgress: {},
};

// ─────────────────────────────────────
// Store 생성
// ─────────────────────────────────────

export const useLessonStore = create<LessonState & LessonActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentLevel: 'A1',
      currentLessonId: null,
      lessonProgress: [],
      unitProgress: [],
      levelProgress: [],
      session: initialSession,
      stats: initialStats,

      // ─── 레슨 관리 ───

      startLesson: (lessonId) => {
        const parsed = parseLessonId(lessonId);
        if (!parsed) return;

        const now = new Date().toISOString();

        set((state) => {
          // 기존 진행률 확인
          const existingIdx = state.lessonProgress.findIndex((p) => p.lessonId === lessonId);

          if (existingIdx >= 0) {
            // 이미 시작된 레슨
            return {
              currentLessonId: lessonId,
              session: {
                ...state.session,
                currentLessonId: lessonId,
                startedAt: now,
              },
            };
          }

          // 새 레슨 시작
          const newProgress: LessonProgress = {
            lessonId,
            level: parsed.level,
            activitiesCompleted: [],
            activityProgress: {},
            score: 0,
            completed: false,
            testPassed: false,
            startedAt: now,
            totalTimeSpent: 0,
          };

          return {
            currentLessonId: lessonId,
            lessonProgress: [...state.lessonProgress, newProgress],
            session: {
              ...state.session,
              currentLessonId: lessonId,
              startedAt: now,
            },
          };
        });
      },

      completeActivity: (lessonId, type, result) => {
        const now = new Date().toISOString();

        set((state) => {
          const idx = state.lessonProgress.findIndex((p) => p.lessonId === lessonId);
          if (idx < 0) return state;

          const updated = [...state.lessonProgress];
          const lesson = { ...updated[idx] };

          // 활동 진행률 업데이트
          const activityProgress: ActivityProgress = {
            type,
            completed: true,
            score: result.score ?? 0,
            timeSpent: result.timeSpent ?? 0,
            lastAttempt: now,
            attempts: (lesson.activityProgress[type]?.attempts ?? 0) + 1,
            ...result,
          };

          lesson.activityProgress = {
            ...lesson.activityProgress,
            [type]: activityProgress,
          };

          // 완료 목록에 추가
          if (!lesson.activitiesCompleted.includes(type)) {
            lesson.activitiesCompleted = [...lesson.activitiesCompleted, type];
          }

          // 레슨 점수 계산 (활동 점수 평균)
          const scores = Object.values(lesson.activityProgress).map((p) => p.score);
          lesson.score =
            scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

          // 총 학습 시간 업데이트
          lesson.totalTimeSpent += result.timeSpent ?? 0;

          updated[idx] = lesson;

          return { lessonProgress: updated };
        });

        // 보상 지급 (Hydration 체크 후 안전하게 호출)
        if (isStoreHydrated('reward')) {
          const starsEarned = useRewardStore.getState().earnLearningStars(type, result.score ?? 0);
          if (__DEV__) {
            console.log('[Lesson] Earned ' + starsEarned + ' stars for ' + type);
          }
        }

        // 일기에 학습 기록 추가
        if (isStoreHydrated('diary')) {
          useDiaryStore.getState().addLearningRecord({
            activityType: type,
            lessonId,
            score: result.score ?? 0,
            timeSpent: result.timeSpent,
          });
        }

        // 통계 업데이트
        get().updateStats();
      },

      completeLesson: (lessonId, testPassed = true) => {
        const now = new Date().toISOString();
        const parsed = parseLessonId(lessonId);
        if (!parsed) return;

        set((state) => {
          const idx = state.lessonProgress.findIndex((p) => p.lessonId === lessonId);
          if (idx < 0) return state;

          const updated = [...state.lessonProgress];
          const lesson = { ...updated[idx] };

          lesson.completed = true;
          lesson.testPassed = testPassed;
          lesson.completedAt = now;

          updated[idx] = lesson;

          // 세션 업데이트
          const newSession = {
            ...state.session,
            lessonsCompletedToday: state.session.lessonsCompletedToday + 1,
          };

          return {
            lessonProgress: updated,
            session: newSession,
          };
        });

        // 유닛 진행률 업데이트
        const { lessonProgress, unitProgress } = get();
        const unitLessons = lessonProgress.filter((p) => {
          const pParsed = parseLessonId(p.lessonId);
          return pParsed?.unitId === parsed.unitId;
        });

        const completedCount = unitLessons.filter((p) => p.completed).length;

        // 유닛 진행률 업데이트 또는 생성
        set((state) => {
          const unitIdx = state.unitProgress.findIndex((u) => u.unitId === parsed.unitId);
          const now = new Date().toISOString();

          if (unitIdx >= 0) {
            const updated = [...state.unitProgress];
            const unit = { ...updated[unitIdx] };

            if (!unit.lessonsCompleted.includes(lessonId)) {
              unit.lessonsCompleted = [...unit.lessonsCompleted, lessonId];
            }

            // 유닛 점수 계산
            const unitLessonScores = unitLessons.map((l) => l.score);
            unit.score =
              unitLessonScores.length > 0
                ? Math.round(unitLessonScores.reduce((a, b) => a + b, 0) / unitLessonScores.length)
                : 0;

            updated[unitIdx] = unit;
            return { unitProgress: updated };
          }

          // 새 유닛 진행률 생성
          const newUnitProgress: UnitProgress = {
            unitId: parsed.unitId,
            level: parsed.level,
            lessonsCompleted: [lessonId],
            score: 0,
            completed: false,
            promotionTestPassed: false,
            startedAt: now,
          };

          return { unitProgress: [...state.unitProgress, newUnitProgress] };
        });

        // 스트릭 업데이트
        get().updateStreak();
        get().updateStats();
      },

      getLessonProgress: (lessonId) => {
        return get().lessonProgress.find((p) => p.lessonId === lessonId);
      },

      getLessonStatus: (lessonId) => {
        const { lessonProgress, isLessonUnlocked } = get();
        const progress = lessonProgress.find((p) => p.lessonId === lessonId);

        if (progress?.completed) return 'completed';
        if (progress?.startedAt) return 'in_progress';
        if (isLessonUnlocked(lessonId)) return 'available';
        return 'locked';
      },

      // ─── 유닛 관리 ───

      getUnitProgress: (unitId) => {
        return get().unitProgress.find((u) => u.unitId === unitId);
      },

      completeUnit: (unitId, promotionTestPassed) => {
        const now = new Date().toISOString();
        const parsed = parseUnitId(unitId);
        if (!parsed) return;

        set((state) => {
          const idx = state.unitProgress.findIndex((u) => u.unitId === unitId);
          if (idx < 0) return state;

          const updated = [...state.unitProgress];
          const unit = { ...updated[idx] };

          unit.completed = true;
          unit.promotionTestPassed = promotionTestPassed;
          unit.completedAt = now;

          updated[idx] = unit;

          return { unitProgress: updated };
        });

        // 레벨 진행률 업데이트
        get().updateStats();
      },

      // ─── 레벨 관리 ───

      setCurrentLevel: (level) => {
        set({ currentLevel: level });
      },

      getLevelProgress: (levelId) => {
        return get().levelProgress.find((l) => l.levelId === levelId);
      },

      // ─── 세션 관리 ───

      updateSession: (updates) => {
        set((state) => ({
          session: { ...state.session, ...updates },
        }));
      },

      addTimeSpentToday: (seconds) => {
        set((state) => ({
          session: {
            ...state.session,
            timeSpentToday: state.session.timeSpentToday + seconds,
          },
        }));
      },

      // ─── 통계 ───

      updateStats: () => {
        const { lessonProgress, stats } = get();

        const completedLessons = lessonProgress.filter((p) => p.completed);
        const totalLessonsCompleted = completedLessons.length;
        const totalTimeSpent = lessonProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0);
        const averageScore =
          completedLessons.length > 0
            ? Math.round(
                completedLessons.reduce((sum, p) => sum + p.score, 0) / completedLessons.length
              )
            : 0;

        set({
          stats: {
            ...stats,
            totalLessonsCompleted,
            totalTimeSpent,
            averageScore,
          },
        });
      },

      updateStreak: () => {
        const today = new Date().toDateString();
        const { stats } = get();

        if (stats.lastStudyDate === today) {
          return; // 오늘 이미 학습함
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak: number;
        if (stats.lastStudyDate === yesterdayStr) {
          newStreak = stats.currentStreak + 1;
        } else {
          newStreak = 1;
        }

        set({
          stats: {
            ...stats,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, stats.longestStreak),
            lastStudyDate: today,
          },
        });
      },

      // ─── 유틸리티 ───

      getNextLessonId: (currentLessonId) => {
        const parsed = parseLessonId(currentLessonId);
        if (!parsed) return null;

        const { unitNumber, lessonNumber, level } = parsed;

        // 같은 유닛 내 다음 레슨
        if (lessonNumber < 3) {
          return createLessonId(level, unitNumber, lessonNumber + 1);
        }

        // 다음 유닛 첫 레슨
        if (unitNumber < 4) {
          return createLessonId(level, unitNumber + 1, 1);
        }

        // 다음 레벨 첫 레슨
        const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const levelIdx = levels.indexOf(level);
        if (levelIdx < levels.length - 1) {
          return createLessonId(levels[levelIdx + 1], 1, 1);
        }

        return null; // 모든 레벨 완료
      },

      isLessonUnlocked: (lessonId) => {
        const parsed = parseLessonId(lessonId);
        if (!parsed) return false;

        const { unitNumber, lessonNumber, level } = parsed;

        // 첫 번째 레벨의 첫 번째 유닛의 첫 번째 레슨은 항상 잠금 해제
        if (level === 'A1' && unitNumber === 1 && lessonNumber === 1) {
          return true;
        }

        // 이전 레슨 완료 여부 확인
        let prevLessonId: string | null = null;

        if (lessonNumber > 1) {
          prevLessonId = createLessonId(level, unitNumber, lessonNumber - 1);
        } else if (unitNumber > 1) {
          prevLessonId = createLessonId(level, unitNumber - 1, 3);
        } else {
          // 이전 레벨의 마지막 레슨
          const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
          const levelIdx = levels.indexOf(level);
          if (levelIdx > 0) {
            prevLessonId = createLessonId(levels[levelIdx - 1], 4, 3);
          }
        }

        if (!prevLessonId) return true;

        const prevProgress = get().getLessonProgress(prevLessonId);
        return prevProgress?.completed ?? false;
      },

      resetProgress: () => {
        set({
          currentLessonId: null,
          lessonProgress: [],
          unitProgress: [],
          levelProgress: [],
          session: initialSession,
          stats: initialStats,
        });
      },
    }),
    {
      name: LESSON_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─────────────────────────────────────
// 내보내기
// ─────────────────────────────────────

export { ACTIVITY_TYPES };
