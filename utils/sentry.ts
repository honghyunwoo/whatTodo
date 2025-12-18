import * as Sentry from '@sentry/react-native';

// Sentry DSN은 환경 변수에서 가져오거나 빈 문자열로 설정
// 실제 배포 시 Sentry 프로젝트에서 DSN을 발급받아 설정해야 합니다
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

/**
 * Sentry 초기화
 * 앱 시작 시 한 번만 호출
 */
export function initSentry(): void {
  // DSN이 없으면 초기화하지 않음 (개발 환경)
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('[Sentry] DSN not configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // 프로덕션에서만 이벤트 전송
    enabled: !__DEV__,
    // 샘플링 비율 (프로덕션: 100%, 개발: 0%)
    tracesSampleRate: __DEV__ ? 0 : 1.0,
    // 환경 설정
    environment: __DEV__ ? 'development' : 'production',
    // 디버그 모드 (개발 환경에서만)
    debug: __DEV__,
    // 추가 설정
    beforeSend(event) {
      // 필요시 이벤트 필터링 로직 추가
      return event;
    },
  });
}

/**
 * 사용자 정보 설정
 */
export function setSentryUser(userId: string | null, email?: string): void {
  if (userId) {
    Sentry.setUser({ id: userId, email });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * 커스텀 태그 설정
 */
export function setSentryTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * 에러 수동 보고
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.setExtras(context);
  }
  Sentry.captureException(error);
}

/**
 * 메시지 보고
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  Sentry.captureMessage(message, level);
}

/**
 * 브레드크럼 추가 (디버깅용 이벤트 추적)
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Sentry 객체도 export (고급 사용 시)
export { Sentry };
