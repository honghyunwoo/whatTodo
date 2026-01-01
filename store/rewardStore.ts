import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { ActivityType } from '@/types/activity';

// Priority-based reward amounts (for Todo)
const PRIORITY_REWARDS = {
  urgent: 50,
  high: 30,
  medium: 20,
  low: 10,
} as const;

// Learning reward amounts (HIGHER than Todo to encourage learning)
const LEARNING_REWARDS: Record<ActivityType, number> = {
  vocabulary: 30,
  grammar: 25,
  listening: 35,
  reading: 30,
  speaking: 40, // Highest (most difficult)
  writing: 40,
} as const;

// Score-based bonus multiplier for learning
const getScoreBonus = (score: number): number => {
  if (score >= 100) return 2.0; // Perfect
  if (score >= 90) return 1.5;
  if (score >= 80) return 1.2;
  return 1.0;
};

// Streak bonus multipliers
const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 3.0;
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
};

// 일일 목표 설정
const DAILY_STAR_GOAL = 50;
const STREAK_FREEZE_COST = 200;
const MAX_STREAK_FREEZES = 2;

// 스트릭 마일스톤 (축하 대상)
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

interface RewardState {
  // Core stats
  stars: number;
  totalStarsEarned: number;

  // Streak tracking
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;

  // Streak Freeze (스트릭 보호)
  streakFreezes: number;
  streakFreezeUsedToday: boolean;

  // Unlocked content
  unlockedThemes: string[];
  unlockedBadges: string[];

  // Today's progress
  todayTasksCompleted: number;
  todayStarsEarned: number;

  // Learning stats
  todayLearningActivities: number;
  todayLearningStars: number;
  totalLearningActivities: number;
  perfectScores: number;
  todaySkillsCompleted: ActivityType[];

  // Daily goal tracking
  dailyStarGoal: number;
  lastMilestoneAchieved: number | null;
}

interface RewardActions {
  // Star management
  earnStars: (amount: number, priority?: keyof typeof PRIORITY_REWARDS) => number;
  spendStars: (amount: number) => boolean;

  // Learning star management
  earnLearningStars: (activityType: ActivityType, score: number) => number;

  // Streak management
  updateStreak: () => void;

  // Streak Freeze (스트릭 보호)
  useStreakFreeze: () => boolean;
  purchaseStreakFreeze: () => boolean;
  getStreakFreezeCount: () => number;

  // Unlocks
  unlockTheme: (themeId: string, cost: number) => boolean;
  unlockBadge: (badgeId: string) => void;
  hasTheme: (themeId: string) => boolean;
  hasBadge: (badgeId: string) => boolean;

  // Getters
  getStreakMultiplier: () => number;
  canAfford: (amount: number) => boolean;
  hasCompletedAllSkillsToday: () => boolean;

  // Daily goal
  getDailyProgress: () => { current: number; goal: number; percentage: number };
  hasDailyGoalCompleted: () => boolean;

  // Milestones
  checkStreakMilestone: () => number | null;
  getNextMilestone: () => number | null;

  // Reset daily stats
  checkAndResetDaily: () => void;
}

const getToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  return dateStr === yesterdayStr;
};

export const useRewardStore = create<RewardState & RewardActions>()(
  persist(
    (set, get) => ({
      // Initial state
      stars: 0,
      totalStarsEarned: 0,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      // Streak Freeze
      streakFreezes: 0,
      streakFreezeUsedToday: false,
      // Unlocked content
      unlockedThemes: ['classic'], // Default theme is always unlocked
      unlockedBadges: [],
      todayTasksCompleted: 0,
      todayStarsEarned: 0,
      // Learning stats
      todayLearningActivities: 0,
      todayLearningStars: 0,
      totalLearningActivities: 0,
      perfectScores: 0,
      todaySkillsCompleted: [],
      // Daily goal
      dailyStarGoal: DAILY_STAR_GOAL,
      lastMilestoneAchieved: null,

      earnStars: (amount, priority) => {
        const state = get();
        state.checkAndResetDaily();

        // Calculate base amount from priority if provided
        const baseAmount = priority ? PRIORITY_REWARDS[priority] : amount;

        // Apply streak multiplier
        const multiplier = getStreakMultiplier(state.streak);
        const finalAmount = Math.round(baseAmount * multiplier);

        set((s) => ({
          stars: s.stars + finalAmount,
          totalStarsEarned: s.totalStarsEarned + finalAmount,
          todayTasksCompleted: s.todayTasksCompleted + 1,
          todayStarsEarned: s.todayStarsEarned + finalAmount,
        }));

        // Update streak when earning stars
        get().updateStreak();

        return finalAmount;
      },

      spendStars: (amount) => {
        const { stars } = get();
        if (stars < amount) return false;

        set((s) => ({ stars: s.stars - amount }));
        return true;
      },

      earnLearningStars: (activityType, score) => {
        const state = get();
        state.checkAndResetDaily();

        // Base amount from activity type
        const baseAmount = LEARNING_REWARDS[activityType];

        // Apply score bonus
        const scoreBonus = getScoreBonus(score);

        // Apply streak multiplier
        const streakMultiplier = getStreakMultiplier(state.streak);

        // Final amount = base * scoreBonus * streakMultiplier
        const finalAmount = Math.round(baseAmount * scoreBonus * streakMultiplier);

        // Track if this is a perfect score
        const isPerfect = score >= 100;

        // Track skill completion for today
        const updatedSkills = state.todaySkillsCompleted.includes(activityType)
          ? state.todaySkillsCompleted
          : [...state.todaySkillsCompleted, activityType];

        set((s) => ({
          stars: s.stars + finalAmount,
          totalStarsEarned: s.totalStarsEarned + finalAmount,
          todayStarsEarned: s.todayStarsEarned + finalAmount,
          todayLearningActivities: s.todayLearningActivities + 1,
          todayLearningStars: s.todayLearningStars + finalAmount,
          totalLearningActivities: s.totalLearningActivities + 1,
          perfectScores: isPerfect ? s.perfectScores + 1 : s.perfectScores,
          todaySkillsCompleted: updatedSkills,
        }));

        // Update streak when learning
        get().updateStreak();

        return finalAmount;
      },

      updateStreak: () => {
        const { lastActiveDate, streak, longestStreak } = get();
        const today = getToday();

        // Already updated today
        if (lastActiveDate === today) return;

        let newStreak = 1;

        if (lastActiveDate) {
          if (isYesterday(lastActiveDate)) {
            // Consecutive day - increase streak
            newStreak = streak + 1;
          }
          // If more than 1 day gap, streak resets to 1
        }

        set({
          streak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
        });
      },

      unlockTheme: (themeId, cost) => {
        const { stars, unlockedThemes } = get();

        // Already unlocked
        if (unlockedThemes.includes(themeId)) return true;

        // Not enough stars
        if (stars < cost) return false;

        set((s) => ({
          stars: s.stars - cost,
          unlockedThemes: [...s.unlockedThemes, themeId],
        }));

        return true;
      },

      unlockBadge: (badgeId) => {
        const { unlockedBadges } = get();
        if (unlockedBadges.includes(badgeId)) return;

        set((s) => ({
          unlockedBadges: [...s.unlockedBadges, badgeId],
        }));
      },

      hasTheme: (themeId) => get().unlockedThemes.includes(themeId),
      hasBadge: (badgeId) => get().unlockedBadges.includes(badgeId),

      getStreakMultiplier: () => getStreakMultiplier(get().streak),

      canAfford: (amount) => get().stars >= amount,

      hasCompletedAllSkillsToday: () => {
        const allSkills: ActivityType[] = [
          'vocabulary',
          'grammar',
          'listening',
          'reading',
          'speaking',
          'writing',
        ];
        return allSkills.every((skill) => get().todaySkillsCompleted.includes(skill));
      },

      // ─────────────────────────────────────
      // Streak Freeze (스트릭 보호)
      // ─────────────────────────────────────

      useStreakFreeze: () => {
        const { streakFreezes, streakFreezeUsedToday, streak } = get();

        // 이미 오늘 사용했거나 보유량이 없으면 실패
        if (streakFreezeUsedToday || streakFreezes <= 0 || streak === 0) {
          return false;
        }

        set((s) => ({
          streakFreezes: s.streakFreezes - 1,
          streakFreezeUsedToday: true,
          // 스트릭은 유지됨 (어제 활동 없어도)
        }));

        return true;
      },

      purchaseStreakFreeze: () => {
        const { stars, streakFreezes } = get();

        // 최대 보유량 초과
        if (streakFreezes >= MAX_STREAK_FREEZES) {
          return false;
        }

        // 비용 부족
        if (stars < STREAK_FREEZE_COST) {
          return false;
        }

        set((s) => ({
          stars: s.stars - STREAK_FREEZE_COST,
          streakFreezes: s.streakFreezes + 1,
        }));

        return true;
      },

      getStreakFreezeCount: () => get().streakFreezes,

      // ─────────────────────────────────────
      // Daily Goal (일일 목표)
      // ─────────────────────────────────────

      getDailyProgress: () => {
        const { todayStarsEarned, dailyStarGoal } = get();
        return {
          current: todayStarsEarned,
          goal: dailyStarGoal,
          percentage: Math.min(100, Math.round((todayStarsEarned / dailyStarGoal) * 100)),
        };
      },

      hasDailyGoalCompleted: () => {
        const { todayStarsEarned, dailyStarGoal } = get();
        return todayStarsEarned >= dailyStarGoal;
      },

      // ─────────────────────────────────────
      // Milestones (마일스톤)
      // ─────────────────────────────────────

      checkStreakMilestone: () => {
        const { streak, lastMilestoneAchieved } = get();

        // 현재 스트릭에 해당하는 마일스톤 찾기
        const milestone = STREAK_MILESTONES.find(
          (m) => streak >= m && (lastMilestoneAchieved === null || m > lastMilestoneAchieved)
        );

        if (milestone) {
          set({ lastMilestoneAchieved: milestone });
          return milestone;
        }

        return null;
      },

      getNextMilestone: () => {
        const { streak } = get();
        return STREAK_MILESTONES.find((m) => m > streak) || null;
      },

      // ─────────────────────────────────────
      // Daily Reset
      // ─────────────────────────────────────

      checkAndResetDaily: () => {
        const { lastActiveDate } = get();
        const today = getToday();

        if (lastActiveDate !== today) {
          set({
            todayTasksCompleted: 0,
            todayStarsEarned: 0,
            todayLearningActivities: 0,
            todayLearningStars: 0,
            todaySkillsCompleted: [],
            streakFreezeUsedToday: false, // 스트릭 프리즈 사용 리셋
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.REWARDS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[RewardStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
    }
  )
);

// Export for use in other stores
export { PRIORITY_REWARDS };
