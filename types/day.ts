/**
 * Day 관련 타입 정의
 * Todo + Diary + Journal을 통합한 "하루" 개념
 */

import type { Task } from './task';
import type { DiaryEntry } from '@/store/diaryStore';
import type { JournalEntry } from './journal';

/**
 * 하루 전체 데이터
 * 기존 Store들의 데이터를 날짜 기준으로 통합한 뷰
 */
export interface DayData {
  /**
   * 날짜 (YYYY-MM-DD 형식)
   * @example "2025-01-15"
   */
  date: string;

  /** 해당 날짜의 Todo 리스트 */
  todos: Task[];

  /** 해당 날짜의 일기 (있다면) */
  diaryEntry?: DiaryEntry;

  /** 해당 날짜의 학습 기록 (있다면) */
  journalEntry?: JournalEntry;

  /** 자동 생성된 요약 */
  summary: DaySummary;
}

/**
 * 하루 요약 정보
 * 사용자에게 보여줄 자동 생성된 통계
 */
export interface DaySummary {
  /** 완료된 Todo 개수 */
  completedTodos: number;

  /** 전체 Todo 개수 */
  totalTodos: number;

  /** 완료율 (0-100) */
  completionRate: number;

  /** 학습 시간 (분) */
  learningTime: number;

  /** 한 줄 기록이 있는지 여부 */
  hasNote: boolean;

  /** 일기가 있는지 여부 */
  hasDiary: boolean;

  /** 간단한 인사이트 메시지 (선택적) */
  insight?: string;
}

/**
 * 한 줄 기록
 * 빠르게 입력하는 간단한 메모
 */
export interface OneLineNote {
  /** 기록 내용 */
  text: string;

  /** 기분 (선택적) */
  mood?: 'good' | 'normal' | 'bad';

  /** 생성 시간 */
  createdAt: string;
}

/**
 * 월간 Day 데이터 맵
 * 캘린더에서 사용하기 위한 날짜별 요약 정보
 */
export type MonthDayMap = Record<string, DaySummary>;

/**
 * 주간 활동 데이터
 * 주간 차트에 사용
 */
export interface WeeklyActivity {
  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 요일 (일, 월, 화...) */
  dayOfWeek: string;

  /** 완료한 Todo 개수 */
  completedCount: number;

  /** 학습 시간 (분) */
  learningTime: number;

  /** 활동 여부 */
  hasActivity: boolean;
}
