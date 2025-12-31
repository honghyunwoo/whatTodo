/**
 * Session Page
 * 30초/1분/5분 학습 세션 화면
 *
 * PRD 핵심:
 * - 30-50-20 콘텐츠 비율 (성공/약점/확장)
 * - 타이머 표시
 * - 오류 정상화 피드백
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/store/sessionStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSkillStore } from '@/store/skillStore';
import { useRewardStore } from '@/store/rewardStore';
import {
  SessionType,
  SESSION_CONFIG,
  Expression,
  createNormalizedErrorMessage,
} from '@/types/scenario';

// ─────────────────────────────────────
// 피드백 모달 컴포넌트
// ─────────────────────────────────────

interface FeedbackModalProps {
  visible: boolean;
  isCorrect: boolean;
  expression: Expression | null;
  onContinue: () => void;
}

function FeedbackModal({ visible, isCorrect, expression, onContinue }: FeedbackModalProps) {
  const { colors, isDark } = useTheme();

  if (!visible || !expression) return null;

  const mistake = expression.commonMistakes?.[0];

  return (
    <View style={styles.feedbackOverlay}>
      <View
        style={[
          styles.feedbackCard,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopColor: isCorrect ? '#4CAF50' : '#FF9800',
          },
        ]}
      >
        {/* 결과 아이콘 */}
        <View style={[styles.feedbackIcon, { backgroundColor: isCorrect ? '#E8F5E9' : '#FFF3E0' }]}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'bulb'}
            size={48}
            color={isCorrect ? '#4CAF50' : '#FF9800'}
          />
        </View>

        {/* 메시지 */}
        <Text style={[styles.feedbackTitle, { color: colors.text }]}>
          {isCorrect ? '잘했어요!' : '조금만 더!'}
        </Text>

        {/* 정답 표시 */}
        <View style={styles.answerBox}>
          <Text style={[styles.koreanAnswer, { color: colors.text }]}>{expression.korean}</Text>
          <Text style={[styles.englishAnswer, { color: '#007AFF' }]}>{expression.english}</Text>
        </View>

        {/* 오류 정상화 메시지 */}
        {!isCorrect && mistake && (
          <View style={styles.mistakeBox}>
            <Text style={styles.mistakePercent}>
              {createNormalizedErrorMessage(mistake.percentage, '')}
            </Text>
            <Text style={[styles.mistakeExplanation, { color: colors.textSecondary }]}>
              {mistake.explanationKo}
            </Text>
          </View>
        )}

        {/* 팁 */}
        {expression.tips && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={16} color="#FF9800" />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>{expression.tips}</Text>
          </View>
        )}

        {/* 계속 버튼 */}
        <Pressable
          style={[styles.continueButton, { backgroundColor: isCorrect ? '#4CAF50' : '#007AFF' }]}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────

export default function SessionScreen() {
  const router = useRouter();
  const { type, scenarioId } = useLocalSearchParams<{ type: SessionType; scenarioId: string }>();
  const { colors, isDark } = useTheme();

  // Store
  const {
    status,
    startSession,
    recordAnswer,
    nextExpression,
    getCurrentExpression,
    getSessionProgress,
    getTimeRemaining,
    tick,
    endSession,
    cancelSession,
  } = useSessionStore();

  const { getScenario, updateProgress } = useScenarioStore();
  const { recordSkillAttempt } = useSkillStore();
  const { earnStars } = useRewardStore();

  // Local state
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    expression: Expression | null;
  }>({
    isCorrect: false,
    expression: null,
  });

  // Animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 시나리오 데이터
  const scenario = useMemo(() => getScenario(scenarioId), [getScenario, scenarioId]);

  // 세션 시작 - 페이지 진입 시 한 번만 실행
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    // 이미 시작했거나, 시나리오가 없으면 무시
    if (sessionStartedRef.current || !scenario) return;

    // active 상태면 이미 진행 중
    if (status === 'active') {
      sessionStartedRef.current = true;
      return;
    }

    // idle 또는 completed 상태에서 새 세션 시작
    if (status === 'idle' || status === 'completed') {
      sessionStartedRef.current = true;
      startSession(type, scenarioId, scenario.expressions);
    }
  }, [scenario, type, scenarioId, startSession, status]);

  // 타이머
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [status, tick]);

  // 진행률 애니메이션
  useEffect(() => {
    const { percentage } = getSessionProgress();
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [getSessionProgress, progressAnim]);

  // 현재 표현
  const currentExpression = getCurrentExpression();
  const { current, total } = getSessionProgress();
  const { minutes, seconds } = getTimeRemaining();

  // 정답 확인
  const handleCheckAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentExpression) return;

      // 답변 기록
      recordAnswer(currentExpression.id, isCorrect);

      // 스킬 업데이트
      if (currentExpression.skills) {
        recordSkillAttempt(currentExpression.skills, isCorrect);
      }

      // 시나리오 진행 업데이트
      updateProgress(scenarioId, currentExpression.id, isCorrect);

      // 피드백 표시
      setLastResult({ isCorrect, expression: currentExpression });
      setShowFeedback(true);
      setShowAnswer(false);
    },
    [currentExpression, recordAnswer, recordSkillAttempt, updateProgress, scenarioId]
  );

  // 다음 표현으로
  const handleContinue = useCallback(() => {
    setShowFeedback(false);
    const hasNext = nextExpression();

    if (!hasNext) {
      // 세션 종료
      const result = endSession();
      if (result) {
        // 별 지급 (점수에 따라)
        const starsEarned = Math.ceil(result.score / 20); // 20점당 1별
        earnStars(starsEarned);

        // 결과 화면으로
        router.replace({
          pathname: '/session/result',
          params: {
            score: result.score.toString(),
            correct: result.correctCount.toString(),
            total: result.totalCount.toString(),
            stars: starsEarned.toString(),
          },
        });
      }
    }
  }, [nextExpression, endSession, earnStars, router]);

  // 세션 취소
  const handleCancel = useCallback(() => {
    cancelSession();
    router.back();
  }, [cancelSession, router]);

  // 세션이 완료되었거나 로딩 중인 경우
  if (status === 'completed' || !currentExpression) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {status === 'completed' ? '세션 완료!' : '세션 준비 중...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        {/* 진행률 바 */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {current}/{total}
          </Text>
        </View>

        {/* 타이머 */}
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={18} color={minutes < 1 ? '#FF3B30' : colors.text} />
          <Text style={[styles.timerText, { color: minutes < 1 ? '#FF3B30' : colors.text }]}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {/* 질문 카드 */}
        <View
          style={[
            styles.questionCard,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            !isDark && SHADOWS.lg,
          ]}
        >
          <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>
            이 문장을 영어로?
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentExpression.korean}
          </Text>

          {/* 힌트 버튼 */}
          {currentExpression.context && (
            <View style={styles.contextBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>
                {currentExpression.context}
              </Text>
            </View>
          )}
        </View>

        {/* 정답 표시 영역 */}
        {showAnswer && (
          <View
            style={[
              styles.answerCard,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              !isDark && SHADOWS.md,
            ]}
          >
            <Text style={styles.answerLabel}>정답</Text>
            <Text style={[styles.answerText, { color: '#007AFF' }]}>
              {currentExpression.english}
            </Text>
            {currentExpression.pronunciation && (
              <Text style={[styles.pronunciationText, { color: colors.textSecondary }]}>
                {currentExpression.pronunciation}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtons}>
        {!showAnswer ? (
          <Pressable
            style={[styles.showAnswerButton, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}
            onPress={() => setShowAnswer(true)}
          >
            <Ionicons name="eye-outline" size={24} color={colors.text} />
            <Text style={[styles.showAnswerText, { color: colors.text }]}>정답 보기</Text>
          </Pressable>
        ) : (
          <View style={styles.resultButtons}>
            <Pressable
              style={[styles.resultButton, styles.wrongButton]}
              onPress={() => handleCheckAnswer(false)}
            >
              <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              <Text style={styles.resultButtonText}>틀렸어요</Text>
            </Pressable>
            <Pressable
              style={[styles.resultButton, styles.correctButton]}
              onPress={() => handleCheckAnswer(true)}
            >
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              <Text style={styles.resultButtonText}>맞았어요!</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 피드백 모달 */}
      <FeedbackModal
        visible={showFeedback}
        isCorrect={lastResult.isCorrect}
        expression={lastResult.expression}
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontSize.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    gap: SIZES.spacing.md,
  },
  closeButton: {
    padding: SIZES.spacing.xs,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    minWidth: 36,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
  },
  timerText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
    justifyContent: 'center',
    gap: SIZES.spacing.lg,
  },
  questionCard: {
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.borderRadius.xl,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
  },
  questionText: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
  },
  contextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: SIZES.borderRadius.md,
  },
  contextText: {
    fontSize: SIZES.fontSize.sm,
    flex: 1,
  },
  answerCard: {
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: SIZES.fontSize.sm,
    color: '#4CAF50',
    marginBottom: SIZES.spacing.xs,
  },
  answerText: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  pronunciationText: {
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
  },
  bottomButtons: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
  },
  showAnswerText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
  },
  wrongButton: {
    backgroundColor: '#FF9800',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  resultButtonText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Feedback Modal
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  feedbackCard: {
    borderTopLeftRadius: SIZES.borderRadius.xl,
    borderTopRightRadius: SIZES.borderRadius.xl,
    borderTopWidth: 4,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
  },
  feedbackIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  feedbackTitle: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.md,
  },
  answerBox: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  koreanAnswer: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  englishAnswer: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginTop: 4,
  },
  mistakeBox: {
    backgroundColor: '#FFF3E0',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.md,
    alignSelf: 'stretch',
  },
  mistakePercent: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  mistakeExplanation: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: SIZES.spacing.lg,
    alignSelf: 'stretch',
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  continueButton: {
    alignSelf: 'stretch',
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
