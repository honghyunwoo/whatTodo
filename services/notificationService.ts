/**
 * Notification Service - Phase 4.1
 * 학습 리마인더 & 스트릭 유지 알림
 *
 * 기능:
 * 1. 일일 학습 리마인더 (사용자 설정 시간)
 * 2. 스트릭 유지 알림 (저녁에 아직 학습 안 했을 때)
 * 3. 연속 학습 축하 알림
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

Notifications.setNotificationChannelAsync('streak-warnings', {
  name: '스트릭 알림',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 500, 250, 500],
  lightColor: '#FF6B6B',
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

const STREAK_WARNING_MESSAGES = [
  { title: '스트릭이 위험해요! 🔥', body: '오늘 학습을 완료해서 연속 기록을 지켜주세요' },
  { title: '잊지 마세요!', body: '오늘 아직 학습하지 않았어요. 스트릭을 유지하세요!' },
  { title: '마지막 기회!', body: '자정 전에 학습을 완료하면 스트릭 유지!' },
];

const STREAK_CELEBRATION_MESSAGES: Record<number, NotificationContent> = {
  7: { title: '1주 연속 학습! 🎉', body: '대단해요! 7일 연속으로 학습하셨네요!' },
  14: { title: '2주 연속! 🌟', body: '14일 연속 학습! 습관이 되어가고 있어요!' },
  30: { title: '한 달 달성! 🏆', body: '30일 연속! 이제 영어가 일상이에요!' },
  50: { title: '50일 돌파! 💎', body: '놀라운 끈기예요! 50일 연속 학습!' },
  100: { title: '100일 전설! 👑', body: '100일 연속! 당신은 진정한 학습 마스터!' },
};

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
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'daily-reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * 스트릭 경고 알림 스케줄링 (저녁 8시)
   */
  async scheduleStreakWarning(currentStreak: number): Promise<string | null> {
    if (currentStreak === 0) return null;

    // 기존 스트릭 경고 취소
    await this.cancelStreakWarning();

    // 랜덤 경고 메시지 선택
    const message =
      STREAK_WARNING_MESSAGES[Math.floor(Math.random() * STREAK_WARNING_MESSAGES.length)];

    try {
      // 오늘 저녁 8시에 알림
      const now = new Date();
      const triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);

      // 이미 8시가 지났으면 스케줄링하지 않음
      if (now >= triggerDate) {
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: `${message.body} (현재 ${currentStreak}일 연속!)`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { type: 'streak-warning', streak: currentStreak },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      console.log('Streak warning scheduled for 8 PM');
      return identifier;
    } catch (error) {
      console.error('Failed to schedule streak warning:', error);
      return null;
    }
  }

  /**
   * 스트릭 경고 알림 취소 (학습 완료 시 호출)
   */
  async cancelStreakWarning(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'streak-warning') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * 스트릭 축하 알림 (즉시 발송)
   */
  async sendStreakCelebration(streak: number): Promise<void> {
    const message = STREAK_CELEBRATION_MESSAGES[streak];
    if (!message) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'streak-celebration', streak },
        },
        trigger: null, // 즉시 발송
      });
    } catch (error) {
      console.error('Failed to send streak celebration:', error);
    }
  }

  /**
   * 학습 완료 시 호출 - 스트릭 경고 취소 + 축하 알림
   */
  async onLearningComplete(currentStreak: number): Promise<void> {
    // 스트릭 경고 취소
    await this.cancelStreakWarning();

    // 마일스톤 달성 시 축하 알림
    if (STREAK_CELEBRATION_MESSAGES[currentStreak]) {
      await this.sendStreakCelebration(currentStreak);
    }
  }

  /**
   * 앱 시작 시 호출 - 오늘 학습 안 했으면 스트릭 경고 스케줄링
   */
  async onAppStart(currentStreak: number, hasStudiedToday: boolean): Promise<void> {
    if (currentStreak > 0 && !hasStudiedToday) {
      await this.scheduleStreakWarning(currentStreak);
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
