/**
 * 자연어 파싱을 위한 정규식 패턴 정의
 */

// ============================================
// 날짜 패턴
// ============================================

/**
 * 상대적 날짜 패턴
 */
export const RELATIVE_DATE_PATTERNS = [
  { pattern: /오늘/, days: 0 },
  { pattern: /내일/, days: 1 },
  { pattern: /모레/, days: 2 },
  { pattern: /글피/, days: 3 },
  { pattern: /다음\s*주/, days: 7 },
  { pattern: /다다음\s*주/, days: 14 },
] as const;

/**
 * 특수 날짜 패턴
 */
export const SPECIAL_DATE_PATTERNS = [
  { pattern: /이번\s*달\s*말/, special: 'endOfMonth' as const },
  { pattern: /다음\s*달/, special: 'nextMonth' as const },
  { pattern: /다음\s*달\s*초/, special: 'nextMonthStart' as const },
] as const;

/**
 * 요일 매핑
 */
export const WEEKDAY_MAP: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
  일요일: 0,
  월요일: 1,
  화요일: 2,
  수요일: 3,
  목요일: 4,
  금요일: 5,
  토요일: 6,
  일욜: 0,
  월욜: 1,
  화욜: 2,
  수욜: 3,
  목욜: 4,
  금욜: 5,
  토욜: 6,
};

/**
 * 요일 패턴 (단독)
 */
export const WEEKDAY_PATTERN = /(월|화|수|목|금|토|일)(요일|욜)?/;

/**
 * 이번 주 / 다음 주 + 요일 패턴
 */
export const WEEK_MODIFIER_PATTERN = /(이번|다음)\s*주\s*(월|화|수|목|금|토|일)(요일|욜)?/;

/**
 * 절대 날짜 패턴
 */
export const ABSOLUTE_DATE_PATTERNS = {
  // 12월 25일
  monthDay: /(\d{1,2})월\s*(\d{1,2})일/,
  // 12/25 또는 12-25
  slashDate: /(\d{1,2})[/\-](\d{1,2})/,
  // 2025년 12월 25일
  fullDate: /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
} as const;

// ============================================
// 시간 패턴
// ============================================

/**
 * 오전/오후 시간 패턴
 */
export const AM_PM_TIME_PATTERNS = {
  // 오전 9시, 오전 9시 30분
  am: /오전\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/,
  // 오후 3시, 오후 3시 30분
  pm: /오후\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/,
} as const;

/**
 * 단순 시간 패턴
 */
export const SIMPLE_TIME_PATTERNS = {
  // 3시, 3시 30분
  hourMinute: /(\d{1,2})시(?:\s*(\d{1,2})분)?/,
  // 15:30
  twentyFourHour: /(\d{1,2}):(\d{2})/,
} as const;

/**
 * 대략적 시간 패턴
 */
export const APPROXIMATE_TIME_MAP: Record<string, string> = {
  아침: '09:00',
  점심: '12:00',
  오후: '14:00',
  저녁: '18:00',
  밤: '21:00',
  새벽: '06:00',
};

export const APPROXIMATE_TIME_PATTERN = /아침|점심|저녁|밤|새벽/;

// ============================================
// 우선순위 패턴
// ============================================

/**
 * 우선순위 패턴
 */
export const PRIORITY_PATTERNS = {
  high: /중요|급함|급해|빨리|시급|!!|\*\*|긴급/,
  medium: /보통|일반|!/,
  low: /나중에|언젠가|천천히|여유|낮음/,
} as const;

// ============================================
// 태그 패턴
// ============================================

/**
 * 태그 패턴 (#으로 시작)
 */
export const TAG_PATTERN = /#([^\s#]+)/g;

/**
 * 카테고리 자동 매핑
 */
export const CATEGORY_MAPPING: Record<string, string> = {
  업무: 'work',
  일: 'work',
  회사: 'work',
  개인: 'personal',
  집: 'personal',
  공부: 'study',
  학습: 'study',
  영어: 'study',
  운동: 'health',
  건강: 'health',
  심부름: 'errands',
  쇼핑: 'errands',
  장보기: 'errands',
};

// ============================================
// 반복 패턴
// ============================================

/**
 * 반복 패턴
 */
export const RECURRENCE_PATTERNS = [
  { pattern: /매일/, type: 'daily' as const, interval: 1 },
  { pattern: /매주/, type: 'weekly' as const, interval: 1 },
  { pattern: /격주/, type: 'weekly' as const, interval: 2 },
  { pattern: /매월|매달/, type: 'monthly' as const, interval: 1 },
  { pattern: /매년/, type: 'yearly' as const, interval: 1 },
] as const;

/**
 * 요일 지정 반복 패턴
 */
export const WEEKLY_RECURRENCE_WITH_DAY_PATTERN = /매주\s*(월|화|수|목|금|토|일)(요일|욜)?/;

/**
 * N일/주마다 패턴
 */
export const INTERVAL_RECURRENCE_PATTERNS = {
  daily: /(\d+)일\s*마다/,
  weekly: /(\d+)주\s*마다/,
} as const;
