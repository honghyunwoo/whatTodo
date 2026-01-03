/**
 * Backup Store
 *
 * 백업 상태 및 알림 관리
 * - 자동 백업 상태 추적
 * - 백업 실패 알림
 * - 마지막 백업 정보
 */

import { create } from 'zustand';

interface BackupNotification {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

interface BackupState {
  // 백업 상태
  isBackingUp: boolean;
  lastBackupDate: Date | null;
  lastBackupSuccess: boolean;

  // 알림
  notifications: BackupNotification[];
}

interface BackupActions {
  // 백업 상태 업데이트
  setBackingUp: (isBackingUp: boolean) => void;
  setLastBackup: (date: Date, success: boolean) => void;

  // 알림 관리
  addNotification: (type: 'success' | 'error' | 'warning', title: string, message: string) => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  getActiveNotifications: () => BackupNotification[];

  // 백업 실패 알림
  notifyBackupFailed: (error: Error | string) => void;
  notifyBackupSuccess: () => void;
}

export const useBackupStore = create<BackupState & BackupActions>((set, get) => ({
  // Initial state
  isBackingUp: false,
  lastBackupDate: null,
  lastBackupSuccess: true,
  notifications: [],

  // 백업 상태 업데이트
  setBackingUp: (isBackingUp) => set({ isBackingUp }),

  setLastBackup: (date, success) =>
    set({
      lastBackupDate: date,
      lastBackupSuccess: success,
    }),

  // 알림 추가
  addNotification: (type, title, message) => {
    const notification: BackupNotification = {
      id: `backup-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
    };

    set((state) => ({
      notifications: [...state.notifications, notification].slice(-10), // 최대 10개
    }));
  },

  // 알림 닫기
  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, dismissed: true } : n)),
    }));
  },

  // 모든 알림 닫기
  dismissAllNotifications: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, dismissed: true })),
    }));
  },

  // 활성 알림 조회
  getActiveNotifications: () => {
    return get().notifications.filter((n) => !n.dismissed);
  },

  // 백업 실패 알림
  notifyBackupFailed: (error) => {
    const message = typeof error === 'string' ? error : error.message;

    set({
      lastBackupSuccess: false,
    });

    get().addNotification(
      'error',
      '자동 백업 실패',
      `백업에 실패했습니다: ${message}\n설정에서 수동 백업을 권장합니다.`
    );
  },

  // 백업 성공 알림 (조용히)
  notifyBackupSuccess: () => {
    set({
      lastBackupDate: new Date(),
      lastBackupSuccess: true,
    });

    // 성공은 알림 없이 상태만 업데이트
  },
}));

// 편의 함수: 백업 실패 시 호출
export function onBackupFailed(error: Error | string): void {
  useBackupStore.getState().notifyBackupFailed(error);
}

// 편의 함수: 백업 성공 시 호출
export function onBackupSuccess(): void {
  useBackupStore.getState().notifyBackupSuccess();
}
