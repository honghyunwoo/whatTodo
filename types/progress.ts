/**
 * 레슨 기반 진행률 타입
 *
 * 학습 진행 상태를 레슨, 유닛, 레벨 단위로 추적
 */

import type { ActivityType, CEFRLevel } from './activity';

// ─────────────────────────────────────
// 활동 진행률
// ─────────────────────────────────────

/** 단일 활동 진행 결과 */
export interface ActivityProgress {
  /** 활동 타입 */
  type: ActivityType;

  /** 완료 여부 */
  completed: boolean;

  /** 획득 점수 (0-100) */
  score: number;

  /** 소요 시간 (초) */
  timeSpent: number;

  /** 마지막 시도 시간 (ISO string) */
  lastAttempt: string;

  /** 시도 횟수 */
  attempts: number;

  // 활동별 상세 정보
  /** vocabulary: 숙달한 단어 수 */
  wordsMastered?: number;

  /** grammar/listening/reading: 정답 수 */
  exercisesCorrect?: number;

  /** grammar/listening/reading: 전체 문제 수 */
  exercisesTotal?: number;

  /** speaking/writing: 평가 결과 */
  evaluationScore?: number;
}

// ─────────────────────────────────────
// 레슨 진행률
// ─────────────────────────────────────

/** 레슨 진행률 */
export interface LessonProgress {
  /** 레슨 ID */
  lessonId: string;

  /** 레벨 */
  level: CEFRLevel;

  /** 완료된 활동 목록 */
  activitiesCompleted: ActivityType[];

  /** 활동별 상세 진행률 */
  activityProgress: Partial<Record<ActivityType, ActivityProgress>>;

  /** 레슨 총 점수 (활동 점수 평균) */
  score: number;

  /** 레슨 완료 여부 */
  completed: boolean;

  /** 레슨 테스트 통과 여부 */
  testPassed: boolean;

  /** 시작 시간 */
  startedAt: string;

  /** 완료 시간 */
  completedAt?: string;

  /** 총 학습 시간 (초) */
  totalTimeSpent: number;
}

/** 레슨 진행률 요약 (UI 표시용) */
export interface LessonProgressSummary {
  lessonId: string;
  progress: number; // 0-100
  score: number;
  completed: boolean;
  testPassed: boolean;
  activitiesCompleted: number;
  activitiesTotal: number;
}

// ─────────────────────────────────────
// 유닛 진행률
// ─────────────────────────────────────

/** 유닛 진행률 */
export interface UnitProgress {
  /** 유닛 ID */
  unitId: string;

  /** 레벨 */
  level: CEFRLevel;

  /** 완료된 레슨 ID 목록 */
  lessonsCompleted: string[];

  /** 유닛 총 점수 (레슨 점수 평균) */
  score: number;

  /** 유닛 완료 여부 (모든 레슨 완료) */
  completed: boolean;

  /** 승급 테스트 통과 여부 */
  promotionTestPassed: boolean;

  /** 시작 시간 */
  startedAt: string;

  /** 완료 시간 */
  completedAt?: string;
}

/** 유닛 진행률 요약 */
export interface UnitProgressSummary {
  unitId: string;
  progress: number; // 0-100
  score: number;
  completed: boolean;
  promotionTestPassed: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
}

// ─────────────────────────────────────
// 레벨 진행률
// ─────────────────────────────────────

/** 레벨 진행률 */
export interface LevelProgress {
  /** 레벨 ID */
  levelId: string;

  /** CEFR 레벨 */
  level: CEFRLevel;

  /** 완료된 유닛 ID 목록 */
  unitsCompleted: string[];

  /** 레벨 총 점수 (유닛 점수 평균) */
  score: number;

  /** 레벨 완료 여부 (모든 유닛 완료) */
  completed: boolean;

  /** 시작 시간 */
  startedAt: string;

  /** 완료 시간 */
  completedAt?: string;
}

/** 레벨 진행률 요약 */
export interface LevelProgressSummary {
  levelId: string;
  level: CEFRLevel;
  progress: number; // 0-100
  score: number;
  completed: boolean;
  unitsCompleted: number;
  unitsTotal: number;
}

// ─────────────────────────────────────
// 학습 세션
// ─────────────────────────────────────

/** 현재 학습 세션 상태 */
export interface LearningSession {
  /** 현재 레슨 ID */
  currentLessonId: string | null;

  /** 현재 활동 타입 */
  currentActivityType: ActivityType | null;

  /** 세션 시작 시간 */
  startedAt: string | null;

  /** 오늘 완료한 레슨 수 */
  lessonsCompletedToday: number;

  /** 오늘 학습 시간 (초) */
  timeSpentToday: number;
}

// ─────────────────────────────────────
// 통계
// ─────────────────────────────────────

/** 학습 통계 */
export interface LearningStats {
  /** 총 완료 레슨 수 */
  totalLessonsCompleted: number;

  /** 총 학습 시간 (초) */
  totalTimeSpent: number;

  /** 평균 점수 */
  averageScore: number;

  /** 현재 연속 학습일 */
  currentStreak: number;

  /** 최장 연속 학습일 */
  longestStreak: number;

  /** 마지막 학습 날짜 */
  lastStudyDate: string;

  /** 레벨별 진행률 */
  levelProgress: Partial<Record<CEFRLevel, LevelProgressSummary>>;
}

// ─────────────────────────────────────
// 마이그레이션 호환
// ─────────────────────────────────────

/**
 * 기존 LearnProgress → LessonProgress 변환용
 * @deprecated 마이그레이션 완료 후 제거
 */
export interface LegacyProgressMapping {
  /** 기존 weekId */
  weekId: string;

  /** 새 lessonId */
  lessonId: string;

  /** 매핑된 유닛 번호 */
  unitNumber: number;

  /** 매핑된 레슨 번호 */
  lessonNumber: number;
}

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

/** 레슨 완료 기준 점수 (70%) */
export const LESSON_PASS_THRESHOLD = 70;

/** 테스트 통과 기준 점수 (70%) */
export const TEST_PASS_THRESHOLD = 70;

/** 일일 목표 기본값 (레슨 수) */
export const DEFAULT_DAILY_GOAL = 1;

/** 최대 일일 목표 (레슨 수) */
export const MAX_DAILY_GOAL = 10;
