/**
 * 날짜 파싱 헬퍼
 */

import { ParsedToken, ParserResult } from '@/types/naturalLanguage';
import {
  RELATIVE_DATE_PATTERNS,
  SPECIAL_DATE_PATTERNS,
  WEEKDAY_MAP,
  WEEKDAY_PATTERN,
  WEEK_MODIFIER_PATTERN,
  ABSOLUTE_DATE_PATTERNS,
} from './patterns';

/**
 * ISO 날짜 문자열 생성 (YYYY-MM-DD)
 */
function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 오늘 날짜의 자정 시간 반환
 */
function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * 특정 요일까지의 날짜 계산
 * @param targetWeekday - 목표 요일 (0=일, 6=토)
 * @param modifier - 'this' | 'next' | 'auto'
 */
function getNextWeekday(targetWeekday: number, modifier: 'this' | 'next' | 'auto' = 'auto'): Date {
  const today = getToday();
  const currentWeekday = today.getDay();

  let daysToAdd: number;

  if (modifier === 'next') {
    // 다음 주 해당 요일
    daysToAdd = ((targetWeekday - currentWeekday + 7) % 7) + 7;
    if (daysToAdd > 13) daysToAdd -= 7;
  } else if (modifier === 'this') {
    // 이번 주 해당 요일
    daysToAdd = (targetWeekday - currentWeekday + 7) % 7;
    if (daysToAdd === 0 && targetWeekday !== currentWeekday) daysToAdd = 7;
  } else {
    // auto: 오늘 이후 가장 가까운 해당 요일
    daysToAdd = (targetWeekday - currentWeekday + 7) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // 오늘이면 다음 주로
  }

  const result = new Date(today);
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

/**
 * 특수 날짜 계산 (이번 달 말, 다음 달 등)
 */
function getSpecialDate(special: string): Date {
  const today = getToday();

  switch (special) {
    case 'endOfMonth': {
      // 이번 달 말
      const result = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return result;
    }
    case 'nextMonth': {
      // 다음 달 1일
      const result = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return result;
    }
    case 'nextMonthStart': {
      // 다음 달 초 (1일)
      const result = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return result;
    }
    default:
      return today;
  }
}

/**
 * 날짜 파싱
 */
export function parseDate(input: string): ParserResult<string> {
  let remaining = input;
  const tokens: ParsedToken[] = [];
  let parsedDate: string | null = null;

  // 1. 이번 주 / 다음 주 + 요일 패턴 체크 (가장 구체적인 것 먼저)
  const weekModifierMatch = remaining.match(WEEK_MODIFIER_PATTERN);
  if (weekModifierMatch) {
    const [fullMatch, modifier, dayChar] = weekModifierMatch;
    const weekday = WEEKDAY_MAP[dayChar];
    if (weekday !== undefined) {
      const date = getNextWeekday(weekday, modifier === '이번' ? 'this' : 'next');
      parsedDate = toISODateString(date);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'date',
        value: fullMatch,
        parsed: parsedDate,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedDate, remaining, tokens };
    }
  }

  // 2. 절대 날짜 패턴 체크 (2025년 12월 25일)
  const fullDateMatch = remaining.match(ABSOLUTE_DATE_PATTERNS.fullDate);
  if (fullDateMatch) {
    const [fullMatch, year, month, day] = fullDateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    parsedDate = toISODateString(date);

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'date',
      value: fullMatch,
      parsed: parsedDate,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: parsedDate, remaining, tokens };
  }

  // 3. 월/일 패턴 체크 (12월 25일)
  const monthDayMatch = remaining.match(ABSOLUTE_DATE_PATTERNS.monthDay);
  if (monthDayMatch) {
    const [fullMatch, month, day] = monthDayMatch;
    const today = getToday();
    let year = today.getFullYear();

    // 이미 지난 날짜면 내년으로
    const targetDate = new Date(year, Number(month) - 1, Number(day));
    if (targetDate < today) {
      year += 1;
    }

    const date = new Date(year, Number(month) - 1, Number(day));
    parsedDate = toISODateString(date);

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'date',
      value: fullMatch,
      parsed: parsedDate,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: parsedDate, remaining, tokens };
  }

  // 4. 상대적 날짜 패턴 체크 (오늘, 내일, 모레 등)
  for (const { pattern, days } of RELATIVE_DATE_PATTERNS) {
    const match = remaining.match(pattern);
    if (match) {
      const today = getToday();
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      parsedDate = toISODateString(date);

      const startIndex = remaining.indexOf(match[0]);
      tokens.push({
        type: 'date',
        value: match[0],
        parsed: parsedDate,
        startIndex,
        endIndex: startIndex + match[0].length,
      });

      remaining = remaining.replace(match[0], ' ').trim();
      return { value: parsedDate, remaining, tokens };
    }
  }

  // 5. 특수 날짜 패턴 체크 (이번 달 말, 다음 달)
  for (const { pattern, special } of SPECIAL_DATE_PATTERNS) {
    const match = remaining.match(pattern);
    if (match) {
      const date = getSpecialDate(special);
      parsedDate = toISODateString(date);

      const startIndex = remaining.indexOf(match[0]);
      tokens.push({
        type: 'date',
        value: match[0],
        parsed: parsedDate,
        startIndex,
        endIndex: startIndex + match[0].length,
      });

      remaining = remaining.replace(match[0], ' ').trim();
      return { value: parsedDate, remaining, tokens };
    }
  }

  // 6. 단독 요일 패턴 체크 (금요일, 월욜 등)
  const weekdayMatch = remaining.match(WEEKDAY_PATTERN);
  if (weekdayMatch) {
    const [fullMatch, dayChar] = weekdayMatch;
    const weekday = WEEKDAY_MAP[dayChar];
    if (weekday !== undefined) {
      const date = getNextWeekday(weekday, 'auto');
      parsedDate = toISODateString(date);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'date',
        value: fullMatch,
        parsed: parsedDate,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedDate, remaining, tokens };
    }
  }

  // 7. 슬래시/대시 날짜 패턴 체크 (12/25, 12-25)
  const slashDateMatch = remaining.match(ABSOLUTE_DATE_PATTERNS.slashDate);
  if (slashDateMatch) {
    const [fullMatch, month, day] = slashDateMatch;

    // 숫자가 날짜로 적합한지 확인 (1-12월, 1-31일)
    const monthNum = Number(month);
    const dayNum = Number(day);

    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const today = getToday();
      let year = today.getFullYear();

      const targetDate = new Date(year, monthNum - 1, dayNum);
      if (targetDate < today) {
        year += 1;
      }

      const date = new Date(year, monthNum - 1, dayNum);
      parsedDate = toISODateString(date);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'date',
        value: fullMatch,
        parsed: parsedDate,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedDate, remaining, tokens };
    }
  }

  return { value: null, remaining, tokens: [] };
}
