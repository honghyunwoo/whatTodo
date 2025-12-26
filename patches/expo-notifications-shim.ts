export const AndroidImportance = {
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
  MIN: 1,
};

export const AndroidNotificationPriority = {
  HIGH: 'high',
  DEFAULT: 'default',
  LOW: 'low',
  MIN: 'min',
};

export const SchedulableTriggerInputTypes = {
  DAILY: 'daily',
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
  CALENDAR: 'calendar',
};

export interface NotificationRequest {
  identifier: string;
  content: {
    title?: string | null;
    body?: string | null;
    data?: Record<string, unknown>;
    sound?: boolean | string;
    priority?: string;
  };
  trigger: unknown;
}

export const setNotificationChannelAsync = async () => {};
export const setNotificationHandler = () => {};
export const getPermissionsAsync = async () => ({ status: 'denied' as const });
export const requestPermissionsAsync = async () => ({ status: 'denied' as const });
export const getExpoPushTokenAsync = async () => ({ data: '' });
export const scheduleNotificationAsync = async () => '';
export const cancelScheduledNotificationAsync = async () => {};
export const cancelAllScheduledNotificationsAsync = async () => {};
export const getAllScheduledNotificationsAsync = async (): Promise<NotificationRequest[]> => [];
export const setBadgeCountAsync = async () => {};
