/**
 * 자연어 파싱 모듈
 *
 * 한국어 자연어 입력을 파싱하여 투두 데이터로 변환합니다.
 *
 * @example
 * import { parseNaturalLanguage, getParsePreview } from '@/utils/naturalLanguageParser';
 *
 * // 전체 파싱
 * const result = parseNaturalLanguage("내일 오후 3시 팀 회의 #업무 중요");
 * // { title: "팀 회의", dueDate: "2025-12-17", dueTime: "15:00", tags: ["업무"], priority: "high", ... }
 *
 * // UI 미리보기용
 * const preview = getParsePreview("내일 오후 3시 팀 회의 #업무");
 * // { hasDate: true, hasTime: true, hasTags: true, dateDisplay: "내일", timeDisplay: "오후 3시", ... }
 */

export { parseNaturalLanguage, getParsePreview } from './parser';
export { parseDate } from './dateParser';
export { parseTime } from './timeParser';
export { parsePriority } from './priorityParser';
export { parseTags } from './tagParser';
export { parseRecurrence } from './recurrenceParser';
