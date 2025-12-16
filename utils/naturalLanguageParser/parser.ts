/**
 * 자연어 파싱 메인 로직
 */

import { ParsedTodo, ParsedToken, ParsePreview, RecurrenceParsed } from '@/types/naturalLanguage';
import { parseDate } from './dateParser';
import { parseTime } from './timeParser';
import { parsePriority } from './priorityParser';
import { parseTags } from './tagParser';
import { parseRecurrence } from './recurrenceParser';

/**
 * 자연어 입력을 파싱하여 투두 데이터로 변환
 *
 * @param input - 사용자 입력 텍스트
 * @returns ParsedTodo - 파싱된 투두 데이터
 *
 * @example
 * parseNaturalLanguage("내일 오후 3시 팀 회의 #업무 중요")
 * // Returns:
 * // {
 * //   title: "팀 회의",
 * //   dueDate: "2025-12-17",
 * //   dueTime: "15:00",
 * //   tags: ["업무"],
 * //   priority: "high",
 * //   confidence: 0.95,
 * //   ...
 * // }
 */
export function parseNaturalLanguage(input: string): ParsedTodo {
  // 원본 보존
  const originalInput = input;
  let remaining = input.trim();
  const parsedTokens: ParsedToken[] = [];

  // 빈 입력 처리
  if (!remaining) {
    return {
      title: '',
      confidence: 0,
      originalInput,
      parsedTokens: [],
    };
  }

  // 1. 태그 파싱 (먼저 추출 - #이 제목에 포함될 수 있으므로)
  const {
    value: tags,
    remaining: afterTags,
    tokens: tagTokens,
  } = parseTags(remaining);
  remaining = afterTags;
  parsedTokens.push(...tagTokens);

  // 2. 우선순위 파싱
  const {
    value: priority,
    remaining: afterPriority,
    tokens: priorityTokens,
  } = parsePriority(remaining);
  remaining = afterPriority;
  parsedTokens.push(...priorityTokens);

  // 3. 반복 파싱
  const {
    value: recurrence,
    remaining: afterRecurrence,
    tokens: recurrenceTokens,
  } = parseRecurrence(remaining);
  remaining = afterRecurrence;
  parsedTokens.push(...recurrenceTokens);

  // 4. 시간 파싱 (날짜보다 먼저 - "내일 3시"에서 3시를 먼저 추출)
  const {
    value: time,
    remaining: afterTime,
    tokens: timeTokens,
  } = parseTime(remaining);
  remaining = afterTime;
  parsedTokens.push(...timeTokens);

  // 5. 날짜 파싱
  const {
    value: date,
    remaining: afterDate,
    tokens: dateTokens,
  } = parseDate(remaining);
  remaining = afterDate;
  parsedTokens.push(...dateTokens);

  // 6. 나머지 = 제목
  const title = cleanTitle(remaining);

  // 7. 신뢰도 계산
  const confidence = calculateConfidence(parsedTokens, title, originalInput);

  // 8. 결과 반환
  return {
    title: title || originalInput, // 제목이 비면 원본 사용
    ...(date && { dueDate: date }),
    ...(time && { dueTime: time }),
    ...(priority && { priority }),
    ...(tags && tags.length > 0 && { tags }),
    ...(recurrence && { recurrence }),
    confidence,
    originalInput,
    parsedTokens,
  };
}

/**
 * 제목 정리 (불필요한 공백 제거 등)
 */
function cleanTitle(text: string): string {
  return text
    .replace(/\s+/g, ' ') // 연속 공백 → 단일 공백
    .replace(/^\s+|\s+$/g, '') // 앞뒤 공백 제거
    .replace(/^[,.\s]+/, '') // 앞의 구두점 제거
    .replace(/[,.\s]+$/, ''); // 뒤의 구두점 제거
}

/**
 * 파싱 신뢰도 계산
 */
function calculateConfidence(
  tokens: ParsedToken[],
  title: string,
  original: string
): number {
  let confidence = 1.0;

  // 제목이 너무 짧으면 신뢰도 감소
  if (title.length < 2) confidence -= 0.3;

  // 제목이 원본의 대부분이면 파싱 실패로 간주
  if (title.length / original.length > 0.9 && tokens.length === 0) {
    confidence -= 0.5;
  }

  // 토큰이 많을수록 신뢰도 증가 (적절한 파싱)
  confidence += tokens.length * 0.05;

  return Math.max(0, Math.min(1, confidence));
}

/**
 * UI용 미리보기 생성
 */
export function getParsePreview(input: string): ParsePreview {
  const parsed = parseNaturalLanguage(input);

  return {
    hasDate: !!parsed.dueDate,
    hasTime: !!parsed.dueTime,
    hasPriority: !!parsed.priority,
    hasTags: !!parsed.tags?.length,
    hasRecurrence: !!parsed.recurrence,

    dateDisplay: parsed.dueDate ? formatDateDisplay(parsed.dueDate) : undefined,
    timeDisplay: parsed.dueTime ? formatTimeDisplay(parsed.dueTime) : undefined,
    priorityDisplay: parsed.priority
      ? formatPriorityDisplay(parsed.priority)
      : undefined,
    tagsDisplay: parsed.tags?.map((t) => `#${t}`),
    recurrenceDisplay: parsed.recurrence
      ? formatRecurrenceDisplay(parsed.recurrence)
      : undefined,
  };
}

/**
 * 날짜 표시용 포맷
 */
function formatDateDisplay(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === 2) return '모레';
  if (diffDays < 7 && diffDays > 0) {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${weekdays[targetDate.getDay()]}요일`;
  }
  return `${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일`;
}

/**
 * 시간 표시용 포맷
 */
function formatTimeDisplay(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  if (minute === 0) {
    return `${period} ${displayHour}시`;
  }
  return `${period} ${displayHour}시 ${minute}분`;
}

/**
 * 우선순위 표시용 포맷
 */
function formatPriorityDisplay(priority: string): string {
  const map: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };
  return map[priority] || priority;
}

/**
 * 반복 표시용 포맷
 */
function formatRecurrenceDisplay(recurrence: RecurrenceParsed): string {
  const typeMap: Record<string, string> = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };

  let display = typeMap[recurrence.type] || '';

  if (recurrence.interval && recurrence.interval > 1) {
    if (recurrence.type === 'daily') {
      display = `${recurrence.interval}일마다`;
    } else if (recurrence.type === 'weekly') {
      display = `${recurrence.interval}주마다`;
    }
  }

  if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayNames = recurrence.daysOfWeek.map((d) => weekdays[d]).join(', ');
    display = `매주 ${dayNames}요일`;
  }

  return display;
}
