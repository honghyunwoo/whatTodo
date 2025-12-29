// Sentry는 개발 중 비활성화 (Expo Go 호환성 문제)
// 프로덕션 빌드 시 다시 활성화 필요
// import * as Sentry from '@sentry/react-native';

/**
 * Sentry 초기화 (현재 비활성화)
 */
export function initSentry(): void {
  if (__DEV__) {
    console.log('[Sentry] Disabled for development');
  }
}

/**
 * 사용자 정보 설정 (비활성화)
 */
export function setSentryUser(_userId: string | null, _email?: string): void {
  // Disabled
}

/**
 * 커스텀 태그 설정 (비활성화)
 */
export function setSentryTag(_key: string, _value: string): void {
  // Disabled
}

/**
 * 에러 수동 보고 (비활성화)
 */
export function captureError(_error: Error, _context?: Record<string, unknown>): void {
  // Disabled
}

/**
 * 메시지 보고 (비활성화)
 */
export function captureMessage(
  _message: string,
  _level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  // Disabled
}

/**
 * 브레드크럼 추가 (비활성화)
 */
export function addBreadcrumb(
  _message: string,
  _category: string,
  _data?: Record<string, unknown>
): void {
  // Disabled
}

// Sentry 객체 mock (호환성 유지)
export const Sentry = {
  init: () => {},
  setUser: () => {},
  setTag: () => {},
  setExtras: () => {},
  captureException: () => {},
  captureMessage: () => {},
  addBreadcrumb: () => {},
};
