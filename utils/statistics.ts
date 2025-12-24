/**
 * Statistics Utilities
 * 학습 통계를 계산하고 집계하는 유틸리티 함수
 */

import { useJournalStore } from '@/store/journalStore';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';

// ============================================================================
// Types
// ============================================================================

export type LearningStats = {
  // 전체 통계
  totalLearningTime: number; // 총 학습 시간 (분)
  totalLearningDays: number; // 총 학습 일수
  currentStreak: number; // 현재 연속 학습일
  longestStreak: number; // 최장 연속 학습일

  // 학습 진도
  totalActivitiesCompleted: number; // 완료한 활동 수
  totalWordsLearned: number; // 학습한 단어 수
  currentWeekProgress: number; // 현재 주차 진행률 (%)

  // SRS 복습
  totalReviews: number; // 총 복습 횟수
  masteredWords: number; // 마스터한 단어 수
  dueWords: number; // 복습 예정 단어 수
  todayReviewProgress: { done: number; goal: number }; // 오늘 복습 진도

  // 최근 활동
  recentDaysActive: number; // 최근 7일 중 활동한 일수
  averageDailyTime: number; // 최근 7일 평균 학습 시간 (분)
};

export type WeeklyActivity = {
  date: string; // YYYY-MM-DD
  learningTime: number; // 분
  activitiesCompleted: number;
  hasActivity: boolean;
};

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * 전체 학습 통계 집계
 */
export function getLearningStats(): LearningStats {
  const journalStore = useJournalStore.getState();
  const learnStore = useLearnStore.getState();
  const srsStore = useSrsStore.getState();

  // Journal 통계
  const streak = journalStore.getStreak();
  const totalLearningTime = journalStore.getTotalLearningTime();
  const recentEntries = journalStore.getRecentEntries(7);

  // Learn 통계
  const totalActivitiesCompleted = learnStore.getTotalActivitiesCompleted();
  const totalWordsLearned = learnStore.getTotalWordsLearned();
  const currentWeekProgress = learnStore.getWeekCompletionRate(learnStore.currentWeek);

  // SRS 통계
  const reviewStats = srsStore.getReviewStats();
  const masteredWords = srsStore.getMasteredWords().length;
  const dueWords = srsStore.getDueWordCount();
  const todayReviewProgress = srsStore.getTodayProgress();

  // 최근 활동 분석
  const recentDaysActive = recentEntries.filter(
    (entry) => entry.learningTime > 0 || entry.completedActivities.length > 0
  ).length;

  const totalRecentTime = recentEntries.reduce((sum, entry) => sum + entry.learningTime, 0);
  const averageDailyTime = recentDaysActive > 0 ? Math.round(totalRecentTime / 7) : 0;

  return {
    totalLearningTime,
    totalLearningDays: streak.totalLearningDays,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,

    totalActivitiesCompleted,
    totalWordsLearned,
    currentWeekProgress,

    totalReviews: reviewStats.totalReviews,
    masteredWords,
    dueWords,
    todayReviewProgress,

    recentDaysActive,
    averageDailyTime,
  };
}

/**
 * 최근 7일 활동 데이터
 */
export function getWeeklyActivity(): WeeklyActivity[] {
  const journalStore = useJournalStore.getState();
  const activities: WeeklyActivity[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const entry = journalStore.getEntry(dateStr);

    activities.push({
      date: dateStr,
      learningTime: entry?.learningTime ?? 0,
      activitiesCompleted: entry?.completedActivities.length ?? 0,
      hasActivity: (entry?.learningTime ?? 0) > 0 || (entry?.completedActivities.length ?? 0) > 0,
    });
  }

  return activities;
}

/**
 * 학습 시간을 읽기 쉬운 형식으로 변환
 */
export function formatLearningTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 진행률을 백분율 문자열로 변환
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * 통계 요약 텍스트 생성
 */
export function getStatsSummary(stats: LearningStats): string {
  const summaries: string[] = [];

  if (stats.currentStreak > 0) {
    summaries.push(`🔥 ${stats.currentStreak}일 연속 학습 중`);
  }

  if (stats.totalActivitiesCompleted > 0) {
    summaries.push(`✅ ${stats.totalActivitiesCompleted}개 활동 완료`);
  }

  if (stats.totalWordsLearned > 0) {
    summaries.push(`📚 ${stats.totalWordsLearned}개 단어 학습`);
  }

  if (stats.dueWords > 0) {
    summaries.push(`📝 ${stats.dueWords}개 단어 복습 필요`);
  }

  return summaries.length > 0 ? summaries.join(' · ') : '학습을 시작해보세요!';
}
