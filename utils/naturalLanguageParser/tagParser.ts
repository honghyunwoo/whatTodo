/**
 * 태그 파싱 헬퍼
 */

import { ParsedToken, ParserResult } from '@/types/naturalLanguage';
import { TAG_PATTERN } from './patterns';

/**
 * 태그 파싱
 */
export function parseTags(input: string): ParserResult<string[]> {
  let remaining = input;
  const tokens: ParsedToken[] = [];
  const tags: string[] = [];

  // 모든 태그 찾기
  // TAG_PATTERN은 전역 플래그가 있으므로 lastIndex 리셋 필요
  const tagPattern = new RegExp(TAG_PATTERN.source, 'g');
  let match;

  while ((match = tagPattern.exec(input)) !== null) {
    const [fullMatch, tagName] = match;
    const startIndex = match.index;

    // 중복 태그 방지
    if (!tags.includes(tagName)) {
      tags.push(tagName);
    }

    tokens.push({
      type: 'tag',
      value: fullMatch,
      parsed: tagName,
      startIndex,
      endIndex: startIndex + fullMatch.length,
    });
  }

  // 태그 제거 (뒤에서부터 제거해서 인덱스 유지)
  if (tokens.length > 0) {
    // 태그들을 정규식으로 한번에 제거
    remaining = input.replace(tagPattern, ' ').trim();
  }

  return { value: tags.length > 0 ? tags : null, remaining, tokens };
}
