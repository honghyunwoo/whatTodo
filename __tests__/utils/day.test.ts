/**
 * Day 유틸리티 테스트
 */

import {
  formatDateToString,
  parseStringToDate,
  getTodayString,
  getDaysAgo,
  getKoreanDayOfWeek,
  generateDaySummary,
  getColorByCompletionRate,
  getEmojiByCompletionRate,
} from '@/utils/day';
import type { Task } from '@/types/task';

describe('Day Utils - 날짜 유틸리티', () => {
  test('formatDateToString - Date를 YYYY-MM-DD로 변환', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    const result = formatDateToString(date);
    expect(result).toBe('2025-01-15');
  });

  test('parseStringToDate - YYYY-MM-DD를 Date로 변환', () => {
    const dateStr = '2025-01-15';
    const result = parseStringToDate(dateStr);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0); // 0-indexed
    expect(result.getDate()).toBe(15);
  });

  test('getTodayString - 오늘 날짜를 YYYY-MM-DD로 반환', () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('getDaysAgo - N일 전 날짜 반환', () => {
    const result = getDaysAgo(7);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('getKoreanDayOfWeek - 요일을 한글로 반환', () => {
    // 2025-01-15는 수요일
    const result = getKoreanDayOfWeek('2025-01-15');
    expect(result).toBe('수');
  });
});

describe('Day Utils - Summary 생성', () => {
  test('generateDaySummary - Todo만 있을 때', () => {
    const todos: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        category: 'work',
        priority: 'medium',
        completed: true,
        subtasks: [],
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15',
      },
      {
        id: '2',
        title: 'Task 2',
        category: 'work',
        priority: 'medium',
        completed: false,
        subtasks: [],
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15',
      },
    ];

    const summary = generateDaySummary(todos);

    expect(summary.completedTodos).toBe(1);
    expect(summary.totalTodos).toBe(2);
    expect(summary.completionRate).toBe(50);
    expect(summary.learningTime).toBe(0);
    expect(summary.hasNote).toBe(false);
    expect(summary.hasDiary).toBe(false);
  });

  test('generateDaySummary - 100% 완료 시 인사이트', () => {
    const todos: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        category: 'work',
        priority: 'medium',
        completed: true,
        subtasks: [],
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15',
      },
    ];

    const summary = generateDaySummary(todos);

    expect(summary.completionRate).toBe(100);
    expect(summary.insight).toBe('완벽한 하루! 🎉');
  });

  test('generateDaySummary - 학습 기록 포함', () => {
    const todos: Task[] = [];
    const journalEntry = {
      learningTime: 30,
      notes: '오늘 열심히 공부했다',
    };

    const summary = generateDaySummary(todos, journalEntry);

    expect(summary.learningTime).toBe(30);
    expect(summary.hasNote).toBe(true);
  });

  test('generateDaySummary - 빈 notes는 hasNote = false', () => {
    const todos: Task[] = [];
    const journalEntry = {
      learningTime: 0,
      notes: '   ', // 공백만
    };

    const summary = generateDaySummary(todos, journalEntry);

    expect(summary.hasNote).toBe(false);
  });

  test('generateDaySummary - 일기 있을 때', () => {
    const todos: Task[] = [];
    const diaryEntry = {
      id: '1',
      date: '2025-01-15',
      title: '오늘 하루',
      content: '좋은 하루였다',
    };

    const summary = generateDaySummary(todos, undefined, diaryEntry);

    expect(summary.hasDiary).toBe(true);
  });
});

describe('Day Utils - 색상/이모지 변환', () => {
  test('getColorByCompletionRate - 완료율별 색상', () => {
    expect(getColorByCompletionRate(0)).toBe('#E5E5E7');
    expect(getColorByCompletionRate(30)).toBe('#FFE5B4');
    expect(getColorByCompletionRate(60)).toBe('#FFD580');
    expect(getColorByCompletionRate(90)).toBe('#4CAF50');
  });

  test('getEmojiByCompletionRate - 완료율별 이모지', () => {
    expect(getEmojiByCompletionRate(0)).toBe('⚪');
    expect(getEmojiByCompletionRate(30)).toBe('📝');
    expect(getEmojiByCompletionRate(60)).toBe('👍');
    expect(getEmojiByCompletionRate(85)).toBe('✨');
    expect(getEmojiByCompletionRate(100)).toBe('🎉');
  });
});

describe('Day Utils - 엣지 케이스', () => {
  test('generateDaySummary - Todo 없고 학습도 없을 때', () => {
    const summary = generateDaySummary([]);

    expect(summary.completedTodos).toBe(0);
    expect(summary.totalTodos).toBe(0);
    expect(summary.completionRate).toBe(0);
    expect(summary.learningTime).toBe(0);
    expect(summary.hasNote).toBe(false);
    expect(summary.insight).toBeUndefined();
  });

  test('formatDateToString - 월/일이 한 자리 수일 때 패딩', () => {
    const date = new Date('2025-01-05T00:00:00');
    const result = formatDateToString(date);
    expect(result).toBe('2025-01-05'); // 05로 패딩
  });

  test('getKoreanDayOfWeek - 모든 요일 테스트', () => {
    expect(getKoreanDayOfWeek('2025-01-12')).toBe('일'); // 일요일
    expect(getKoreanDayOfWeek('2025-01-13')).toBe('월'); // 월요일
    expect(getKoreanDayOfWeek('2025-01-14')).toBe('화'); // 화요일
    expect(getKoreanDayOfWeek('2025-01-15')).toBe('수'); // 수요일
    expect(getKoreanDayOfWeek('2025-01-16')).toBe('목'); // 목요일
    expect(getKoreanDayOfWeek('2025-01-17')).toBe('금'); // 금요일
    expect(getKoreanDayOfWeek('2025-01-18')).toBe('토'); // 토요일
  });

  test('generateDaySummary - 모든 Todo 미완료일 때', () => {
    const todos: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        category: 'work',
        priority: 'medium',
        completed: false,
        subtasks: [],
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15',
      },
    ];

    const summary = generateDaySummary(todos);

    expect(summary.completionRate).toBe(0);
    expect(summary.insight).toBeUndefined();
  });
});
