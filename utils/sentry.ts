/**
 * Sentry Error Monitoring
 *
 * 프로덕션 빌드에서만 활성화됩니다.
 * Expo Go에서는 호환성 문제로 비활성화됩니다.
 *
 * 환경 변수:
 * - SENTRY_DSN: EAS Secrets에서 설정
 *
 * @see https://docs.sentry.io/platforms/react-native/
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// 프로덕션 빌드 여부 확인 (Expo Go가 아닌 경우)
const isProduction = !__DEV__ && Constants.appOwnership !== 'expo';

// DSN은 EAS secrets에서 주입되거나 app.json extra에서 가져옴
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';

// Sentry 초기화 상태
let isInitialized = false;

/**
 * Sentry 초기화
 * 앱 시작 시 한 번 호출됩니다.
 */
export function initSentry(): void {
  // 이미 초기화됨
  if (isInitialized) {
    return;
  }

  // 개발 모드 또는 DSN 없음
  if (!isProduction || !SENTRY_DSN) {
    if (__DEV__) {
      console.log('[Sentry] Development mode - monitoring disabled');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: __DEV__ ? 'development' : 'production',

      // 성능 모니터링 (선택적)
      tracesSampleRate: 0.2, // 20% 샘플링

      // 에러 필터링
      beforeSend(event) {
        // 민감한 정보 제거
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },

      // 디버그 모드 (개발 시만)
      debug: __DEV__,
    });

    isInitialized = true;

    if (__DEV__) {
      console.log('[Sentry] Initialized successfully');
    }
  } catch (error) {
    console.warn('[Sentry] Initialization failed:', error);
  }
}

/**
 * 사용자 정보 설정
 * 로그인 후 호출하여 에러에 사용자 컨텍스트 추가
 */
export function setSentryUser(userId: string | null, email?: string): void {
  if (!isProduction || !isInitialized) return;

  if (userId) {
    Sentry.setUser({
      id: userId,
      // 이메일은 선택적 (개인정보 주의)
      ...(email && { email }),
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * 커스텀 태그 설정
 * 에러 분류에 도움이 되는 메타데이터 추가
 */
export function setSentryTag(key: string, value: string): void {
  if (!isProduction || !isInitialized) return;

  Sentry.setTag(key, value);
}

/**
 * 에러 수동 보고
 * try-catch에서 잡은 에러를 Sentry에 보고
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!isProduction || !isInitialized) {
    // 개발 모드에서는 콘솔에 출력
    if (__DEV__) {
      console.error('[Sentry] Error captured:', error, context);
    }
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

/**
 * 메시지 보고
 * 에러가 아닌 중요한 이벤트 기록
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  if (!isProduction || !isInitialized) {
    if (__DEV__) {
      console.log(`[Sentry] Message (${level}):`, message);
    }
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * 브레드크럼 추가
 * 에러 발생 전 사용자 행동 추적
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (!isProduction || !isInitialized) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * 네비게이션 브레드크럼
 * 화면 전환 추적
 */
export function trackNavigation(routeName: string, params?: Record<string, unknown>): void {
  addBreadcrumb(`Navigated to ${routeName}`, 'navigation', params);
}

/**
 * 사용자 액션 브레드크럼
 * 버튼 클릭 등 사용자 인터랙션 추적
 */
export function trackUserAction(action: string, details?: Record<string, unknown>): void {
  addBreadcrumb(action, 'user', details);
}

// Sentry 객체 re-export (고급 사용)
export { Sentry };

// 기본 export
export default {
  init: initSentry,
  setUser: setSentryUser,
  setTag: setSentryTag,
  captureError,
  captureMessage,
  addBreadcrumb,
  trackNavigation,
  trackUserAction,
};
