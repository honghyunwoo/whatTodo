/**
 * Error Handler Utility
 *
 * @created 2025-12-24 - Phase 1.3: 에러 처리 개선
 *
 * 사용자 친화적인 에러 메시지 생성 및 Sentry 연동
 *
 * @example
 * try {
 *   await importBackup(data);
 * } catch (error) {
 *   showUserFriendlyError(error, '백업 복원');
 * }
 */

import { Alert } from 'react-native';
import { captureError } from './sentry';

/**
 * 앱 에러 기본 클래스
 */
export class AppError extends Error {
  constructor(
    public userMessage: string,
    public developerMessage: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(developerMessage);
    this.name = 'AppError';
  }
}

/**
 * 백업 관련 에러
 */
export class BackupError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(`백업 오류: ${message}`, message, 'BACKUP_ERROR', context);
  }
}

/**
 * 학습 관련 에러
 */
export class LearningError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(`학습 오류: ${message}`, message, 'LEARNING_ERROR', context);
  }
}

/**
 * 네트워크 관련 에러
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(`네트워크 오류: ${message}`, message, 'NETWORK_ERROR', context);
  }
}

/**
 * 저장 공간 관련 에러
 */
export class StorageError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(`저장 공간 오류: ${message}`, message, 'STORAGE_ERROR', context);
  }
}

/**
 * 사용자 친화적 에러 메시지 표시
 *
 * @param error - 발생한 에러
 * @param operation - 진행 중이던 작업 (예: "백업 복원", "학습 활동")
 */
export const showUserFriendlyError = (error: unknown, operation: string = '작업'): void => {
  let title = `${operation} 실패`;
  let message = '다시 시도해주세요.';
  let devMessage = String(error);

  // AppError - 개발자가 정의한 에러
  if (error instanceof AppError) {
    title = error.userMessage.split(':')[0] || title;
    message = error.userMessage;
    devMessage = error.developerMessage;
  }
  // SyntaxError - JSON 파싱 실패 (백업 복원에서 자주 발생)
  else if (error instanceof SyntaxError) {
    title = '잘못된 형식';
    message = '백업 파일 형식이 올바르지 않습니다.\n처음부터 다시 내보내기를 해주세요.';
  }
  // TypeError (fetch) - 네트워크 오류
  else if (error instanceof TypeError && String(error).includes('fetch')) {
    title = '네트워크 오류';
    message = '인터넷 연결을 확인해주세요.';
  }
  // Storage 오류
  else if (String(error).includes('AsyncStorage') || String(error).includes('storage')) {
    title = '저장 공간 오류';
    message = '기기 저장 공간을 확인해주세요.';
  }
  // Permission 오류
  else if (String(error).includes('permission') || String(error).includes('denied')) {
    title = '권한 오류';
    message = '필요한 권한을 확인해주세요.';
  }
  // 일반 Error
  else if (error instanceof Error) {
    devMessage = error.message;
    // 사용자에게는 일반적인 메시지만 표시
    if (
      error.message.length < 100 &&
      !error.message.includes('{') &&
      !error.message.includes('[')
    ) {
      message = error.message;
    }
  }

  // 사용자에게 표시
  Alert.alert(title, message, [{ text: '확인' }]);

  // Sentry에 상세 정보 전송 (프로덕션에서만)
  if (!__DEV__) {
    captureError(error as Error, {
      operation,
      userMessage: title,
      timestamp: new Date().toISOString(),
    });
  } else {
    // 개발 환경에서는 콘솔에 출력
    console.error(`[${operation}]`, devMessage, error);
  }
};

/**
 * 에러를 조용히 처리 (사용자에게 표시하지 않고 Sentry에만 보고)
 *
 * @param error - 발생한 에러
 * @param context - 에러 컨텍스트
 */
export const captureSilentError = (error: unknown, context: Record<string, any>): void => {
  if (!__DEV__) {
    captureError(error as Error, context);
  } else {
    console.warn('[Silent Error]', error, context);
  }
};

/**
 * 에러를 Promise rejection으로 변환
 */
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  operation: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    showUserFriendlyError(error, operation);
    return null;
  }
};
