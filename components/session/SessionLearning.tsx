/**
 * SessionLearning Component
 * 활성 학습 세션 화면 - 타이머 + 표현 학습
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useShallow } from 'zustand/react/shallow';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useSessionStore } from '@/store/sessionStore';
import { SESSION_CONFIG, Expression } from '@/types/scenario';

interface SessionLearningProps {
  onComplete: () => void;
  onCancel: () => void;
}

function SessionLearningComponent({ onComplete, onCancel }: SessionLearningProps) {
  // Phase 1.2: Zustand 셀렉터 통합 (useShallow)
  const { status, currentSession } = useSessionStore(
    useShallow((state) => ({
      status: state.status,
      currentSession: state.currentSession,
    }))
  );

  // Actions (stable references - no need for useShallow)
  const getCurrentExpression = useSessionStore((state) => state.getCurrentExpression);
  const getSessionProgress = useSessionStore((state) => state.getSessionProgress);
  const getTimeRemaining = useSessionStore((state) => state.getTimeRemaining);
  const recordAnswer = useSessionStore((state) => state.recordAnswer);
  const nextExpression = useSessionStore((state) => state.nextExpression);
  const pauseSession = useSessionStore((state) => state.pauseSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const endSession = useSessionStore((state) => state.endSession);

  const [showAnswer, setShowAnswer] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<Expression | null>(null);
  const flipAnimRef = useRef(new Animated.Value(0));
  const flipAnim = flipAnimRef.current;

  // Phase 1.1: Timer 재구독 문제 수정 - tick 의존성 제거
  useEffect(() => {
    if (status !== 'active' || currentSession?.isPaused) return;

    const interval = setInterval(() => {
      useSessionStore.getState().tick(); // 직접 참조로 재구독 방지
    }, 1000);

    return () => clearInterval(interval);
  }, [status, currentSession?.isPaused]);

  // Update current expression
  useEffect(() => {
    setCurrentExpression(getCurrentExpression());
    setShowAnswer(false);
    flipAnim.setValue(0);
  }, [currentSession?.currentIndex, getCurrentExpression, flipAnim]);

  // Check for completion
  useEffect(() => {
    if (status === 'completed') {
      onComplete();
    }
  }, [status, onComplete]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [flipAnim]);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentExpression) return;

      recordAnswer(currentExpression.id, isCorrect);

      const hasNext = nextExpression();
      if (!hasNext) {
        endSession();
      }
    },
    [currentExpression, recordAnswer, nextExpression, endSession]
  );

  const handlePauseResume = useCallback(() => {
    if (currentSession?.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  }, [currentSession?.isPaused, pauseSession, resumeSession]);

  const handleCancel = useCallback(() => {
    endSession();
    onCancel();
  }, [endSession, onCancel]);

  if (!currentSession || !currentExpression) {
    return null;
  }

  const { minutes, seconds } = getTimeRemaining();
  const { current, total, percentage } = getSessionProgress();
  const config = SESSION_CONFIG[currentSession.type];
  const isPaused = currentSession.isPaused;

  // Animation interpolations
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          onPress={handleCancel}
          iconColor={COLORS.textSecondary}
        />

        <View style={styles.timerContainer}>
          <Text style={[styles.timer, minutes === 0 && seconds <= 10 && styles.timerWarning]}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.sessionType}>{config.label} 세션</Text>
        </View>

        <IconButton
          icon={isPaused ? 'play' : 'pause'}
          size={24}
          onPress={handlePauseResume}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {current} / {total}
        </Text>
      </View>

      {/* Pause Overlay */}
      {isPaused && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseEmoji}>⏸️</Text>
          <Text style={styles.pauseText}>일시정지</Text>
          <Pressable
            style={styles.resumeButton}
            onPress={handlePauseResume}
            accessibilityLabel="계속하기"
            accessibilityRole="button"
            accessibilityHint="일시정지된 세션을 재개합니다"
          >
            <Text style={styles.resumeButtonText}>계속하기</Text>
          </Pressable>
        </View>
      )}

      {/* Card Content */}
      {!isPaused && (
        <View style={styles.cardContainer}>
          {/* Front - Korean */}
          <Animated.View style={[styles.card, { opacity: frontOpacity }]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>한국어</Text>
              <Text style={styles.cardKorean}>{currentExpression.korean}</Text>
              {currentExpression.context && (
                <Text style={styles.cardContext}>💡 {currentExpression.context}</Text>
              )}
            </View>

            <Pressable
              style={styles.showAnswerButton}
              onPress={handleShowAnswer}
              accessibilityLabel="영어 정답 보기"
              accessibilityRole="button"
              accessibilityHint="카드를 뒤집어 영어 표현을 확인합니다"
            >
              <Text style={styles.showAnswerText}>영어 보기</Text>
            </Pressable>
          </Animated.View>

          {/* Back - English */}
          <Animated.View
            style={[styles.card, styles.cardBack, { opacity: backOpacity }]}
            pointerEvents={showAnswer ? 'auto' : 'none'}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>영어</Text>
              <Text style={styles.cardEnglish}>{currentExpression.english}</Text>
              {currentExpression.pronunciation && (
                <Text style={styles.cardPronunciation}>/{currentExpression.pronunciation}/</Text>
              )}
              {currentExpression.tips && (
                <Text style={styles.cardTips}>💡 {currentExpression.tips}</Text>
              )}
            </View>

            <View style={styles.answerButtons}>
              <Pressable
                style={[styles.answerButton, styles.wrongButton]}
                onPress={() => handleAnswer(false)}
                accessibilityLabel="몰랐어요"
                accessibilityRole="button"
                accessibilityHint="이 표현을 복습 목록에 추가합니다"
              >
                <Text style={styles.answerButtonEmoji}>😅</Text>
                <Text style={styles.answerButtonText}>몰랐어요</Text>
              </Pressable>
              <Pressable
                style={[styles.answerButton, styles.correctButton]}
                onPress={() => handleAnswer(true)}
                accessibilityLabel="알았어요"
                accessibilityRole="button"
                accessibilityHint="다음 표현으로 넘어갑니다"
              >
                <Text style={styles.answerButtonEmoji}>✅</Text>
                <Text style={styles.answerButtonText}>알았어요</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

export const SessionLearning = memo(SessionLearningComponent);
SessionLearning.displayName = 'SessionLearning';

const styles = StyleSheet.create({
  answerButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
  },
  answerButtonEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  answerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    elevation: 8,
    marginHorizontal: SIZES.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardBack: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  cardContent: {
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.md,
  },
  cardContext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  cardEnglish: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
  },
  cardKorean: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardPronunciation: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardTips: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 14,
    marginTop: 16,
    padding: 12,
    textAlign: 'center',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  correctButton: {
    backgroundColor: COLORS.success,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: SIZES.spacing.md,
  },
  pauseEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  pauseOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  progressBar: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    flex: 1,
    height: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
  },
  progressFill: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: '100%',
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionType: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  showAnswerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginHorizontal: SIZES.spacing.lg,
    marginVertical: SIZES.spacing.lg,
    paddingVertical: 16,
  },
  showAnswerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  timer: {
    color: COLORS.text,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerWarning: {
    color: COLORS.error,
  },
  wrongButton: {
    backgroundColor: COLORS.error,
  },
});
