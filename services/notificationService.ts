/**
 * Notification Service
 * 학습 리마인더
 *
 * 기능:
 * 1. 일일 학습 리마인더 (사용자 설정 시간)
 */

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface ReminderSettings {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────
// Notification Messages
// ─────────────────────────────────────

const REMINDER_MESSAGES = [
  { title: '오늘의 영어 학습', body: '5분만 투자해서 영어 실력을 키워보세요!' },
  { title: '학습 시간이에요!', body: '오늘도 영어와 함께 성장해요' },
  { title: '영어 공부 시간', body: '꾸준함이 실력을 만들어요' },
  { title: '잠깐! 영어 학습', body: '지금 시작하면 오늘 목표 달성!' },
  { title: '영어 학습 리마인더', body: '매일 조금씩, 큰 성장으로!' },
];

// ─────────────────────────────────────
// Service Functions
// ─────────────────────────────────────

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationsModule: typeof import('expo-notifications') | null = null;
  private initialized = false;

  private async getNotificationsModule() {
    if (isWeb) return null;
    if (!this.notificationsModule) {
      try {
        this.notificationsModule = await import('expo-notifications');
      } catch (e) {
        console.log('[NotificationService] Failed to load expo-notifications:', e);
        return null;
      }
    }
    return this.notificationsModule;
  }

  /**
   * 푸시 알림 권한 요청 및 토큰 획득
   */
  async initialize(): Promise<boolean> {
    if (isWeb) {
      console.log('[expo-notifications] Web platform - notifications disabled');
      return false;
    }

    if (this.initialized) return true;

    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return false;

    const Device = await import('expo-device');

    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    try {
      // 알림 채널 설정 (Android)
      await Notifications.setNotificationChannelAsync('learning-reminders', {
        name: '학습 리마인더',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90D9',
      });

      // 알림 핸들러 설정
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id',
        });
        this.expoPushToken = token.data;
      } catch {
        console.log('Push token not available (local notifications still work)');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  async checkPermission(): Promise<boolean> {
    if (isWeb) return false;
    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * 일일 학습 리마인더 스케줄링
   */
  async scheduleDailyReminder(settings: ReminderSettings): Promise<string | null> {
    if (isWeb) return null;

    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return null;

    if (!settings.enabled) {
      await this.cancelDailyReminder();
      return null;
    }

    await this.cancelDailyReminder();

    const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'daily-reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: settings.hour,
          minute: settings.minute,
        },
      });

      console.log(`Daily reminder scheduled at ${settings.hour}:${settings.minute}`);
      return identifier;
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
      return null;
    }
  }

  /**
   * 일일 학습 리마인더 취소
   */
  async cancelDailyReminder(): Promise<void> {
    if (isWeb) return;
    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'daily-reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * 모든 예약된 알림 취소
   */
  async cancelAll(): Promise<void> {
    if (isWeb) return;
    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * 예약된 알림 목록 조회 (디버그용)
   */
  async getScheduled(): Promise<unknown[]> {
    if (isWeb) return [];
    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return [];
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * 알림 배지 수 설정
   */
  async setBadgeCount(count: number): Promise<void> {
    if (isWeb) return;
    const Notifications = await this.getNotificationsModule();
    if (!Notifications) return;
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * 알림 배지 초기화
   */
  async clearBadge(): Promise<void> {
    if (isWeb) return;
    await this.setBadgeCount(0);
  }
}

// ─────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────

export const notificationService = new NotificationService();
export default notificationService;
