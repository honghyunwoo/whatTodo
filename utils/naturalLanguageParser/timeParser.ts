/**
 * 시간 파싱 헬퍼
 */

import { ParsedToken, ParserResult } from '@/types/naturalLanguage';
import {
  AM_PM_TIME_PATTERNS,
  SIMPLE_TIME_PATTERNS,
  APPROXIMATE_TIME_MAP,
  APPROXIMATE_TIME_PATTERN,
} from './patterns';

/**
 * 시간 문자열 포맷 (HH:mm)
 */
function formatTime(hour: number, minute: number = 0): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * 시간 추론 (오전/오후 명시 없을 때)
 * - 1-6시: 오후로 추정 (새벽 1시 할 일은 드묾)
 * - 7-11시: 오전으로 추정
 * - 12시: 오후 (정오)
 */
function inferAmPm(hour: number): 'am' | 'pm' {
  if (hour >= 1 && hour <= 6) return 'pm';
  if (hour >= 7 && hour <= 11) return 'am';
  if (hour === 12) return 'pm';
  return 'pm'; // 기본값
}

/**
 * 12시간 -> 24시간 변환
 */
function to24Hour(hour: number, period: 'am' | 'pm'): number {
  if (period === 'am') {
    return hour === 12 ? 0 : hour;
  } else {
    return hour === 12 ? 12 : hour + 12;
  }
}

/**
 * 시간 파싱
 */
export function parseTime(input: string): ParserResult<string> {
  let remaining = input;
  const tokens: ParsedToken[] = [];
  let parsedTime: string | null = null;

  // 1. 오전 시간 패턴 체크
  const amMatch = remaining.match(AM_PM_TIME_PATTERNS.am);
  if (amMatch) {
    const [fullMatch, hourStr, minuteStr] = amMatch;
    const hour = to24Hour(Number(hourStr), 'am');
    const minute = minuteStr ? Number(minuteStr) : 0;
    parsedTime = formatTime(hour, minute);

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'time',
      value: fullMatch,
      parsed: parsedTime,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: parsedTime, remaining, tokens };
  }

  // 2. 오후 시간 패턴 체크
  const pmMatch = remaining.match(AM_PM_TIME_PATTERNS.pm);
  if (pmMatch) {
    const [fullMatch, hourStr, minuteStr] = pmMatch;
    const hour = to24Hour(Number(hourStr), 'pm');
    const minute = minuteStr ? Number(minuteStr) : 0;
    parsedTime = formatTime(hour, minute);

    const startIndex = remaining.indexOf(fullMatch);
    tokens.push({
      type: 'time',
      value: fullMatch,
      parsed: parsedTime,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: parsedTime, remaining, tokens };
  }

  // 3. 24시간 형식 체크 (15:30)
  const twentyFourMatch = remaining.match(SIMPLE_TIME_PATTERNS.twentyFourHour);
  if (twentyFourMatch) {
    const [fullMatch, hourStr, minuteStr] = twentyFourMatch;
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    // 유효한 시간인지 체크
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      parsedTime = formatTime(hour, minute);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'time',
        value: fullMatch,
        parsed: parsedTime,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedTime, remaining, tokens };
    }
  }

  // 4. 대략적 시간 패턴 체크 (아침, 점심, 저녁, 밤)
  const approxMatch = remaining.match(APPROXIMATE_TIME_PATTERN);
  if (approxMatch) {
    const [fullMatch] = approxMatch;
    parsedTime = APPROXIMATE_TIME_MAP[fullMatch];

    if (parsedTime) {
      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'time',
        value: fullMatch,
        parsed: parsedTime,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedTime, remaining, tokens };
    }
  }

  // 5. 단순 시간 패턴 체크 (3시, 3시 30분) - 맨 마지막에 체크
  const simpleMatch = remaining.match(SIMPLE_TIME_PATTERNS.hourMinute);
  if (simpleMatch) {
    const [fullMatch, hourStr, minuteStr] = simpleMatch;
    const rawHour = Number(hourStr);

    // 유효한 시간인지 체크 (1-12시만 허용, 13시 이상은 24시간으로 처리)
    if (rawHour >= 1 && rawHour <= 12) {
      const period = inferAmPm(rawHour);
      const hour = to24Hour(rawHour, period);
      const minute = minuteStr ? Number(minuteStr) : 0;
      parsedTime = formatTime(hour, minute);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'time',
        value: fullMatch,
        parsed: parsedTime,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedTime, remaining, tokens };
    } else if (rawHour >= 0 && rawHour <= 23) {
      // 24시간 형식으로 처리
      const minute = minuteStr ? Number(minuteStr) : 0;
      parsedTime = formatTime(rawHour, minute);

      const startIndex = remaining.indexOf(fullMatch);
      tokens.push({
        type: 'time',
        value: fullMatch,
        parsed: parsedTime,
        startIndex,
        endIndex: startIndex + fullMatch.length,
      });

      remaining = remaining.replace(fullMatch, ' ').trim();
      return { value: parsedTime, remaining, tokens };
    }
  }

  return { value: null, remaining, tokens: [] };
}
