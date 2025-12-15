/**
 * User Store - Phase 0
 * 사용자 프로필 및 설정 관리
 *
 * 개인화된 경험을 위한 사용자 정보 저장
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { ActivityType } from '@/types/activity';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface UserState {
  // 기본 정보
  name: string;
  isOnboarded: boolean;
  createdAt: string | null;

  // 설정
  dailyGoal: number; // 하루 목표 레슨 수
  preferredLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // 학습 통계 (빠른 접근용)
  totalDaysStudied: number;
  firstStudyDate: string | null;

  // 스킬 분석
  skillScores: Partial<Record<ActivityType, number>>;
}

interface UserActions {
  // 프로필 관리
  setName: (name: string) => void;
  setOnboarded: () => void;

  // 설정 관리
  setDailyGoal: (goal: number) => void;
  setPreferredLevel: (level: UserState['preferredLevel']) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;

  // 학습 기록
  recordStudyDay: () => void;
  updateSkillScore: (skill: ActivityType, score: number) => void;

  // 분석
  getWeakestSkill: () => ActivityType | undefined;
  getStrongestSkill: () => ActivityType | undefined;

  // 유틸리티
  reset: () => void;
}

// ─────────────────────────────────────
// Default Values
// ─────────────────────────────────────

const DEFAULT_STATE: UserState = {
  name: '',
  isOnboarded: false,
  createdAt: null,
  dailyGoal: 3,
  preferredLevel: 'A1',
  notificationsEnabled: true,
  soundEnabled: true,
  hapticEnabled: true,
  totalDaysStudied: 0,
  firstStudyDate: null,
  skillScores: {},
};

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      /**
       * 이름 설정
       */
      setName: (name: string) => {
        set({
          name: name.trim(),
          createdAt: get().createdAt || new Date().toISOString(),
        });
      },

      /**
       * 온보딩 완료 표시
       */
      setOnboarded: () => {
        set({ isOnboarded: true });
      },

      /**
       * 일일 목표 설정
       */
      setDailyGoal: (goal: number) => {
        set({ dailyGoal: Math.max(1, Math.min(20, goal)) });
      },

      /**
       * 선호 레벨 설정
       */
      setPreferredLevel: (level) => {
        set({ preferredLevel: level });
      },

      /**
       * 알림 토글
       */
      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      /**
       * 사운드 토글
       */
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      /**
       * 햅틱 토글
       */
      toggleHaptic: () => {
        set((state) => ({ hapticEnabled: !state.hapticEnabled }));
      },

      /**
       * 학습일 기록
       */
      recordStudyDay: () => {
        const today = getToday();
        const { firstStudyDate } = get();

        set((state) => ({
          totalDaysStudied: state.totalDaysStudied + 1,
          firstStudyDate: firstStudyDate || today,
        }));
      },

      /**
       * 스킬 점수 업데이트 (이동 평균)
       */
      updateSkillScore: (skill: ActivityType, score: number) => {
        set((state) => {
          const currentScore = state.skillScores[skill] || 50;
          // 이동 평균: 70% 기존 + 30% 새 점수
          const newScore = Math.round(currentScore * 0.7 + score * 0.3);

          return {
            skillScores: {
              ...state.skillScores,
              [skill]: newScore,
            },
          };
        });
      },

      /**
       * 가장 약한 스킬 조회
       */
      getWeakestSkill: () => {
        const { skillScores } = get();
        const entries = Object.entries(skillScores) as [ActivityType, number][];

        if (entries.length === 0) return undefined;

        let weakest: ActivityType | undefined;
        let lowestScore = 100;

        for (const [skill, score] of entries) {
          if (score < lowestScore) {
            lowestScore = score;
            weakest = skill;
          }
        }

        return weakest;
      },

      /**
       * 가장 강한 스킬 조회
       */
      getStrongestSkill: () => {
        const { skillScores } = get();
        const entries = Object.entries(skillScores) as [ActivityType, number][];

        if (entries.length === 0) return undefined;

        let strongest: ActivityType | undefined;
        let highestScore = 0;

        for (const [skill, score] of entries) {
          if (score > highestScore) {
            highestScore = score;
            strongest = skill;
          }
        }

        return strongest;
      },

      /**
       * 초기화
       */
      reset: () => {
        set(DEFAULT_STATE);
      },
    }),
    {
      name: STORAGE_KEYS.REWARDS + '_user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
