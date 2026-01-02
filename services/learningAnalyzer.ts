/**
 * Learning Analyzer Service
 *
 * 학습 패턴 분석 서비스
 * - 강점/약점 영역 분석
 * - 진행 추세 분석
 * - 이번 주 집중 영역 추천
 * - 주간 인사이트 생성
 */

import { useLearnStore, ACTIVITY_TYPES } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useUserStore } from '@/store/userStore';
import type { ActivityType, CEFRLevel, LearnProgress } from '@/types/activity';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export type ProgressTrend = 'improving' | 'stable' | 'declining';

export interface SkillScore {
  skill: ActivityType;
  averageScore: number;
  completedCount: number;
  lastAttempt: string | null;
}

export interface LearningAnalysis {
  strengths: ActivityType[];
  weaknesses: ActivityType[];
  recommendedFocus: ActivityType | null;
  progressTrend: ProgressTrend;
  skillScores: SkillScore[];
  overallScore: number;
}

export interface WeeklyInsight {
  summary: string;
  activitiesCompleted: number;
  totalMinutes: number;
  bestSkill: ActivityType | null;
  needsWork: ActivityType | null;
  streakStatus: 'growing' | 'maintained' | 'broken' | 'new';
  wordsLearned: number;
  recommendations: string[];
}

export interface DailyStats {
  date: string;
  activitiesCompleted: number;
  totalScore: number;
  skills: ActivityType[];
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const STRENGTH_THRESHOLD = 80; // 80% 이상이면 강점
const WEAKNESS_THRESHOLD = 60; // 60% 이하면 약점
const MIN_ACTIVITIES_FOR_ANALYSIS = 3; // 분석에 필요한 최소 활동 수

// 스킬별 가중치 (레벨별로 중요도 다름)
const SKILL_WEIGHTS: Record<CEFRLevel, Partial<Record<ActivityType, number>>> = {
  A1: { vocabulary: 1.3, grammar: 1.2, listening: 1.0, speaking: 0.8, reading: 0.9, writing: 0.8 },
  A2: { vocabulary: 1.2, grammar: 1.2, listening: 1.0, speaking: 0.9, reading: 1.0, writing: 0.9 },
  B1: { vocabulary: 1.0, grammar: 1.0, listening: 1.1, speaking: 1.1, reading: 1.1, writing: 1.0 },
  B2: { vocabulary: 1.0, grammar: 0.9, listening: 1.1, speaking: 1.2, reading: 1.1, writing: 1.1 },
  C1: { vocabulary: 0.9, grammar: 0.8, listening: 1.2, speaking: 1.3, reading: 1.1, writing: 1.2 },
  C2: { vocabulary: 0.8, grammar: 0.8, listening: 1.2, speaking: 1.3, reading: 1.2, writing: 1.3 },
};

// ─────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────

/**
 * 날짜 문자열에서 주차 시작일 계산
 */
function getWeekStart(date: Date): string {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(date.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

/**
 * 두 날짜 사이의 일수 계산
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────
// Core Analysis Functions
// ─────────────────────────────────────

/**
 * 스킬별 점수 계산
 */
function calculateSkillScores(progress: LearnProgress[]): SkillScore[] {
  const skillMap = new Map<
    ActivityType,
    { totalScore: number; count: number; lastAttempt: string | null }
  >();

  // 모든 스킬 초기화
  for (const skill of ACTIVITY_TYPES) {
    skillMap.set(skill, { totalScore: 0, count: 0, lastAttempt: null });
  }

  // 진행률 데이터 집계
  for (const p of progress) {
    if (!p.completed || p.score === undefined) continue;

    const current = skillMap.get(p.type);
    if (current) {
      current.totalScore += p.score;
      current.count += 1;
      if (!current.lastAttempt || (p.lastAttempt && p.lastAttempt > current.lastAttempt)) {
        current.lastAttempt = p.lastAttempt ?? null;
      }
    }
  }

  // SkillScore 배열로 변환
  return ACTIVITY_TYPES.map((skill) => {
    const data = skillMap.get(skill)!;
    return {
      skill,
      averageScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      completedCount: data.count,
      lastAttempt: data.lastAttempt,
    };
  });
}

/**
 * 진행 추세 분석 (최근 2주간 비교)
 */
function analyzeProgressTrend(progress: LearnProgress[]): ProgressTrend {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = progress.filter((p) => {
    if (!p.lastAttempt) return false;
    const date = new Date(p.lastAttempt);
    return date >= oneWeekAgo;
  });

  const lastWeek = progress.filter((p) => {
    if (!p.lastAttempt) return false;
    const date = new Date(p.lastAttempt);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });

  const thisWeekAvg =
    thisWeek.length > 0
      ? thisWeek.reduce((sum, p) => sum + (p.score || 0), 0) / thisWeek.length
      : 0;

  const lastWeekAvg =
    lastWeek.length > 0
      ? lastWeek.reduce((sum, p) => sum + (p.score || 0), 0) / lastWeek.length
      : 0;

  // 데이터가 충분하지 않으면 stable
  if (
    thisWeek.length < MIN_ACTIVITIES_FOR_ANALYSIS &&
    lastWeek.length < MIN_ACTIVITIES_FOR_ANALYSIS
  ) {
    return 'stable';
  }

  // 10% 이상 차이로 판단
  const diff = thisWeekAvg - lastWeekAvg;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * 강점/약점 분석
 */
function analyzeStrengthsWeaknesses(
  skillScores: SkillScore[],
  level: CEFRLevel
): { strengths: ActivityType[]; weaknesses: ActivityType[] } {
  const weights = SKILL_WEIGHTS[level];
  const strengths: ActivityType[] = [];
  const weaknesses: ActivityType[] = [];

  for (const score of skillScores) {
    // 최소 활동 수 미달 시 분석에서 제외
    if (score.completedCount < MIN_ACTIVITIES_FOR_ANALYSIS) continue;

    const weight = weights[score.skill] || 1.0;
    const weightedScore = score.averageScore * weight;

    if (weightedScore >= STRENGTH_THRESHOLD) {
      strengths.push(score.skill);
    } else if (weightedScore <= WEAKNESS_THRESHOLD) {
      weaknesses.push(score.skill);
    }
  }

  // 점수 순으로 정렬
  strengths.sort((a, b) => {
    const scoreA = skillScores.find((s) => s.skill === a)?.averageScore || 0;
    const scoreB = skillScores.find((s) => s.skill === b)?.averageScore || 0;
    return scoreB - scoreA;
  });

  weaknesses.sort((a, b) => {
    const scoreA = skillScores.find((s) => s.skill === a)?.averageScore || 0;
    const scoreB = skillScores.find((s) => s.skill === b)?.averageScore || 0;
    return scoreA - scoreB;
  });

  return { strengths, weaknesses };
}

/**
 * 집중 영역 추천
 */
function recommendFocus(skillScores: SkillScore[], level: CEFRLevel): ActivityType | null {
  const weights = SKILL_WEIGHTS[level];

  // 가중치 적용된 점수로 정렬
  const scoredSkills = skillScores
    .filter((s) => s.completedCount > 0)
    .map((s) => ({
      skill: s.skill,
      weightedScore: s.averageScore * (weights[s.skill] || 1.0),
      recentActivity: s.lastAttempt ? daysBetween(s.lastAttempt, new Date().toISOString()) : 999,
    }));

  if (scoredSkills.length === 0) {
    // 아무 활동도 없으면 레벨별 권장 시작점
    const levelStarters: Record<CEFRLevel, ActivityType> = {
      A1: 'vocabulary',
      A2: 'vocabulary',
      B1: 'listening',
      B2: 'speaking',
      C1: 'speaking',
      C2: 'writing',
    };
    return levelStarters[level];
  }

  // 가장 낮은 점수 + 최근 안 한 것 우선
  scoredSkills.sort((a, b) => {
    // 1. 낮은 점수 우선
    if (a.weightedScore !== b.weightedScore) {
      return a.weightedScore - b.weightedScore;
    }
    // 2. 오래 안 한 것 우선
    return b.recentActivity - a.recentActivity;
  });

  return scoredSkills[0].skill;
}

// ─────────────────────────────────────
// Main Service
// ─────────────────────────────────────

export const learningAnalyzer = {
  /**
   * 종합 학습 분석
   */
  analyze(): LearningAnalysis {
    const progress = useLearnStore.getState().progress;
    const level = useUserStore.getState().preferredLevel;

    const skillScores = calculateSkillScores(progress);
    const progressTrend = analyzeProgressTrend(progress);
    const { strengths, weaknesses } = analyzeStrengthsWeaknesses(skillScores, level);
    const recommendedFocus = recommendFocus(skillScores, level);

    // 전체 점수 계산
    const completedSkills = skillScores.filter((s) => s.completedCount > 0);
    const overallScore =
      completedSkills.length > 0
        ? Math.round(
            completedSkills.reduce((sum, s) => sum + s.averageScore, 0) / completedSkills.length
          )
        : 0;

    return {
      strengths,
      weaknesses,
      recommendedFocus,
      progressTrend,
      skillScores,
      overallScore,
    };
  },

  /**
   * 주간 인사이트 생성
   */
  getWeeklyInsight(): WeeklyInsight {
    const learnState = useLearnStore.getState();
    const srsState = useSrsStore.getState();

    const progress = learnState.progress;
    const streak = learnState.streak;
    const lastStudyDate = learnState.lastStudyDate;

    // 이번 주 활동 필터링
    const weekStart = getWeekStart(new Date());
    const thisWeekProgress = progress.filter((p) => {
      if (!p.lastAttempt) return false;
      return p.lastAttempt >= weekStart;
    });

    // 스킬별 점수
    const skillScores = calculateSkillScores(thisWeekProgress);
    const completedSkills = skillScores.filter((s) => s.completedCount > 0);

    // 최고/최저 스킬
    let bestSkill: ActivityType | null = null;
    let needsWork: ActivityType | null = null;

    if (completedSkills.length > 0) {
      completedSkills.sort((a, b) => b.averageScore - a.averageScore);
      bestSkill = completedSkills[0].skill;
      needsWork = completedSkills[completedSkills.length - 1].skill;
    }

    // 스트릭 상태
    let streakStatus: WeeklyInsight['streakStatus'] = 'new';
    if (streak > 7) {
      streakStatus = 'growing';
    } else if (streak > 1) {
      streakStatus = 'maintained';
    } else if (lastStudyDate) {
      const daysSince = daysBetween(lastStudyDate, new Date().toISOString());
      streakStatus = daysSince > 1 ? 'broken' : 'maintained';
    }

    // SRS 단어
    const wordsLearned = srsState.getMasteredWords().length;

    // 추천 생성
    const recommendations = this.generateRecommendations(thisWeekProgress, skillScores);

    // 요약 생성
    const summary = this.generateSummary(thisWeekProgress.length, streak, bestSkill, needsWork);

    return {
      summary,
      activitiesCompleted: thisWeekProgress.length,
      totalMinutes: thisWeekProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      bestSkill,
      needsWork,
      streakStatus,
      wordsLearned,
      recommendations,
    };
  },

  /**
   * 추천 메시지 생성
   */
  generateRecommendations(progress: LearnProgress[], skillScores: SkillScore[]): string[] {
    const recommendations: string[] = [];
    const level = useUserStore.getState().preferredLevel;

    // 활동량 기반 추천
    if (progress.length === 0) {
      recommendations.push('이번 주 학습을 시작해보세요! 짧은 세션부터 시작하면 좋아요.');
    } else if (progress.length < 3) {
      recommendations.push('꾸준한 학습이 중요해요. 하루 10분씩이라도 해보세요.');
    }

    // 스킬 밸런스 추천
    const completedSkills = skillScores.filter((s) => s.completedCount > 0);
    const missingSkills = ACTIVITY_TYPES.filter(
      (type) => !completedSkills.some((s) => s.skill === type)
    );

    if (missingSkills.length > 0 && missingSkills.length < ACTIVITY_TYPES.length) {
      const skillNames: Record<ActivityType, string> = {
        vocabulary: '어휘',
        grammar: '문법',
        listening: '듣기',
        reading: '읽기',
        speaking: '말하기',
        writing: '쓰기',
      };
      const missing = missingSkills
        .slice(0, 2)
        .map((s) => skillNames[s])
        .join(', ');
      recommendations.push(`${missing} 영역도 연습해보세요.`);
    }

    // 레벨별 특화 추천
    if (level === 'A1' || level === 'A2') {
      const vocabScore = skillScores.find((s) => s.skill === 'vocabulary')?.averageScore || 0;
      if (vocabScore < 70) {
        recommendations.push('기초 어휘를 탄탄히 다지면 다른 영역도 수월해져요.');
      }
    } else if (level === 'B1' || level === 'B2') {
      const listeningScore = skillScores.find((s) => s.skill === 'listening')?.averageScore || 0;
      if (listeningScore < 70) {
        recommendations.push('듣기 연습을 늘려보세요. 실전 영어에 큰 도움이 돼요.');
      }
    } else {
      const speakingScore = skillScores.find((s) => s.skill === 'speaking')?.averageScore || 0;
      if (speakingScore < 75) {
        recommendations.push('말하기 연습으로 고급 표현력을 키워보세요.');
      }
    }

    return recommendations.slice(0, 3); // 최대 3개
  },

  /**
   * 요약 메시지 생성
   */
  generateSummary(
    activityCount: number,
    streak: number,
    bestSkill: ActivityType | null,
    needsWork: ActivityType | null
  ): string {
    const skillNames: Record<ActivityType, string> = {
      vocabulary: '어휘',
      grammar: '문법',
      listening: '듣기',
      reading: '읽기',
      speaking: '말하기',
      writing: '쓰기',
    };

    if (activityCount === 0) {
      return '이번 주 학습 기록이 없어요. 오늘부터 시작해볼까요?';
    }

    let summary = `이번 주 ${activityCount}개 활동을 완료했어요.`;

    if (streak >= 7) {
      summary += ` ${streak}일 연속 학습 중! 대단해요!`;
    } else if (streak >= 3) {
      summary += ` ${streak}일째 꾸준히 하고 있어요.`;
    }

    if (bestSkill) {
      summary += ` ${skillNames[bestSkill]}가 강점이에요.`;
    }

    if (needsWork && needsWork !== bestSkill) {
      summary += ` ${skillNames[needsWork]}는 더 연습하면 좋겠어요.`;
    }

    return summary;
  },

  /**
   * 특정 스킬의 상세 분석
   */
  getSkillDetail(skill: ActivityType): SkillScore & { trend: ProgressTrend; rank: number } {
    const progress = useLearnStore.getState().progress;
    const skillProgress = progress.filter((p) => p.type === skill);
    const allSkillScores = calculateSkillScores(progress);

    const skillScore = allSkillScores.find((s) => s.skill === skill) || {
      skill,
      averageScore: 0,
      completedCount: 0,
      lastAttempt: null,
    };

    // 스킬별 추세
    const trend = analyzeProgressTrend(skillProgress);

    // 순위 계산
    const sorted = [...allSkillScores]
      .filter((s) => s.completedCount > 0)
      .sort((a, b) => b.averageScore - a.averageScore);
    const rank = sorted.findIndex((s) => s.skill === skill) + 1;

    return {
      ...skillScore,
      trend,
      rank: rank || sorted.length + 1,
    };
  },

  /**
   * 최근 활동 통계 (지난 7일)
   */
  getRecentStats(): DailyStats[] {
    const progress = useLearnStore.getState().progress;
    const stats: DailyStats[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayProgress = progress.filter((p) => {
        if (!p.lastAttempt) return false;
        return p.lastAttempt.startsWith(dateStr);
      });

      stats.push({
        date: dateStr,
        activitiesCompleted: dayProgress.length,
        totalScore:
          dayProgress.length > 0
            ? Math.round(
                dayProgress.reduce((sum, p) => sum + (p.score || 0), 0) / dayProgress.length
              )
            : 0,
        skills: [...new Set(dayProgress.map((p) => p.type))],
      });
    }

    return stats;
  },
};

export default learningAnalyzer;
