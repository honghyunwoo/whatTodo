/**
 * Notification Service
 * 학습 리마인더
 *
 * 기능:
 * 1. 일일 학습 리마인더 (사용자 설정 시간)
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─────────────────────────────────────
// Configuration
// ─────────────────────────────────────

// 알림 채널 설정 (Android)
Notifications.setNotificationChannelAsync('learning-reminders', {
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

  /**
   * 푸시 알림 권한 요청 및 토큰 획득
   */
  async initialize(): Promise<boolean> {
    // 실제 디바이스에서만 작동
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    try {
      // 기존 권한 확인
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 없으면 요청
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Expo Push Token 획득 (선택적 - 서버 푸시용)
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // EAS 프로젝트 ID
        });
        this.expoPushToken = token.data;
      } catch {
        // 로컬 알림만 사용하는 경우 토큰 없어도 됨
        console.log('Push token not available (local notifications still work)');
      }

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
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * 일일 학습 리마인더 스케줄링
   */
  async scheduleDailyReminder(settings: ReminderSettings): Promise<string | null> {
    if (!settings.enabled) {
      await this.cancelDailyReminder();
      return null;
    }

    // 기존 리마인더 취소
    await this.cancelDailyReminder();

    // 랜덤 메시지 선택
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
          hour: settings.hour,
          minute: settings.minute,
          repeats: true,
          channelId: 'learning-reminders',
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
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * 예약된 알림 목록 조회 (디버그용)
   */
  async getScheduled(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * 알림 배지 수 설정
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * 알림 배지 초기화
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
}

// ─────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────

export const notificationService = new NotificationService();
export default notificationService;
