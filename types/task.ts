export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';

/**
 * 서브태스크
 */
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; // ISO 날짜
  createdAt: string;
  order: number; // 정렬 순서
}

/**
 * 서브태스크 진행률
 */
export interface SubTaskProgress {
  total: number;
  completed: number;
  percentage: number; // 0-100
}

/**
 * 학습 연결 정보
 */
export interface LinkedLearning {
  // 연결 유형
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'speaking' | 'writing' | 'review';

  // 활동 ID (review인 경우 undefined)
  activityId?: string;

  // 주차 ID
  weekId?: string;

  // CEFR 레벨
  level?: string;

  // 추가 정보
  cardCount?: number; // 복습 카드 수
  estimatedMinutes?: number; // 예상 소요 시간
}

/**
 * 반복 설정
 */
export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
  dueTime?: string; // HH:mm 형식
  estimatedTime?: number; // 분 단위
  tags?: string[];
  createdAt: string;
  completedAt?: string;
  updatedAt: string;

  // 서브태스크
  subtasks: SubTask[];

  // 학습 연결
  linkedLearning?: LinkedLearning;

  // 반복 설정
  recurrence?: TaskRecurrence;

  // 알림 시간
  reminderAt?: string;
}

export type TaskFilter = 'all' | 'today' | 'week' | 'completed';

/**
 * 스마트 리스트 타입
 * - all: 전체 할 일
 * - today: 오늘 마감
 * - upcoming: 예정 (내일 이후)
 * - anytime: 언제든 (마감 없음)
 * - completed: 완료됨
 */
export type SmartListType = 'all' | 'today' | 'upcoming' | 'anytime' | 'completed';

export interface SmartListConfig {
  id: SmartListType;
  name: string;
  icon: string;
  color: string;
}

export type TaskSort = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFormData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  estimatedTime?: number;
  tags?: string[];
}

/**
 * 서브태스크 생성용 폼 데이터
 */
export interface SubTaskFormData {
  title: string;
}
