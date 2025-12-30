/**
 * Scenario Types
 * 시나리오 기반 학습 시스템 타입 정의
 */

import { CEFRLevel } from './activity';

// ─────────────────────────────────────
// 시나리오 관련 타입
// ─────────────────────────────────────

/**
 * 시나리오 카테고리
 */
export type ScenarioCategory = 'travel' | 'business' | 'daily' | 'social' | 'emergency';

/**
 * 시나리오 난이도 (1: 쉬움, 2: 보통, 3: 어려움)
 */
export type ScenarioDifficulty = 1 | 2 | 3;

/**
 * 시나리오 정의
 */
export interface Scenario {
  id: string;
  category: ScenarioCategory;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  level: CEFRLevel;
  difficulty: ScenarioDifficulty;
  icon: string;
  expressions: Expression[];
  estimatedTime: number; // 분 단위
  tags: string[];
}

/**
 * 표현 (학습 단위)
 */
export interface Expression {
  id: string;
  korean: string;
  english: string;
  pronunciation?: string; // IPA 발음기호
  audioUrl?: string;
  skills: string[]; // 백엔드 스킬 트래킹용 (예: 'grammar.article', 'vocab.food')
  context?: string; // 사용 상황 설명
  tips?: string; // 학습 팁
  commonMistakes?: CommonMistake[];
}

/**
 * 흔한 실수 (오류 정상화용)
 */
export interface CommonMistake {
  wrong: string;
  correct: string;
  explanation: string;
  explanationKo: string;
  percentage: number; // "80%가 헷갈려요"에서 80
}

// ─────────────────────────────────────
// 세션 관련 타입
// ─────────────────────────────────────

/**
 * 세션 타입
 */
export type SessionType = '30s' | '1m' | '5m';

/**
 * 세션 설정
 */
export const SESSION_CONFIG: Record<
  SessionType,
  { duration: number; expressionCount: number; label: string }
> = {
  '30s': { duration: 30, expressionCount: 3, label: '30초' },
  '1m': { duration: 60, expressionCount: 6, label: '1분' },
  '5m': { duration: 300, expressionCount: 15, label: '5분' },
};

/**
 * 세션 상태
 */
export type SessionStatus = 'idle' | 'active' | 'paused' | 'completed';

/**
 * 세션 콘텐츠 선택 결과
 */
export interface SessionContent {
  success: Expression[]; // 30% - 자신감 부여 (이미 아는 것)
  weakness: Expression[]; // 50% - 실력 향상 (약점)
  expansion: Expression[]; // 20% - 새로운 도전 (확장)
}

/**
 * 세션 기록
 */
export interface SessionRecord {
  id: string;
  type: SessionType;
  scenarioId: string;
  startedAt: Date;
  completedAt?: Date;
  expressions: SessionExpressionRecord[];
  totalCount: number;
  correctCount: number;
  score: number; // 0-100
}

/**
 * 세션 내 표현 기록
 */
export interface SessionExpressionRecord {
  expressionId: string;
  isCorrect: boolean;
  userAnswer?: string;
  timeSpent: number; // 밀리초
  attempts: number;
}

// ─────────────────────────────────────
// 스킬 관련 타입
// ─────────────────────────────────────

/**
 * 스킬 카테고리
 */
export type SkillCategory = 'grammar' | 'vocab' | 'speaking' | 'listening' | 'reading' | 'writing';

/**
 * 스킬 상태
 */
export interface SkillState {
  id: string; // 예: 'grammar.article', 'vocab.food'
  category: SkillCategory;
  name: string;
  nameKo: string;
  progress: number; // 0-100
  correctCount: number;
  totalCount: number;
  lastPracticed?: Date;
  streak: number; // 연속 정답 수
}

/**
 * 스킬 진행률 업데이트 정보
 */
export interface SkillUpdate {
  skillId: string;
  isCorrect: boolean;
  timestamp: Date;
}

// ─────────────────────────────────────
// 시나리오 진행 상태 타입
// ─────────────────────────────────────

/**
 * 시나리오 진행 상태
 */
export interface ScenarioProgress {
  scenarioId: string;
  completedExpressions: string[]; // 완료한 표현 ID 목록
  totalExpressions: number;
  progress: number; // 0-100
  lastAccessed?: Date;
  isCompleted: boolean;
  bestScore?: number;
  practiceCount: number;
}

/**
 * 사용자 학습 통계
 */
export interface LearningStats {
  totalExpressions: number;
  masteredExpressions: number;
  totalSessions: number;
  totalTime: number; // 초 단위
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory?: ScenarioCategory;
}

// ─────────────────────────────────────
// 피드백 관련 타입
// ─────────────────────────────────────

/**
 * 피드백 타입
 */
export type FeedbackType = 'correct' | 'incorrect' | 'partial' | 'hint';

/**
 * 학습 피드백
 */
export interface LearningFeedback {
  type: FeedbackType;
  message: string;
  messageKo: string;
  explanation?: string;
  commonMistake?: CommonMistake;
  suggestion?: string; // 다음에 시도해볼 것
}

/**
 * 오류 정상화 메시지 생성
 * @param percentage 실수 비율
 * @param explanation 설명
 */
export function createNormalizedErrorMessage(percentage: number, explanation: string): string {
  if (percentage >= 80) {
    return `${percentage}%가 헷갈려하는 부분이에요! ${explanation}`;
  } else if (percentage >= 50) {
    return `많은 분들이 헷갈려해요. ${explanation}`;
  } else {
    return `이런 실수를 하기도 해요. ${explanation}`;
  }
}

// ─────────────────────────────────────
// 시나리오 카테고리 메타데이터
// ─────────────────────────────────────

export const SCENARIO_CATEGORIES: Record<
  ScenarioCategory,
  { label: string; labelKo: string; icon: string; color: string }
> = {
  travel: { label: 'Travel', labelKo: '여행', icon: 'airplane', color: '#4CAF50' },
  business: { label: 'Business', labelKo: '비즈니스', icon: 'briefcase', color: '#2196F3' },
  daily: { label: 'Daily', labelKo: '일상', icon: 'home', color: '#FF9800' },
  social: { label: 'Social', labelKo: '소셜', icon: 'people', color: '#E91E63' },
  emergency: { label: 'Emergency', labelKo: '긴급상황', icon: 'alert-circle', color: '#F44336' },
};

/**
 * 난이도 라벨
 */
export const DIFFICULTY_LABELS: Record<
  ScenarioDifficulty,
  { label: string; labelKo: string; color: string }
> = {
  1: { label: 'Easy', labelKo: '쉬움', color: '#4CAF50' },
  2: { label: 'Medium', labelKo: '보통', color: '#FF9800' },
  3: { label: 'Hard', labelKo: '어려움', color: '#F44336' },
};
