/**
 * Error Boundary Component
 *
 * @created 2025-12-24 - Phase 1.3: 에러 처리 개선
 *
 * React 컴포넌트 트리에서 발생한 에러를 catch하여 앱 크래시 방지
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { captureError } from '@/utils/sentry';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * React에서 발생하는 렌더링 에러를 포착하고 사용자에게 친화적인 UI 표시
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Sentry에 에러 전송 (프로덕션에서만)
    if (!__DEV__) {
      captureError(error, {
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
    // 개발 환경에서는 React DevTools에서 자동으로 표시됨
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 커스텀 fallback이 있으면 사용
      if (fallback) {
        return fallback;
      }

      // 기본 에러 UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>앗, 문제가 발생했어요</Text>
            <Text style={styles.message}>
              앱에서 예상치 못한 오류가 발생했습니다.{'\n'}
              잠시 후 다시 시도해주세요.
            </Text>

            {__DEV__ && error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>개발 모드 - 에러 상세:</Text>
                <Text style={styles.errorDetailsText}>{error.toString()}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
  message: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.spacing.xl,
  },
  errorDetails: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: COLORS.danger,
    marginBottom: SIZES.spacing.xs,
  },
  errorDetailsText: {
    fontSize: SIZES.fontSize.xs,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  buttonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ErrorBoundary;
