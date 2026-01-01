/**
 * Streak Store - Phase 0
 * 스트릭 심리학 강화 시스템
 *
 * 심리학 원리: Loss Aversion (손실 회피)
 * - 얻는 기쁨 < 잃는 고통
 * - 스트릭 잃을 위기감 = 강력한 동기 부여
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface StreakState {
  // 코어 스트릭 데이터
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;

  // 스트릭 보호 시스템
  streakFreezes: number;
  usedFreezeToday: boolean;

  // 경고 상태
  streakAtRisk: boolean;
  lastWarningShown: string | null;

  // 마일스톤 추적
  streakMilestones: number[]; // 달성한 마일스톤들 (7, 30, 100 등)
}

interface StreakActions {
  // 스트릭 관리
  checkStreak: () => void;
  updateStreak: () => void;
  resetStreak: () => void;

  // 스트릭 프리즈
  useStreakFreeze: () => boolean;
  addStreakFreeze: (count?: number) => void;
  getStreakFreezeCount: () => number;

  // 경고 시스템
  isStreakAtRisk: () => boolean;
  markWarningShown: () => void;
  shouldShowWarning: () => boolean;

  // 마일스톤
  checkMilestone: () => number | null;
  getNextMilestone: () => number;

  // 유틸리티
  getStreakDisplayInfo: () => StreakDisplayInfo;
}

interface StreakDisplayInfo {
  count: number;
  fire: string;
  label: string;
  isAtRisk: boolean;
  daysUntilNextMilestone: number;
  nextMilestone: number;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];
const RISK_HOUR = 20; // 저녁 8시 이후 경고
const DEFAULT_FREEZES = 1; // 기본 프리즈 1개

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

function isYesterday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getYesterday();
}

function getFireEmoji(streak: number): string {
  if (streak >= 100) return '🔥👑🔥';
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '';
}

function getStreakLabel(streak: number): string {
  if (streak >= 365) return '1년 연속!';
  if (streak >= 100) return '100일 레전드!';
  if (streak >= 60) return '60일 마스터!';
  if (streak >= 30) return '한 달 연속!';
  if (streak >= 14) return '2주 연속!';
  if (streak >= 7) return '일주일 연속!';
  if (streak >= 3) return '3일 연속!';
  return `${streak}일 연속`;
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useStreakStore = create<StreakState & StreakActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakFreezes: DEFAULT_FREEZES,
      usedFreezeToday: false,
      streakAtRisk: false,
      lastWarningShown: null,
      streakMilestones: [],

      /**
       * 스트릭 상태 체크 (앱 시작 시 호출)
       */
      checkStreak: () => {
        const { lastStudyDate, usedFreezeToday } = get();
        const today = getToday();
        const yesterday = getYesterday();

        // 오늘 이미 학습함
        if (lastStudyDate === today) {
          set({ streakAtRisk: false, usedFreezeToday: false });
          return;
        }

        // 어제 학습함 → 스트릭 유지 중, 오늘 안하면 위험
        if (lastStudyDate === yesterday) {
          set({ streakAtRisk: true });
          return;
        }

        // 하루 이상 안함 → 스트릭 리셋 (프리즈 안 썼으면)
        if (lastStudyDate && lastStudyDate < yesterday && !usedFreezeToday) {
          set({
            currentStreak: 0,
            streakAtRisk: false,
          });
        }
      },

      /**
       * 스트릭 업데이트 (학습 완료 시 호출)
       */
      updateStreak: () => {
        const { lastStudyDate, currentStreak, longestStreak } = get();
        const today = getToday();

        // 이미 오늘 업데이트됨
        if (lastStudyDate === today) return;

        let newStreak = 1;

        // 어제 학습했으면 스트릭 유지
        if (isYesterday(lastStudyDate)) {
          newStreak = currentStreak + 1;
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastStudyDate: today,
          streakAtRisk: false,
          usedFreezeToday: false,
        });

        // 마일스톤 체크
        get().checkMilestone();
      },

      /**
       * 스트릭 리셋
       */
      resetStreak: () => {
        set({
          currentStreak: 0,
          streakAtRisk: false,
        });
      },

      /**
       * 스트릭 프리즈 사용
       * @returns 성공 여부
       */
      useStreakFreeze: () => {
        const { streakFreezes, currentStreak, usedFreezeToday } = get();

        // 이미 오늘 사용함
        if (usedFreezeToday) return false;

        // 프리즈 없음
        if (streakFreezes <= 0) return false;

        // 스트릭 없으면 의미 없음
        if (currentStreak <= 0) return false;

        const today = getToday();

        set({
          streakFreezes: streakFreezes - 1,
          lastStudyDate: today, // 오늘 학습한 것으로 처리
          streakAtRisk: false,
          usedFreezeToday: true,
        });

        return true;
      },

      /**
       * 스트릭 프리즈 추가 (보상 등으로)
       */
      addStreakFreeze: (count = 1) => {
        set((state) => ({
          streakFreezes: state.streakFreezes + count,
        }));
      },

      /**
       * 프리즈 수량 조회
       */
      getStreakFreezeCount: () => get().streakFreezes,

      /**
       * 스트릭 위험 상태 체크
       */
      isStreakAtRisk: () => {
        const { lastStudyDate, currentStreak } = get();
        const today = getToday();
        const hour = new Date().getHours();

        // 저녁 8시 이후 + 오늘 학습 안함 + 스트릭 있음
        return hour >= RISK_HOUR && lastStudyDate !== today && currentStreak > 0;
      },

      /**
       * 경고 표시 완료 기록
       */
      markWarningShown: () => {
        set({ lastWarningShown: getToday() });
      },

      /**
       * 경고 표시 필요 여부
       */
      shouldShowWarning: () => {
        const { lastWarningShown, currentStreak } = get();
        const today = getToday();

        // 이미 오늘 표시함
        if (lastWarningShown === today) return false;

        // 스트릭 없으면 경고 불필요
        if (currentStreak <= 0) return false;

        // 위험 상태면 표시
        return get().isStreakAtRisk();
      },

      /**
       * 마일스톤 달성 체크
       * @returns 달성한 마일스톤 숫자 또는 null
       */
      checkMilestone: () => {
        const { currentStreak, streakMilestones } = get();

        for (const milestone of MILESTONES) {
          if (currentStreak === milestone && !streakMilestones.includes(milestone)) {
            set({
              streakMilestones: [...streakMilestones, milestone],
            });
            return milestone;
          }
        }

        return null;
      },

      /**
       * 다음 마일스톤 조회
       */
      getNextMilestone: () => {
        const { currentStreak } = get();

        for (const milestone of MILESTONES) {
          if (milestone > currentStreak) {
            return milestone;
          }
        }

        return MILESTONES[MILESTONES.length - 1];
      },

      /**
       * 스트릭 표시 정보 조회
       */
      getStreakDisplayInfo: (): StreakDisplayInfo => {
        const { currentStreak } = get();
        const nextMilestone = get().getNextMilestone();

        return {
          count: currentStreak,
          fire: getFireEmoji(currentStreak),
          label: getStreakLabel(currentStreak),
          isAtRisk: get().isStreakAtRisk(),
          daysUntilNextMilestone: nextMilestone - currentStreak,
          nextMilestone,
        };
      },
    }),
    {
      name: STORAGE_KEYS.REWARDS + '_streak', // 별도 키 사용
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[StreakStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
    }
  )
);

export default useStreakStore;
