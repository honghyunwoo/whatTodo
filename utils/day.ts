/**
 * Day 유틸리티
 *
 * whatTodo의 핵심 개념인 "Day"를 구현
 * Task, Diary, Journal Store를 통합하여 날짜별 데이터를 제공
 */

import type { Task } from '@/types/task';
import type { DayData, DaySummary, WeeklyActivity } from '@/types/day';
import { useTaskStore } from '@/store/taskStore';
import { useDiaryStore } from '@/store/diaryStore';
import { useJournalStore } from '@/store/journalStore';

// ─────────────────────────────────────────────────
// 날짜 유틸리티
// ─────────────────────────────────────────────────

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayString(): string {
  const now = new Date();
  return formatDateToString(now);
}

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 Date 객체로 변환
 */
export function parseStringToDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * N일 전의 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateToString(date);
}

/**
 * 날짜의 요일을 한글로 반환
 */
export function getKoreanDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

// ─────────────────────────────────────────────────
// Summary 생성
// ─────────────────────────────────────────────────

/**
 * Todo 리스트와 Journal Entry로부터 DaySummary 생성
 */
export function generateDaySummary(
  todos: Task[],
  journalEntry?: any,
  diaryEntry?: any
): DaySummary {
  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const learningTime = journalEntry?.learningTime || 0;
  const hasNote = !!(journalEntry?.notes && journalEntry.notes.trim());
  const hasDiary = !!diaryEntry;

  // 간단한 인사이트 생성
  const insight = generateInsight(completionRate, learningTime, total);

  return {
    completedTodos: completed,
    totalTodos: total,
    completionRate,
    learningTime,
    hasNote,
    hasDiary,
    insight,
  };
}

/**
 * 인사이트 메시지 생성
 */
function generateInsight(
  completionRate: number,
  learningTime: number,
  totalTodos: number
): string | undefined {
  // Todo가 없으면 인사이트 없음
  if (totalTodos === 0) return undefined;

  // 완료율 기반 인사이트
  if (completionRate === 100) {
    return '완벽한 하루! 🎉';
  } else if (completionRate >= 80) {
    return '생산적인 하루였어요! 👍';
  } else if (completionRate >= 50) {
    return '괜찮은 하루예요 😊';
  }

  // 학습 시간 기반 인사이트
  if (learningTime >= 30) {
    return '학습도 열심히 하셨네요! 📚';
  }

  return undefined;
}

// ─────────────────────────────────────────────────
// 핵심 함수: DayData 조회
// ─────────────────────────────────────────────────

/**
 * 특정 날짜의 전체 데이터 조회
 *
 * @param date - YYYY-MM-DD 형식 날짜 문자열
 * @returns DayData 객체
 *
 * @example
 * const today = getDayData('2025-01-15');
 * console.log(today.summary.completionRate); // 80
 */
export function getDayData(date: string): DayData {
  // Store에서 상태 가져오기
  const taskStore = useTaskStore.getState();
  const diaryStore = useDiaryStore.getState();
  const journalStore = useJournalStore.getState();

  // 해당 날짜의 Todo 필터링
  const todos = taskStore.tasks.filter((task) => task.dueDate === date);

  // 해당 날짜의 일기
  const diaryEntry = diaryStore.getEntryByDate(date);

  // 해당 날짜의 학습 기록
  const journalEntry = journalStore.getEntry(date);

  // 요약 생성
  const summary = generateDaySummary(todos, journalEntry, diaryEntry);

  return {
    date,
    todos,
    diaryEntry,
    journalEntry,
    summary,
  };
}

/**
 * 오늘의 전체 데이터 조회
 *
 * @returns 오늘의 DayData
 */
export function getTodayData(): DayData {
  const today = getTodayString();
  return getDayData(today);
}

/**
 * 최근 N일의 데이터 조회
 *
 * @param days - 조회할 일수 (기본값: 7)
 * @returns DayData 배열 (최신순)
 *
 * @example
 * const week = getRecentDays(7);
 * week.forEach(day => console.log(day.date, day.summary.completionRate));
 */
export function getRecentDays(days: number = 7): DayData[] {
  const result: DayData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date);
    result.push(getDayData(dateStr));
  }

  return result;
}

/**
 * 특정 기간의 데이터 조회
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns DayData 배열 (시작일부터 종료일까지)
 */
export function getDaysInRange(startDate: string, endDate: string): DayData[] {
  const result: DayData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    result.push(getDayData(formatDateToString(current)));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

// ─────────────────────────────────────────────────
// 주간/월간 통계
// ─────────────────────────────────────────────────

/**
 * 최근 7일의 주간 활동 데이터
 * 차트 표시용
 */
export function getWeeklyActivity(): WeeklyActivity[] {
  const recentDays = getRecentDays(7).reverse(); // 오래된 날짜부터

  return recentDays.map((day) => ({
    date: day.date,
    dayOfWeek: getKoreanDayOfWeek(day.date),
    completedCount: day.summary.completedTodos,
    learningTime: day.summary.learningTime,
    hasActivity: day.summary.completedTodos > 0 || day.summary.learningTime > 0,
  }));
}

/**
 * 특정 월의 모든 날짜의 요약 데이터
 * 캘린더 히트맵용
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 날짜별 DaySummary 맵
 */
export function getMonthSummaries(year: number, month: number): Record<string, DaySummary> {
  const result: Record<string, DaySummary> = {};

  // 해당 월의 첫날과 마지막날
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const current = new Date(firstDay);
  while (current <= lastDay) {
    const dateStr = formatDateToString(current);
    const dayData = getDayData(dateStr);
    result[dateStr] = dayData.summary;
    current.setDate(current.getDate() + 1);
  }

  return result;
}

// ─────────────────────────────────────────────────
// 완료율 기반 유틸리티
// ─────────────────────────────────────────────────

/**
 * 완료율을 색상으로 변환
 * 캘린더 히트맵에서 사용
 *
 * @param rate - 완료율 (0-100)
 * @returns 색상 코드
 */
export function getColorByCompletionRate(rate: number): string {
  if (rate === 0) return '#E5E5E7'; // 회색 (활동 없음)
  if (rate < 50) return '#FFE5B4'; // 연한 주황
  if (rate < 80) return '#FFD580'; // 주황
  return '#4CAF50'; // 초록 (80% 이상)
}

/**
 * 완료율을 이모지로 변환
 *
 * @param rate - 완료율 (0-100)
 * @returns 이모지
 */
export function getEmojiByCompletionRate(rate: number): string {
  if (rate === 100) return '🎉';
  if (rate >= 80) return '✨';
  if (rate >= 50) return '👍';
  if (rate > 0) return '📝';
  return '⚪';
}

// ─────────────────────────────────────────────────
// Streak 계산 (연속 기록일)
// ─────────────────────────────────────────────────

/**
 * 현재 연속 기록일 계산
 * Todo 완료 또는 학습 기록이 있으면 카운트
 *
 * @returns 연속 일수
 */
export function getCurrentStreak(): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date);
    const dayData = getDayData(dateStr);

    const hasActivity =
      dayData.summary.completedTodos > 0 ||
      dayData.summary.learningTime > 0 ||
      dayData.summary.hasDiary;

    if (hasActivity) {
      streak++;
    } else {
      // 연속 끊김
      break;
    }
  }

  return streak;
}
