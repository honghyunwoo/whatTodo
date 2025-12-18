/**
 * 우선순위 파싱 헬퍼
 */

import { ParsedToken, ParserResult } from '@/types/naturalLanguage';
import { PRIORITY_PATTERNS } from './patterns';

type Priority = 'high' | 'medium' | 'low';

/**
 * 우선순위 파싱
 */
export function parsePriority(input: string): ParserResult<Priority> {
  let remaining = input;
  const tokens: ParsedToken[] = [];

  // 높음 우선순위 체크 (먼저 체크 - 더 구체적)
  const highMatch = remaining.match(PRIORITY_PATTERNS.high);
  if (highMatch) {
    const [fullMatch] = highMatch;
    const startIndex = remaining.indexOf(fullMatch);

    tokens.push({
      type: 'priority',
      value: fullMatch,
      parsed: 'high',
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: 'high', remaining, tokens };
  }

  // 낮음 우선순위 체크 (medium보다 먼저 - "나중에"가 "!"보다 구체적)
  const lowMatch = remaining.match(PRIORITY_PATTERNS.low);
  if (lowMatch) {
    const [fullMatch] = lowMatch;
    const startIndex = remaining.indexOf(fullMatch);

    tokens.push({
      type: 'priority',
      value: fullMatch,
      parsed: 'low',
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: 'low', remaining, tokens };
  }

  // 보통 우선순위 체크
  const mediumMatch = remaining.match(PRIORITY_PATTERNS.medium);
  if (mediumMatch) {
    const [fullMatch] = mediumMatch;
    const startIndex = remaining.indexOf(fullMatch);

    tokens.push({
      type: 'priority',
      value: fullMatch,
      parsed: 'medium',
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });

    remaining = remaining.replace(fullMatch, ' ').trim();
    return { value: 'medium', remaining, tokens };
  }

  return { value: null, remaining, tokens: [] };
}
