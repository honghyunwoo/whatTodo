/**
 * 레슨 기반 활동 로더
 *
 * 레슨 메타데이터를 로드하고, weekMapping을 통해 기존 활동 파일을 로드합니다.
 * 기존 activityLoader.ts와 병행 사용 가능합니다.
 */

import type { Activity, ActivityType, CEFRLevel } from '@/types/activity';
import type {
  LessonMeta,
  LessonCardData,
  LevelMeta,
  UnitMeta,
  UnitCardData,
  LevelCardData,
  ParsedLessonId,
} from '@/types/lesson';
import { loadActivity, preloadLevel } from './activityLoader';

// Import static lesson meta data
import { LEVEL_METAS } from '@/data/lessons';

// ─────────────────────────────────────
// 레슨 메타데이터 캐시
// ─────────────────────────────────────

type LevelMetaCache = Record<CEFRLevel, LevelMeta | null>;

const levelMetaCache: LevelMetaCache = {
  A1: null,
  A2: null,
  B1: null,
  B2: null,
  C1: null,
  C2: null,
};

// Note: metaLoadingPromises reserved for future concurrent loading optimization

// ─────────────────────────────────────
// 레슨 ID 유틸리티
// ─────────────────────────────────────

/**
 * 레슨 ID 파싱: "a1-u1-l1" → { level: 'A1', unitNumber: 1, lessonNumber: 1 }
 */
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

/**
 * 레슨 ID 생성
 */
export function createLessonId(level: CEFRLevel, unitNumber: number, lessonNumber: number): string {
  return `${level.toLowerCase()}-u${unitNumber}-l${lessonNumber}`;
}

/**
 * 유닛 ID 생성
 */
export function createUnitId(level: CEFRLevel, unitNumber: number): string {
  return `${level.toLowerCase()}-u${unitNumber}`;
}

// ─────────────────────────────────────
// 메타데이터 로더
// ─────────────────────────────────────

/**
 * 레벨 메타데이터 로드 (정적 import 사용)
 */
export async function loadLevelMeta(level: CEFRLevel): Promise<LevelMeta | null> {
  // 캐시 확인
  if (levelMetaCache[level]) {
    return levelMetaCache[level];
  }

  // 정적 import에서 로드
  try {
    const meta = LEVEL_METAS[level];
    if (meta) {
      levelMetaCache[level] = meta;
      return meta;
    }
    return null;
  } catch (error) {
    console.warn(`[lessonLoader] Failed to load ${level} meta:`, error);
    return null;
  }
}

/**
 * 레벨 메타데이터 (동기, 캐시된 경우만)
 */
export function getLevelMeta(level: CEFRLevel): LevelMeta | null {
  return levelMetaCache[level];
}

/**
 * 유닛 메타데이터 조회
 */
export function getUnitMeta(level: CEFRLevel, unitNumber: number): UnitMeta | null {
  const levelMeta = levelMetaCache[level];
  if (!levelMeta) return null;

  return levelMeta.units.find((u) => u.id === createUnitId(level, unitNumber)) || null;
}

/**
 * 레슨 메타데이터 조회
 */
export function getLessonMeta(lessonId: string): (LessonMeta & { weekMapping?: string }) | null {
  const parsed = parseLessonId(lessonId);
  if (!parsed) return null;

  const levelMeta = levelMetaCache[parsed.level];
  if (!levelMeta) return null;

  for (const unit of levelMeta.units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return lesson as LessonMeta & { weekMapping?: string };
    }
  }

  return null;
}

// ─────────────────────────────────────
// 레슨 데이터 로더
// ─────────────────────────────────────

/**
 * 레슨 프리로드 (메타 + 활동 데이터)
 */
export async function preloadLesson(lessonId: string): Promise<boolean> {
  const parsed = parseLessonId(lessonId);
  if (!parsed) return false;

  // 메타데이터 로드
  await loadLevelMeta(parsed.level);

  // 활동 데이터 프리로드
  await preloadLevel(parsed.level);

  return true;
}

/**
 * 레슨의 특정 활동 로드
 */
export function loadLessonActivity(lessonId: string, type: ActivityType): Activity | null {
  const lesson = getLessonMeta(lessonId);
  if (!lesson) return null;

  const parsed = parseLessonId(lessonId);
  if (!parsed) return null;

  // weekMapping을 통해 기존 활동 로드
  const weekId = (lesson as LessonMeta & { weekMapping?: string }).weekMapping;
  if (!weekId) return null;

  return loadActivity(parsed.level, type, weekId);
}

/**
 * 레슨의 모든 활동 로드
 */
export function loadLessonActivities(lessonId: string): Activity[] {
  const lesson = getLessonMeta(lessonId);
  if (!lesson) return [];

  const parsed = parseLessonId(lessonId);
  if (!parsed) return [];

  const weekId = (lesson as LessonMeta & { weekMapping?: string }).weekMapping;
  if (!weekId) return [];

  const activities: Activity[] = [];
  const types: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const type of types) {
    const activity = loadActivity(parsed.level, type, weekId);
    if (activity) {
      activities.push(activity);
    }
  }

  return activities;
}

// ─────────────────────────────────────
// UI용 데이터 변환
// ─────────────────────────────────────

/**
 * 레슨 카드 데이터 생성
 */
export function getLessonCardData(
  lessonId: string,
  progress: { completed: boolean; score: number; activitiesCompleted: string[] } | null,
  isUnlocked: boolean
): LessonCardData | null {
  const lesson = getLessonMeta(lessonId);
  if (!lesson) return null;

  const parsed = parseLessonId(lessonId);
  if (!parsed) return null;

  const activitiesTotal = lesson.activityTypes.length;
  const activitiesCompleted = progress?.activitiesCompleted.length ?? 0;
  const progressPercent =
    activitiesTotal > 0 ? Math.round((activitiesCompleted / activitiesTotal) * 100) : 0;

  let status: LessonCardData['status'];
  if (progress?.completed) {
    status = 'completed';
  } else if (activitiesCompleted > 0) {
    status = 'in_progress';
  } else if (isUnlocked) {
    status = 'available';
  } else {
    status = 'locked';
  }

  return {
    ...lesson,
    status,
    progress: progressPercent,
    score: progress?.score ?? 0,
    unitNumber: parsed.unitNumber,
    lessonNumber: parsed.lessonNumber,
  };
}

/**
 * 유닛 카드 데이터 생성
 */
export function getUnitCardData(
  level: CEFRLevel,
  unitNumber: number,
  lessonsProgress: { lessonId: string; completed: boolean }[]
): UnitCardData | null {
  const unit = getUnitMeta(level, unitNumber);
  if (!unit) return null;

  const totalLessons = unit.lessons.length;
  const completedLessons = lessonsProgress.filter(
    (p) => p.completed && unit.lessons.some((l) => l.id === p.lessonId)
  ).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  let status: UnitCardData['status'];
  if (completedLessons === totalLessons && totalLessons > 0) {
    status = 'completed';
  } else if (completedLessons > 0) {
    status = 'in_progress';
  } else {
    // 첫 번째 유닛이거나 이전 유닛이 완료되었으면 available
    status = unitNumber === 1 ? 'available' : 'locked';
  }

  return {
    id: unit.id,
    title: unit.title,
    description: unit.description,
    promotionTestRequired: unit.promotionTestRequired,
    icon: unit.icon,
    themeColor: unit.themeColor,
    status,
    completedLessons,
    totalLessons,
    progress: progressPercent,
    unitNumber,
  };
}

/**
 * 레벨 카드 데이터 생성
 */
export function getLevelCardData(
  level: CEFRLevel,
  unitsProgress: { unitId: string; completed: boolean }[]
): LevelCardData | null {
  const levelMeta = getLevelMeta(level);
  if (!levelMeta) return null;

  const totalUnits = levelMeta.units.length;
  const completedUnits = unitsProgress.filter(
    (p) => p.completed && levelMeta.units.some((u) => u.id === p.unitId)
  ).length;
  const progressPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  let status: LevelCardData['status'];
  if (completedUnits === totalUnits && totalUnits > 0) {
    status = 'completed';
  } else if (completedUnits > 0) {
    status = 'in_progress';
  } else {
    status = 'available';
  }

  return {
    id: levelMeta.id,
    level: levelMeta.level,
    title: levelMeta.title,
    description: levelMeta.description,
    goal: levelMeta.goal,
    icon: levelMeta.icon,
    color: levelMeta.color,
    estimatedHours: levelMeta.estimatedHours,
    status,
    completedUnits,
    totalUnits,
    progress: progressPercent,
  };
}

// ─────────────────────────────────────
// 레슨 순서 관리
// ─────────────────────────────────────

/**
 * 레벨의 모든 레슨 ID 목록 (순서대로)
 */
export function getLevelLessonIds(level: CEFRLevel): string[] {
  const levelMeta = getLevelMeta(level);
  if (!levelMeta) return [];

  const lessonIds: string[] = [];
  for (const unit of levelMeta.units) {
    for (const lesson of unit.lessons) {
      lessonIds.push(lesson.id);
    }
  }
  return lessonIds;
}

/**
 * 다음 레슨 ID
 */
export function getNextLessonId(currentLessonId: string): string | null {
  const parsed = parseLessonId(currentLessonId);
  if (!parsed) return null;

  const lessonIds = getLevelLessonIds(parsed.level);
  const currentIndex = lessonIds.indexOf(currentLessonId);

  if (currentIndex < 0 || currentIndex >= lessonIds.length - 1) {
    // 다음 레벨의 첫 레슨
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const levelIndex = levels.indexOf(parsed.level);
    if (levelIndex < levels.length - 1) {
      const nextLevel = levels[levelIndex + 1];
      const nextLevelLessons = getLevelLessonIds(nextLevel);
      return nextLevelLessons[0] || null;
    }
    return null;
  }

  return lessonIds[currentIndex + 1];
}

/**
 * 이전 레슨 ID
 */
export function getPrevLessonId(currentLessonId: string): string | null {
  const parsed = parseLessonId(currentLessonId);
  if (!parsed) return null;

  const lessonIds = getLevelLessonIds(parsed.level);
  const currentIndex = lessonIds.indexOf(currentLessonId);

  if (currentIndex <= 0) {
    // 이전 레벨의 마지막 레슨
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const levelIndex = levels.indexOf(parsed.level);
    if (levelIndex > 0) {
      const prevLevel = levels[levelIndex - 1];
      const prevLevelLessons = getLevelLessonIds(prevLevel);
      return prevLevelLessons[prevLevelLessons.length - 1] || null;
    }
    return null;
  }

  return lessonIds[currentIndex - 1];
}

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/**
 * 레슨이 잠금 해제되었는지 확인
 */
export function isLessonUnlocked(lessonId: string, completedLessons: string[]): boolean {
  const parsed = parseLessonId(lessonId);
  if (!parsed) return false;

  // 첫 번째 레벨의 첫 번째 레슨은 항상 잠금 해제
  if (parsed.level === 'A1' && parsed.unitNumber === 1 && parsed.lessonNumber === 1) {
    return true;
  }

  // 선수 레슨 확인
  const lesson = getLessonMeta(lessonId);
  if (!lesson) return false;

  const prerequisites = lesson.prerequisites || [];
  if (prerequisites.length === 0) {
    // 선수 조건 없으면 이전 레슨 완료 여부 확인
    const prevLessonId = getPrevLessonId(lessonId);
    if (!prevLessonId) return true;
    return completedLessons.includes(prevLessonId);
  }

  // 모든 선수 레슨 완료 확인
  return prerequisites.every((prereq) => completedLessons.includes(prereq));
}

/**
 * 레벨 메타 캐시 초기화
 */
export function clearLevelMetaCache(): void {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]) {
    levelMetaCache[level] = null;
  }
}

/**
 * 레벨 메타가 로드되었는지 확인
 */
export function isLevelMetaLoaded(level: CEFRLevel): boolean {
  return levelMetaCache[level] !== null;
}
