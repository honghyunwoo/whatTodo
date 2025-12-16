/**
 * 반복 파싱 헬퍼
 */

import { ParsedToken, ParserResult, RecurrenceParsed } from '@/types/naturalLanguage';
import {
  RECURRENCE_PATTERNS,
  WEEKLY_RECURRENCE_WITH_DAY_PATTERN,
  INTERVAL_RECURRENCE_PATTERNS,
  WEEKDAY_MAP,
} from './patterns';

/**
 * 반복 파싱
 */
export function parseRecurrence(input: string): ParserResult<RecurrenceParsed> {
  let remaining = input;
  const tokens: ParsedToken[] = [];

  // 1. 요일 지정 반복 패턴 체크 (매주 월요일)
  const weeklyWithDayMatch = remaining.match(WEEKLY_RECURRENCE_WITH_DAY_PATTERN);
  if (weeklyWithDayMatch) {
    const [fullMatch, dayChar] = weeklyWithDayMatch;
    const weekday = WEEKDAY_MAP[dayChar];

    const recurrence: RecurrenceParsed = {
      type: 'weekly',
      interval: 1,
      daysOfWeek: weekday !== undefined ? [weekday] : undefined,
    };

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'recurrence',
      value: fullMatch,
      parsed: recurrence,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: recurrence, remaining, tokens };
  }

  // 2. N일/주마다 패턴 체크
  const dailyIntervalMatch = remaining.match(INTERVAL_RECURRENCE_PATTERNS.daily);
  if (dailyIntervalMatch) {
    const [fullMatch, intervalStr] = dailyIntervalMatch;
    const interval = Number(intervalStr);

    const recurrence: RecurrenceParsed = {
      type: 'daily',
      interval,
    };

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'recurrence',
      value: fullMatch,
      parsed: recurrence,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: recurrence, remaining, tokens };
  }

  const weeklyIntervalMatch = remaining.match(INTERVAL_RECURRENCE_PATTERNS.weekly);
  if (weeklyIntervalMatch) {
    const [fullMatch, intervalStr] = weeklyIntervalMatch;
    const interval = Number(intervalStr);

    const recurrence: RecurrenceParsed = {
      type: 'weekly',
      interval,
    };

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'recurrence',
      value: fullMatch,
      parsed: recurrence,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: recurrence, remaining, tokens };
  }

  // 3. 기본 반복 패턴 체크 (매일, 매주, 격주, 매월, 매년)
  for (const { pattern, type, interval } of RECURRENCE_PATTERNS) {
    const match = remaining.match(pattern);
    if (match) {
      const [fullMatch] = match;

      const recurrence: RecurrenceParsed = {
        type,
        interval,
      };

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'recurrence',
        value: fullMatch,
        parsed: recurrence,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: recurrence, remaining, tokens };
    }
  }

  return { value: null, remaining, tokens: [] };
}
