/**
 * 테스트 시스템 타입
 *
 * 테스트 종류:
 * - placement: 배치 테스트 (초기 레벨 결정)
 * - diagnostic: 진단 테스트 (약점 파악)
 * - lesson: 레슨 테스트 (레슨 완료 확인)
 * - promotion: 승급 테스트 (유닛/레벨 승급)
 */

import type { ActivityType, CEFRLevel, ExerciseType } from './activity';

// ─────────────────────────────────────
// 테스트 타입
// ─────────────────────────────────────

/** 테스트 종류 */
export type TestType = 'placement' | 'diagnostic' | 'lesson' | 'promotion';

/** 테스트 상태 */
export type TestStatus = 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';

// ─────────────────────────────────────
// 테스트 문제
// ─────────────────────────────────────

/** 테스트 문제 */
export interface TestQuestion {
  /** 문제 ID */
  id: string;

  /** 문제 유형 */
  type: ExerciseType;

  /** 관련 활동 타입 */
  activityType: ActivityType;

  /** 문제 텍스트 */
  question: string;

  /** 선택지 (객관식) */
  options?: string[];

  /** 정답 */
  answer: string;

  /** 해설 */
  explanation?: string;

  /** 난이도 (1-5) */
  difficulty: number;

  /** 배점 */
  points: number;

  /** 관련 레슨 ID */
  lessonId?: string;

  /** 힌트 */
  hint?: string;
}

/** 사용자 답변 */
export interface TestAnswer {
  /** 문제 ID */
  questionId: string;

  /** 사용자 답변 */
  userAnswer: string;

  /** 정답 여부 */
  correct: boolean;

  /** 소요 시간 (초) */
  timeSpent: number;

  /** 힌트 사용 여부 */
  hintUsed: boolean;
}

// ─────────────────────────────────────
// 테스트 메타데이터
// ─────────────────────────────────────

/** 테스트 메타데이터 */
export interface TestMeta {
  /** 테스트 ID */
  id: string;

  /** 테스트 종류 */
  type: TestType;

  /** 테스트 제목 */
  title: string;

  /** 테스트 설명 */
  description: string;

  /** 대상 레벨 */
  level: CEFRLevel;

  /** 관련 레슨 ID (lesson 테스트) */
  lessonId?: string;

  /** 관련 유닛 ID (promotion 테스트) */
  unitId?: string;

  /** 문제 수 */
  questionCount: number;

  /** 제한 시간 (분, 0 = 무제한) */
  timeLimit: number;

  /** 통과 기준 점수 (%) */
  passingScore: number;

  /** 재응시 가능 여부 */
  retakeAllowed: boolean;

  /** 재응시 대기 시간 (시간) */
  retakeCooldown: number;
}

// ─────────────────────────────────────
// 테스트 세션
// ─────────────────────────────────────

/** 테스트 세션 (진행 중인 테스트) */
export interface TestSession {
  /** 테스트 ID */
  testId: string;

  /** 테스트 타입 */
  testType: TestType;

  /** 문제 목록 */
  questions: TestQuestion[];

  /** 현재 문제 인덱스 */
  currentIndex: number;

  /** 답변 목록 */
  answers: TestAnswer[];

  /** 시작 시간 */
  startedAt: string;

  /** 남은 시간 (초, null = 무제한) */
  remainingTime: number | null;

  /** 세션 상태 */
  status: 'active' | 'paused' | 'submitted';
}

// ─────────────────────────────────────
// 테스트 결과
// ─────────────────────────────────────

/** 테스트 결과 */
export interface TestResult {
  /** 결과 ID */
  id: string;

  /** 테스트 ID */
  testId: string;

  /** 테스트 종류 */
  testType: TestType;

  /** 대상 레벨 */
  level: CEFRLevel;

  /** 관련 레슨/유닛 ID */
  targetId?: string;

  /** 총 점수 */
  score: number;

  /** 획득 점수 */
  earnedPoints: number;

  /** 총 배점 */
  totalPoints: number;

  /** 정답 수 */
  correctCount: number;

  /** 총 문제 수 */
  totalCount: number;

  /** 통과 여부 */
  passed: boolean;

  /** 소요 시간 (초) */
  timeSpent: number;

  /** 완료 시간 */
  completedAt: string;

  /** 상세 답변 */
  answers: TestAnswer[];

  /** 활동별 점수 분석 */
  activityScores: Partial<Record<ActivityType, ActivityScore>>;

  /** 피드백 메시지 */
  feedback: string;

  /** 추천 액션 */
  recommendations: string[];
}

/** 활동별 점수 */
export interface ActivityScore {
  type: ActivityType;
  correct: number;
  total: number;
  percentage: number;
}

// ─────────────────────────────────────
// 배치 테스트 결과
// ─────────────────────────────────────

/** 배치 테스트 결과 (레벨 추천 포함) */
export interface PlacementTestResult extends TestResult {
  testType: 'placement';

  /** 추천 레벨 */
  recommendedLevel: CEFRLevel;

  /** 레벨별 예상 점수 */
  levelScores: Record<CEFRLevel, number>;

  /** 강점 영역 */
  strengths: ActivityType[];

  /** 약점 영역 */
  weaknesses: ActivityType[];
}

// ─────────────────────────────────────
// 진단 테스트 결과
// ─────────────────────────────────────

/** 진단 테스트 결과 (학습 추천 포함) */
export interface DiagnosticTestResult extends TestResult {
  testType: 'diagnostic';

  /** 약점 레슨 ID 목록 */
  weakLessons: string[];

  /** 복습 추천 레슨 ID 목록 */
  reviewRecommended: string[];

  /** 스킵 가능 레슨 ID 목록 */
  canSkip: string[];
}

// ─────────────────────────────────────
// 승급 테스트 결과
// ─────────────────────────────────────

/** 승급 테스트 결과 */
export interface PromotionTestResult extends TestResult {
  testType: 'promotion';

  /** 승급 대상 유닛/레벨 ID */
  promotionTargetId: string;

  /** 승급 성공 여부 */
  promoted: boolean;

  /** 다음 유닛/레벨 해금 여부 */
  unlockedNext: boolean;

  /** 획득 보상 */
  rewards?: TestReward[];
}

/** 테스트 보상 */
export interface TestReward {
  type: 'badge' | 'stars' | 'achievement';
  id: string;
  name: string;
  amount?: number;
}

// ─────────────────────────────────────
// 테스트 히스토리
// ─────────────────────────────────────

/** 테스트 히스토리 항목 */
export interface TestHistoryEntry {
  /** 결과 ID */
  resultId: string;

  /** 테스트 ID */
  testId: string;

  /** 테스트 타입 */
  testType: TestType;

  /** 점수 */
  score: number;

  /** 통과 여부 */
  passed: boolean;

  /** 완료 시간 */
  completedAt: string;
}

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

/** 테스트 타입별 기본 설정 */
export const TEST_DEFAULTS: Record<
  TestType,
  {
    timeLimit: number;
    passingScore: number;
    questionCount: number;
    retakeAllowed: boolean;
    retakeCooldown: number;
  }
> = {
  placement: {
    timeLimit: 30, // 30분
    passingScore: 0, // 배치 테스트는 통과/불통과 없음
    questionCount: 30,
    retakeAllowed: true,
    retakeCooldown: 24, // 24시간
  },
  diagnostic: {
    timeLimit: 20, // 20분
    passingScore: 0, // 진단 테스트는 통과/불통과 없음
    questionCount: 20,
    retakeAllowed: true,
    retakeCooldown: 0,
  },
  lesson: {
    timeLimit: 10, // 10분
    passingScore: 70, // 70% 통과 기준
    questionCount: 10,
    retakeAllowed: true,
    retakeCooldown: 0,
  },
  promotion: {
    timeLimit: 15, // 15분
    passingScore: 70, // 70% 통과 기준
    questionCount: 15,
    retakeAllowed: true,
    retakeCooldown: 1, // 1시간
  },
};

/** 통과 메시지 */
export const PASS_MESSAGES = [
  '훌륭해요! 다음 단계로 넘어갈 준비가 되었습니다.',
  '축하합니다! 테스트를 통과했습니다.',
  '잘하셨어요! 꾸준히 성장하고 있습니다.',
];

/** 불통과 메시지 (복습 권장, 강제 아님) */
export const FAIL_MESSAGES = [
  '아쉽네요. 복습 후 다시 도전해보세요!',
  '조금 더 연습이 필요해요. 천천히 복습해봐요.',
  '괜찮아요! 복습하면 다음에는 꼭 통과할 수 있어요.',
];
