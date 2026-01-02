/**
 * Report Store - 주간/월간 학습 리포트
 * 학습 통계를 집계하고 리포트를 생성
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { ActivityType } from '@/types/activity';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  activitiesCompleted: number;
  correctAnswers: number;
  wrongAnswers: number;
  wordsLearned: number;
  streakMaintained: boolean;
}

export interface WeeklyReport {
  id: string; // YYYY-Wxx (ex: 2026-W01)
  startDate: string;
  endDate: string;
  generatedAt: string;

  // 총계
  totalMinutes: number;
  totalActivities: number;
  totalCorrect: number;
  totalWrong: number;
  totalWords: number;
  daysActive: number;

  // 영역별 진행률
  activityBreakdown: Record<ActivityType, number>;

  // 강점/약점
  strengths: ActivityType[];
  weaknesses: ActivityType[];

  // 스트릭
  streakDays: number;
  streakMaintained: boolean;

  // 개선률
  improvementRate: number; // 이전 주 대비 %
}

interface ReportState {
  dailyStats: DailyStats[];
  weeklyReports: WeeklyReport[];
  lastReportDate: string | null;
}

interface ReportActions {
  // 일일 통계
  recordDailyStat: (stat: Partial<DailyStats>) => void;
  getTodayStats: () => DailyStats | null;
  getStatsForDateRange: (startDate: string, endDate: string) => DailyStats[];

  // 주간 리포트
  generateWeeklyReport: () => WeeklyReport | null;
  getWeeklyReport: (weekId: string) => WeeklyReport | undefined;
  getRecentReports: (limit?: number) => WeeklyReport[];

  // 통계 집계
  getCurrentWeekStats: () => {
    totalMinutes: number;
    totalActivities: number;
    daysActive: number;
  };
  getMonthlyStats: () => {
    totalMinutes: number;
    totalActivities: number;
    averagePerDay: number;
  };

  // 유틸리티
  shouldGenerateReport: () => boolean;
  clearOldStats: (keepDays?: number) => void;
}

// ─────────────────────────────────────
// Helper functions
// ─────────────────────────────────────

const getWeekId = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getWeekStartEnd = (weekId: string): { start: string; end: string } => {
  const [year, week] = weekId.split('-W').map(Number);
  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7 - jan1.getDay() + 1;
  const startDate = new Date(year, 0, 1 + daysOffset);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  totalMinutes: 0,
  activitiesCompleted: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  wordsLearned: 0,
  streakMaintained: false,
});

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useReportStore = create<ReportState & ReportActions>()(
  persist(
    (set, get) => ({
      // Initial state
      dailyStats: [],
      weeklyReports: [],
      lastReportDate: null,

      // 일일 통계 기록
      recordDailyStat: (stat) => {
        const today = getToday();
        set((state) => {
          const existingIndex = state.dailyStats.findIndex((s) => s.date === today);

          if (existingIndex !== -1) {
            // 기존 기록 업데이트
            const updated = [...state.dailyStats];
            updated[existingIndex] = {
              ...updated[existingIndex],
              totalMinutes: updated[existingIndex].totalMinutes + (stat.totalMinutes || 0),
              activitiesCompleted:
                updated[existingIndex].activitiesCompleted + (stat.activitiesCompleted || 0),
              correctAnswers: updated[existingIndex].correctAnswers + (stat.correctAnswers || 0),
              wrongAnswers: updated[existingIndex].wrongAnswers + (stat.wrongAnswers || 0),
              wordsLearned: updated[existingIndex].wordsLearned + (stat.wordsLearned || 0),
              streakMaintained: stat.streakMaintained ?? updated[existingIndex].streakMaintained,
            };
            return { dailyStats: updated };
          } else {
            // 새 기록 추가
            const newStat: DailyStats = {
              ...createEmptyDailyStats(today),
              ...stat,
              date: today,
            };
            return { dailyStats: [...state.dailyStats, newStat] };
          }
        });
      },

      // 오늘 통계
      getTodayStats: () => {
        const today = getToday();
        return get().dailyStats.find((s) => s.date === today) || null;
      },

      // 날짜 범위 통계
      getStatsForDateRange: (startDate, endDate) => {
        return get().dailyStats.filter((s) => s.date >= startDate && s.date <= endDate);
      },

      // 주간 리포트 생성
      generateWeeklyReport: () => {
        const weekId = getWeekId();
        const { start, end } = getWeekStartEnd(weekId);
        const weekStats = get().getStatsForDateRange(start, end);

        if (weekStats.length === 0) {
          return null;
        }

        // 집계
        const totals = weekStats.reduce(
          (acc, stat) => ({
            totalMinutes: acc.totalMinutes + stat.totalMinutes,
            totalActivities: acc.totalActivities + stat.activitiesCompleted,
            totalCorrect: acc.totalCorrect + stat.correctAnswers,
            totalWrong: acc.totalWrong + stat.wrongAnswers,
            totalWords: acc.totalWords + stat.wordsLearned,
            streakDays: acc.streakDays + (stat.streakMaintained ? 1 : 0),
          }),
          {
            totalMinutes: 0,
            totalActivities: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalWords: 0,
            streakDays: 0,
          }
        );

        // 이전 주 리포트와 비교
        const reports = get().weeklyReports;
        const prevReport = reports.length > 0 ? reports[reports.length - 1] : null;
        const improvementRate = prevReport
          ? Math.round(
              ((totals.totalActivities - prevReport.totalActivities) /
                Math.max(prevReport.totalActivities, 1)) *
                100
            )
          : 0;

        const report: WeeklyReport = {
          id: weekId,
          startDate: start,
          endDate: end,
          generatedAt: new Date().toISOString(),
          ...totals,
          daysActive: weekStats.length,
          activityBreakdown: {
            vocabulary: 0,
            grammar: 0,
            listening: 0,
            reading: 0,
            speaking: 0,
            writing: 0,
          },
          strengths: [],
          weaknesses: [],
          streakMaintained: totals.streakDays >= 5,
          improvementRate,
        };

        set((state) => ({
          weeklyReports: [...state.weeklyReports.slice(-11), report], // 최근 12주 유지
          lastReportDate: getToday(),
        }));

        return report;
      },

      // 주간 리포트 조회
      getWeeklyReport: (weekId) => {
        return get().weeklyReports.find((r) => r.id === weekId);
      },

      // 최근 리포트 목록
      getRecentReports: (limit = 4) => {
        return get().weeklyReports.slice(-limit).reverse();
      },

      // 현재 주 통계
      getCurrentWeekStats: () => {
        const weekId = getWeekId();
        const { start, end } = getWeekStartEnd(weekId);
        const weekStats = get().getStatsForDateRange(start, end);

        return {
          totalMinutes: weekStats.reduce((sum, s) => sum + s.totalMinutes, 0),
          totalActivities: weekStats.reduce((sum, s) => sum + s.activitiesCompleted, 0),
          daysActive: weekStats.length,
        };
      },

      // 월간 통계
      getMonthlyStats: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
        const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const monthStats = get().getStatsForDateRange(startOfMonth, endOfMonth);

        const totalMinutes = monthStats.reduce((sum, s) => sum + s.totalMinutes, 0);
        const totalActivities = monthStats.reduce((sum, s) => sum + s.activitiesCompleted, 0);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return {
          totalMinutes,
          totalActivities,
          averagePerDay: Math.round(totalMinutes / daysInMonth),
        };
      },

      // 리포트 생성 필요 여부
      shouldGenerateReport: () => {
        const { lastReportDate, weeklyReports } = get();
        const currentWeekId = getWeekId();

        // 이번 주 리포트가 없으면 생성 필요
        const hasCurrentWeekReport = weeklyReports.some((r) => r.id === currentWeekId);
        if (hasCurrentWeekReport) return false;

        // 일요일이고 마지막 리포트가 오늘이 아니면 생성
        const today = new Date();
        if (today.getDay() === 0 && lastReportDate !== getToday()) {
          return true;
        }

        return false;
      },

      // 오래된 통계 정리
      clearOldStats: (keepDays = 90) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - keepDays);
        const cutoff = cutoffDate.toISOString().split('T')[0];

        set((state) => ({
          dailyStats: state.dailyStats.filter((s) => s.date >= cutoff),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.REPORTS || 'reports-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[ReportStore] rehydration failed:', error);
        }
      },
    }
  )
);
