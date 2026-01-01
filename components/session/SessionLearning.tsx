/**
 * SessionLearning Component
 * 활성 학습 세션 화면 - 타이머 + 영어 입력 테스트
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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

// 정답 체크 함수 - 대소문자 무시, 공백/구두점 유연하게 처리
function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[.,!?'"]/g, '') // 구두점 제거
      .replace(/\s+/g, ' '); // 연속 공백을 하나로

  return normalize(userAnswer) === normalize(correctAnswer);
}

// 유사도 체크 (부분 정답 인정)
function getSimilarity(userAnswer: string, correctAnswer: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[.,!?'"]/g, '')
      .replace(/\s+/g, ' ');

  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);

  if (user === correct) return 100;
  if (correct.includes(user) || user.includes(correct)) return 80;

  // 단어 단위 비교
  const userWords = user.split(' ');
  const correctWords = correct.split(' ');
  const matchingWords = userWords.filter((w) => correctWords.includes(w));

  return Math.round((matchingWords.length / correctWords.length) * 100);
}

function SessionLearningComponent({ onComplete, onCancel }: SessionLearningProps) {
  const { status, currentSession } = useSessionStore(
    useShallow((state) => ({
      status: state.status,
      currentSession: state.currentSession,
    }))
  );

  const getCurrentExpression = useSessionStore((state) => state.getCurrentExpression);
  const getSessionProgress = useSessionStore((state) => state.getSessionProgress);
  const getTimeRemaining = useSessionStore((state) => state.getTimeRemaining);
  const recordAnswer = useSessionStore((state) => state.recordAnswer);
  const nextExpression = useSessionStore((state) => state.nextExpression);
  const pauseSession = useSessionStore((state) => state.pauseSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const endSession = useSessionStore((state) => state.endSession);

  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- setSimilarity is used, value stored for future scoring display
  const [_similarity, setSimilarity] = useState(0);
  const [currentExpression, setCurrentExpression] = useState<Expression | null>(null);

  const inputRef = useRef<TextInput>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Timer tick
  useEffect(() => {
    if (status !== 'active' || currentSession?.isPaused) return;

    const interval = setInterval(() => {
      useSessionStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, currentSession?.isPaused]);

  // Update current expression
  useEffect(() => {
    setCurrentExpression(getCurrentExpression());
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
    setSimilarity(0);
    feedbackAnim.setValue(0);

    // Focus input after a short delay
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [currentSession?.currentIndex, getCurrentExpression, feedbackAnim]);

  // Check for completion
  useEffect(() => {
    if (status === 'completed') {
      onComplete();
    }
  }, [status, onComplete]);

  const handleSubmit = useCallback(() => {
    if (!currentExpression || submitted || !userAnswer.trim()) return;

    Keyboard.dismiss();

    const correct = checkAnswer(userAnswer, currentExpression.english);
    const sim = getSimilarity(userAnswer, currentExpression.english);

    setIsCorrect(correct);
    setSimilarity(sim);
    setSubmitted(true);

    // Record answer
    recordAnswer(currentExpression.id, correct, userAnswer);

    // Animate feedback
    Animated.spring(feedbackAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentExpression, submitted, userAnswer, recordAnswer, feedbackAnim]);

  const handleNext = useCallback(() => {
    const hasNext = nextExpression();
    if (!hasNext) {
      endSession();
    }
  }, [nextExpression, endSession]);

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

  const handleSkip = useCallback(() => {
    if (!currentExpression) return;

    // Skip = wrong answer
    recordAnswer(currentExpression.id, false, '');
    setSubmitted(true);
    setIsCorrect(false);
    setSimilarity(0);

    Animated.spring(feedbackAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentExpression, recordAnswer, feedbackAnim]);

  if (!currentSession || !currentExpression) {
    return null;
  }

  const { minutes, seconds } = getTimeRemaining();
  const { current, total, percentage } = getSessionProgress();
  const config = SESSION_CONFIG[currentSession.type];
  const isPaused = currentSession.isPaused;

  const feedbackScale = feedbackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Pressable style={styles.resumeButton} onPress={handlePauseResume}>
            <Text style={styles.resumeButtonText}>계속하기</Text>
          </Pressable>
        </View>
      )}

      {/* Main Content */}
      {!isPaused && (
        <View style={styles.cardContainer}>
          {/* Question Card */}
          <View style={styles.card}>
            <Text style={styles.questionLabel}>이 문장을 영어로?</Text>
            <Text style={styles.koreanText}>{currentExpression.korean}</Text>

            {currentExpression.context && (
              <View style={styles.contextBox}>
                <Text style={styles.contextText}>💡 {currentExpression.context}</Text>
              </View>
            )}
          </View>

          {/* Input Area - Only show if not submitted */}
          {!submitted && (
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="영어로 입력하세요..."
                placeholderTextColor={COLORS.textSecondary}
                value={userAnswer}
                onChangeText={setUserAnswer}
                onSubmitEditing={handleSubmit}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />

              <View style={styles.buttonRow}>
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>모르겠어요</Text>
                </Pressable>

                <Pressable
                  style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={!userAnswer.trim()}
                >
                  <Text style={styles.submitButtonText}>제출</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Feedback - Only show after submit */}
          {submitted && (
            <Animated.View
              style={[
                styles.feedbackContainer,
                { transform: [{ scale: feedbackScale }], opacity: feedbackAnim },
              ]}
            >
              {/* Result Icon */}
              <View style={[styles.resultIcon, isCorrect ? styles.correctIcon : styles.wrongIcon]}>
                <Text style={styles.resultEmoji}>{isCorrect ? '🎉' : '😅'}</Text>
              </View>

              <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.wrongText]}>
                {isCorrect ? '정답입니다!' : '아쉬워요!'}
              </Text>

              {/* User's answer */}
              {userAnswer && (
                <View style={styles.answerCompare}>
                  <Text style={styles.answerLabel}>내 답변:</Text>
                  <Text style={[styles.userAnswerText, isCorrect && styles.correctAnswer]}>
                    {userAnswer}
                  </Text>
                </View>
              )}

              {/* Correct answer */}
              <View style={styles.answerCompare}>
                <Text style={styles.answerLabel}>정답:</Text>
                <Text style={styles.correctAnswerText}>{currentExpression.english}</Text>
              </View>

              {/* Pronunciation */}
              {currentExpression.pronunciation && (
                <Text style={styles.pronunciation}>/{currentExpression.pronunciation}/</Text>
              )}

              {/* Tips */}
              {currentExpression.tips && (
                <View style={styles.tipsBox}>
                  <Text style={styles.tipsText}>💡 {currentExpression.tips}</Text>
                </View>
              )}

              {/* Next Button */}
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {current < total ? '다음 문제' : '결과 보기'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export const SessionLearning = memo(SessionLearningComponent);
SessionLearning.displayName = 'SessionLearning';

const styles = StyleSheet.create({
  answerCompare: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  answerLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: SIZES.spacing.md,
    padding: SIZES.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: SIZES.spacing.lg,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  contextBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
  },
  contextText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  correctAnswer: {
    color: COLORS.success,
  },
  correctAnswerText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  correctIcon: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  correctText: {
    color: COLORS.success,
  },
  feedbackContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: SIZES.spacing.md,
  },
  inputContainer: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  koreanText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginTop: 20,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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
  pronunciation: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  questionLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultIcon: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 12,
    width: 80,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
  skipButton: {
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 16,
    flex: 1,
    paddingVertical: 16,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flex: 2,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 2,
    color: COLORS.text,
    fontSize: 18,
    minHeight: 80,
    padding: 16,
    textAlignVertical: 'top',
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
  tipsBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
    width: '100%',
  },
  tipsText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
  userAnswerText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
  },
  wrongIcon: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  wrongText: {
    color: COLORS.error,
  },
});
