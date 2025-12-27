/**
 * 레슨 기반 학습 시스템 타입
 *
 * 구조: Level > Unit > Lesson > Activity
 * - 6개 레벨 (A1-C2)
 * - 레벨당 4개 유닛
 * - 유닛당 3개 레슨 (총 12레슨/레벨)
 * - 레슨당 6개 활동
 */

import type { ActivityType, CEFRLevel } from './activity';

// ─────────────────────────────────────
// 레슨 (Lesson)
// ─────────────────────────────────────

/** 레슨 메타데이터 */
export interface LessonMeta {
  /** 레슨 ID: "a1-u1-l1" 형식 */
  id: string;

  /** 레슨 제목 (예: "Hello & Goodbye") */
  title: string;

  /** 레슨 부제목/설명 (예: "자기소개하기") */
  subtitle: string;

  /** 예상 학습 시간 (분) - 권장: 10-15분 */
  estimatedMinutes: number;

  /** 핵심 표현 개수 - 권장: 3-5개 */
  keyPhrasesCount: number;

  /** 선수 레슨 ID 목록 */
  prerequisites: string[];

  /** 포함된 활동 타입 */
  activityTypes: ActivityType[];

  /** 레슨 테마 (예: "greetings", "shopping") */
  theme: string;

  /** 학습 목표 */
  objectives: string[];
}

/** 레슨 상태 */
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/** 레슨 표시용 데이터 */
export interface LessonCardData extends LessonMeta {
  /** 현재 상태 */
  status: LessonStatus;

  /** 진행률 (0-100) */
  progress: number;

  /** 획득 점수 */
  score: number;

  /** 유닛 번호 (1-4) */
  unitNumber: number;

  /** 레슨 번호 (1-12) */
  lessonNumber: number;
}

// ─────────────────────────────────────
// 유닛 (Unit)
// ─────────────────────────────────────

/** 유닛 메타데이터 */
export interface UnitMeta {
  /** 유닛 ID: "a1-u1" 형식 */
  id: string;

  /** 유닛 제목 (예: "첫 만남") */
  title: string;

  /** 유닛 설명 */
  description: string;

  /** 포함된 레슨 목록 */
  lessons: LessonMeta[];

  /** 유닛 완료 시 승급 테스트 필요 여부 */
  promotionTestRequired: boolean;

  /** 유닛 아이콘 (이모지) */
  icon: string;

  /** 유닛 테마 컬러 */
  themeColor: string;
}

/** 유닛 상태 */
export type UnitStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/** 유닛 표시용 데이터 */
export interface UnitCardData extends Omit<UnitMeta, 'lessons'> {
  /** 현재 상태 */
  status: UnitStatus;

  /** 완료된 레슨 수 */
  completedLessons: number;

  /** 전체 레슨 수 */
  totalLessons: number;

  /** 진행률 (0-100) */
  progress: number;

  /** 유닛 번호 (1-4) */
  unitNumber: number;
}

// ─────────────────────────────────────
// 레벨 (Level)
// ─────────────────────────────────────

/** 레벨 메타데이터 */
export interface LevelMeta {
  /** 레벨 ID: "a1", "a2" 등 */
  id: string;

  /** CEFR 레벨 */
  level: CEFRLevel;

  /** 레벨 제목 (예: "기초 입문") */
  title: string;

  /** 레벨 설명 */
  description: string;

  /** 레벨 완료 시 도달 목표 */
  goal: string;

  /** 포함된 유닛 목록 */
  units: UnitMeta[];

  /** 레벨 아이콘 */
  icon: string;

  /** 레벨 색상 */
  color: string;

  /** 예상 총 학습 시간 (시간) */
  estimatedHours: number;
}

/** 레벨 상태 */
export type LevelStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/** 레벨 표시용 데이터 */
export interface LevelCardData extends Omit<LevelMeta, 'units'> {
  /** 현재 상태 */
  status: LevelStatus;

  /** 완료된 유닛 수 */
  completedUnits: number;

  /** 전체 유닛 수 */
  totalUnits: number;

  /** 진행률 (0-100) */
  progress: number;
}

// ─────────────────────────────────────
// ID 유틸리티 타입
// ─────────────────────────────────────

/** 레슨 ID 파서 결과 */
export interface ParsedLessonId {
  level: CEFRLevel;
  unitNumber: number;
  lessonNumber: number;
  unitId: string;
  levelId: string;
}

/** 유닛 ID 파서 결과 */
export interface ParsedUnitId {
  level: CEFRLevel;
  unitNumber: number;
  levelId: string;
}

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

/** 레벨당 유닛 수 */
export const UNITS_PER_LEVEL = 4;

/** 유닛당 레슨 수 */
export const LESSONS_PER_UNIT = 3;

/** 레벨당 총 레슨 수 */
export const LESSONS_PER_LEVEL = UNITS_PER_LEVEL * LESSONS_PER_UNIT; // 12

/** 권장 레슨 시간 (분) */
export const RECOMMENDED_LESSON_DURATION = {
  min: 10,
  max: 15,
};

/** 권장 핵심 표현 개수 */
export const RECOMMENDED_KEY_PHRASES = {
  min: 3,
  max: 5,
};
