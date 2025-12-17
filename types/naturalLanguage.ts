/**
 * 자연어 파싱 타입 정의
 */

/**
 * 반복 설정 파싱 결과
 */
export interface RecurrenceParsed {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number; // 간격 (2주마다 = interval: 2)
  daysOfWeek?: number[]; // 요일 (0=일, 6=토)
}

/**
 * 파싱된 토큰
 */
export interface ParsedToken {
  type: 'date' | 'time' | 'priority' | 'tag' | 'recurrence' | 'text';
  value: string; // 원본 텍스트
  parsed: string | number | string[] | RecurrenceParsed | null; // 파싱된 값
  startIndex: number; // 원본에서의 시작 위치
  endIndex: number; // 원본에서의 끝 위치
}

/**
 * 파싱 결과
 */
export interface ParsedTodo {
  // 필수
  title: string; // 파싱 후 남은 텍스트 (제목)

  // 선택 (파싱된 경우에만)
  dueDate?: string; // ISO 날짜 (YYYY-MM-DD)
  dueTime?: string; // 24시간 형식 (HH:mm)
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  recurrence?: RecurrenceParsed;

  // 메타데이터
  confidence: number; // 파싱 신뢰도 (0-1)
  originalInput: string; // 원본 입력
  parsedTokens: ParsedToken[]; // 파싱된 토큰들 (디버깅용)
}

/**
 * 파싱 미리보기 (UI용)
 */
export interface ParsePreview {
  hasDate: boolean;
  hasTime: boolean;
  hasPriority: boolean;
  hasTags: boolean;
  hasRecurrence: boolean;

  // 표시용 텍스트
  dateDisplay?: string; // "내일", "12월 20일"
  timeDisplay?: string; // "오후 3시", "15:00"
  priorityDisplay?: string; // "높음", "중요"
  tagsDisplay?: string[]; // ["#업무", "#회의"]
  recurrenceDisplay?: string; // "매일", "매주 월요일"
}

/**
 * 개별 파서 결과 타입
 */
export interface ParserResult<T> {
  value: T | null;
  remaining: string;
  tokens: ParsedToken[];
}
