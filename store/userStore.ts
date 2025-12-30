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

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const getNotificationService = async () => {
  const mod = await import('@/services/notificationService');
  return mod.notificationService;
};

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

  // 알림 설정
  reminderSettings: ReminderSettings;

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

  // 알림 설정
  setReminderSettings: (settings: ReminderSettings) => Promise<void>;
  initializeNotifications: () => Promise<boolean>;

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
  reminderSettings: {
    enabled: true,
    hour: 9, // 오전 9시 기본값
    minute: 0,
  },
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
       * 알림 설정 변경
       */
      setReminderSettings: async (settings: ReminderSettings) => {
        set({ reminderSettings: settings });
        // 알림 스케줄링 (lazy load)
        const service = await getNotificationService();
        if (settings.enabled) {
          await service.scheduleDailyReminder(settings);
        } else {
          await service.cancelDailyReminder();
        }
      },

      /**
       * 알림 초기화 (앱 시작 시 호출)
       */
      initializeNotifications: async () => {
        const service = await getNotificationService();
        const hasPermission = await service.initialize();
        if (hasPermission) {
          const { reminderSettings } = get();
          if (reminderSettings.enabled) {
            await service.scheduleDailyReminder(reminderSettings);
          }
        }
        return hasPermission;
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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[UserStore] rehydration failed:', error);
        } else if (__DEV__) {
          console.log('[UserStore] rehydrated');
        }
      },
    }
  )
);

export default useUserStore;
