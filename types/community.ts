/**
 * Community Types
 * 커뮤니티 기반 레슨 시스템 타입 정의
 */

import { CEFRLevel } from './activity';

// ─────────────────────────────────────
// 사용자 관련
// ─────────────────────────────────────

export interface CommunityUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // 통계
  lessonsCreated: number;
  lessonsDownloaded: number;
  totalDownloads: number; // 내 레슨의 총 다운로드 수
  averageRating: number;
  // 배지
  badges: UserBadge[];
  // 레벨
  creatorLevel: CreatorLevel;
}

export type CreatorLevel = 'beginner' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// ─────────────────────────────────────
// 커뮤니티 레슨
// ─────────────────────────────────────

export interface CommunityLesson {
  id: string;
  // 기본 정보
  title: string;
  description: string;
  category: LessonCategory;
  tags: string[];
  level: CEFRLevel;
  // 제작자
  authorId: string;
  authorNickname: string;
  authorLevel: CreatorLevel;
  // 콘텐츠
  words: CommunityWord[];
  sentences: CommunitySentence[];
  quizzes: CommunityQuiz[];
  // 메타데이터
  thumbnailUrl?: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  // 통계
  downloadCount: number;
  averageRating: number;
  reviewCount: number;
  // 상태
  status: LessonStatus;
  isPublic: boolean;
  isFeatured: boolean;
  // 시간
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type LessonCategory =
  | 'daily' // 일상회화
  | 'travel' // 여행
  | 'business' // 비즈니스
  | 'exam' // 시험
  | 'entertainment' // 엔터테인먼트
  | 'food' // 음식
  | 'shopping' // 쇼핑
  | 'technology' // 기술
  | 'culture' // 문화
  | 'other'; // 기타

export type LessonStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

// ─────────────────────────────────────
// 레슨 콘텐츠
// ─────────────────────────────────────

export interface CommunityWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  exampleMeaning?: string;
}

export interface CommunitySentence {
  id: string;
  text: string;
  translation: string;
  pronunciation?: string;
  tips?: string;
  context?: string;
}

export interface CommunityQuiz {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;
}

// ─────────────────────────────────────
// 리뷰 및 평가
// ─────────────────────────────────────

export interface LessonReview {
  id: string;
  lessonId: string;
  userId: string;
  userNickname: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  // 도움됨 투표
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface LessonDownload {
  id: string;
  lessonId: string;
  userId: string;
  downloadedAt: Date;
  completed: boolean;
  completedAt?: Date;
  score?: number;
}

// ─────────────────────────────────────
// 신고
// ─────────────────────────────────────

export interface LessonReport {
  id: string;
  lessonId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
  action?: 'none' | 'warning' | 'removed';
}

export type ReportReason =
  | 'inappropriate_content'
  | 'copyright_violation'
  | 'inaccurate_content'
  | 'spam'
  | 'offensive_language'
  | 'other';

// ─────────────────────────────────────
// 필터 및 정렬
// ─────────────────────────────────────

export interface LessonFilter {
  category?: LessonCategory;
  level?: CEFRLevel;
  difficulty?: 'easy' | 'medium' | 'hard';
  minRating?: number;
  tags?: string[];
  authorId?: string;
  isFeatured?: boolean;
  searchQuery?: string;
}

export type LessonSortBy = 'newest' | 'popular' | 'highest_rated' | 'most_downloaded';

// ─────────────────────────────────────
// 레슨 생성/편집
// ─────────────────────────────────────

export interface CreateLessonInput {
  title: string;
  description: string;
  category: LessonCategory;
  tags: string[];
  level: CEFRLevel;
  words: Omit<CommunityWord, 'id'>[];
  sentences: Omit<CommunitySentence, 'id'>[];
  quizzes: Omit<CommunityQuiz, 'id'>[];
  thumbnailUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UpdateLessonInput extends Partial<CreateLessonInput> {
  id: string;
}

// ─────────────────────────────────────
// API 응답
// ─────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LessonListResponse extends PaginatedResponse<CommunityLesson> {}

// ─────────────────────────────────────
// 카테고리 메타데이터
// ─────────────────────────────────────

export const CATEGORY_INFO: Record<LessonCategory, { label: string; icon: string; color: string }> =
  {
    daily: { label: '일상회화', icon: 'chat', color: '#4CAF50' },
    travel: { label: '여행', icon: 'airplane', color: '#2196F3' },
    business: { label: '비즈니스', icon: 'briefcase', color: '#9C27B0' },
    exam: { label: '시험', icon: 'school', color: '#FF9800' },
    entertainment: { label: '엔터테인먼트', icon: 'movie', color: '#E91E63' },
    food: { label: '음식', icon: 'food', color: '#FF5722' },
    shopping: { label: '쇼핑', icon: 'cart', color: '#00BCD4' },
    technology: { label: '기술', icon: 'laptop', color: '#607D8B' },
    culture: { label: '문화', icon: 'palette', color: '#795548' },
    other: { label: '기타', icon: 'dots-horizontal', color: '#9E9E9E' },
  };

// ─────────────────────────────────────
// 크리에이터 레벨 정보
// ─────────────────────────────────────

export const CREATOR_LEVEL_INFO: Record<
  CreatorLevel,
  {
    label: string;
    minDownloads: number;
    badge: string;
    color: string;
  }
> = {
  beginner: { label: '입문', minDownloads: 0, badge: '🌱', color: '#9E9E9E' },
  bronze: { label: '브론즈', minDownloads: 100, badge: '🥉', color: '#CD7F32' },
  silver: { label: '실버', minDownloads: 500, badge: '🥈', color: '#C0C0C0' },
  gold: { label: '골드', minDownloads: 1000, badge: '🥇', color: '#FFD700' },
  platinum: { label: '플래티넘', minDownloads: 5000, badge: '💎', color: '#E5E4E2' },
};
