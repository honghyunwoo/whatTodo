/**
 * WrongAnswerReview - 오답 복습 세션 컴포넌트
 * 틀린 문제들을 복습하고 마스터하는 세션
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useWrongAnswerStore, WrongAnswer } from '@/store/wrongAnswerStore';
import { feedbackService } from '@/services/feedbackService';
import { wrongAnswerGenerator, GeneratedOptions } from '@/utils/wrongAnswerGenerator';
import { useUserStore } from '@/store/userStore';

interface WrongAnswerReviewProps {
  limit?: number;
  onComplete?: (correctCount: number, totalCount: number) => void;
  onClose?: () => void;
}

interface ReviewState {
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
}

/**
 * WrongAnswerReview: 오답 복습 세션
 * - 틀린 문제를 카드 형태로 표시
 * - 정답/오답 피드백
 * - 3회 연속 정답 시 마스터
 */
export function WrongAnswerReview({ limit = 10, onComplete, onClose }: WrongAnswerReviewProps) {
  const { colors, isDark } = useTheme();

  // Store
  const getWrongAnswersForReview = useWrongAnswerStore((state) => state.getWrongAnswersForReview);
  const reviewAnswer = useWrongAnswerStore((state) => state.reviewAnswer);
  const startReviewSession = useWrongAnswerStore((state) => state.startReviewSession);
  const completeReviewSession = useWrongAnswerStore((state) => state.completeReviewSession);

  // State
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({
    selectedAnswer: null,
    isCorrect: null,
    showExplanation: false,
  });

  // 세션 시작
  useEffect(() => {
    const answers = getWrongAnswersForReview(limit);
    setWrongAnswers(answers);
    if (answers.length > 0) {
      const id = startReviewSession(answers.map((a) => a.id));
      setSessionId(id);
    }
  }, [getWrongAnswersForReview, limit, startReviewSession]);

  const currentAnswer = wrongAnswers[currentIndex];
  const isLastQuestion = currentIndex === wrongAnswers.length - 1;
  const progress = wrongAnswers.length > 0 ? ((currentIndex + 1) / wrongAnswers.length) * 100 : 0;

  // 사용자 레벨
  const userLevel = useUserStore((state) => state.preferredLevel);

  // 선택지 생성 (4지선다 보장)
  const generatedOptions = useMemo<GeneratedOptions | null>(() => {
    if (!currentAnswer) return null;

    // wrongAnswerGenerator 사용: 정답(1) + 사용자오답(1) + 유사오답(2) = 최소 4개
    return wrongAnswerGenerator.generate4Options(currentAnswer, wrongAnswers, userLevel);
  }, [currentAnswer, wrongAnswers, userLevel]);

  const options = generatedOptions?.options || [];

  // 답변 선택
  const handleSelectAnswer = useCallback(
    async (answer: string) => {
      if (reviewState.selectedAnswer || !currentAnswer) return;

      const isCorrect = answer === currentAnswer.correctAnswer;

      // 피드백
      if (isCorrect) {
        await feedbackService.success();
        setCorrectCount((prev) => prev + 1);
      } else {
        await feedbackService.wrong();
      }

      // Store 업데이트
      reviewAnswer(currentAnswer.id, isCorrect);

      setReviewState({
        selectedAnswer: answer,
        isCorrect,
        showExplanation: true,
      });
    },
    [reviewState.selectedAnswer, currentAnswer, reviewAnswer]
  );

  // 다음으로
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // 세션 완료
      if (sessionId) {
        completeReviewSession(sessionId, correctCount);
      }
      onComplete?.(correctCount, wrongAnswers.length);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setReviewState({
        selectedAnswer: null,
        isCorrect: null,
        showExplanation: false,
      });
    }
  }, [
    isLastQuestion,
    sessionId,
    correctCount,
    wrongAnswers.length,
    completeReviewSession,
    onComplete,
  ]);

  // 옵션 스타일
  const getOptionStyle = useCallback(
    (option: string) => {
      if (!reviewState.selectedAnswer) {
        return [styles.option, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }];
      }

      if (option === currentAnswer?.correctAnswer) {
        return [styles.option, styles.correctOption];
      }

      if (option === reviewState.selectedAnswer && !reviewState.isCorrect) {
        return [styles.option, styles.wrongOption];
      }

      return [styles.option, styles.disabledOption];
    },
    [reviewState, currentAnswer, isDark]
  );

  // 복습할 오답이 없는 경우
  if (wrongAnswers.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>복습할 문제가 없어요!</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          틀린 문제가 생기면 여기서 복습할 수 있어요
        </Text>
        <Button mode="contained" onPress={onClose} style={styles.emptyButton}>
          돌아가기
        </Button>
      </View>
    );
  }

  if (!currentAnswer) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.progressSection}>
          <View
            style={[styles.progressBar, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: COLORS.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {wrongAnswers.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 질문 카드 */}
        <Animated.View entering={FadeIn.duration(300)}>
          <Card
            style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <View style={styles.typeTag}>
                <Text style={styles.typeText}>
                  {currentAnswer.type === 'grammar'
                    ? '문법'
                    : currentAnswer.type === 'vocabulary'
                      ? '어휘'
                      : currentAnswer.type}
                </Text>
              </View>
              <Text style={[styles.question, { color: colors.text }]}>
                {currentAnswer.question}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* 선택지 */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Animated.View
              key={`${currentIndex}-${index}`}
              entering={FadeInUp.duration(300).delay(index * 100)}
            >
              <Pressable
                style={getOptionStyle(option)}
                onPress={() => handleSelectAnswer(option)}
                disabled={!!reviewState.selectedAnswer}
              >
                <Text
                  style={[
                    styles.optionText,
                    option === currentAnswer.correctAnswer && reviewState.selectedAnswer
                      ? styles.correctOptionText
                      : option === reviewState.selectedAnswer && !reviewState.isCorrect
                        ? styles.wrongOptionText
                        : { color: colors.text },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* 해설 */}
        {reviewState.showExplanation && (
          <Animated.View entering={FadeInUp.springify().damping(15)}>
            <Card
              style={[
                styles.explanationCard,
                { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
              ]}
            >
              <Card.Content>
                <View style={styles.explanationHeader}>
                  <Ionicons
                    name={reviewState.isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={reviewState.isCorrect ? COLORS.success : COLORS.danger}
                  />
                  <Text
                    style={[
                      styles.explanationTitle,
                      { color: reviewState.isCorrect ? COLORS.success : COLORS.danger },
                    ]}
                  >
                    {reviewState.isCorrect ? '정답!' : '다시 한번!'}
                  </Text>
                </View>

                {currentAnswer.explanation && (
                  <Text style={[styles.explanationText, { color: colors.text }]}>
                    {currentAnswer.explanation}
                  </Text>
                )}

                <View style={styles.answerInfo}>
                  <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>정답:</Text>
                  <Text style={[styles.answerValue, { color: COLORS.success }]}>
                    {currentAnswer.correctAnswer}
                  </Text>
                </View>

                {/* 마스터 진행률 */}
                <View style={styles.masteryInfo}>
                  <Text style={[styles.masteryLabel, { color: colors.textSecondary }]}>
                    마스터까지:{' '}
                    {3 - (currentAnswer.consecutiveCorrect + (reviewState.isCorrect ? 1 : 0))}회
                    연속 정답 필요
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}

        {/* 다음 버튼 */}
        {reviewState.selectedAnswer && (
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
              {isLastQuestion ? '결과 보기' : '다음 문제'}
            </Button>
          </Animated.View>
        )}

        <View style={{ height: SIZES.spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  answerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.md,
  },
  answerLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  answerValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  closeButton: {
    padding: SIZES.spacing.xs,
  },
  container: {
    flex: 1,
  },
  correctOption: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  correctOptionText: {
    color: COLORS.success,
  },
  disabledOption: {
    opacity: 0.5,
  },
  emptyButton: {
    marginTop: SIZES.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    marginTop: SIZES.spacing.md,
  },
  explanationCard: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  explanationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  explanationText: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
    marginTop: SIZES.spacing.sm,
  },
  explanationTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  masteryInfo: {
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  masteryLabel: {
    fontSize: SIZES.fontSize.xs,
  },
  nextButton: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  option: {
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  optionText: {
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.md,
  },
  progressBar: {
    borderRadius: SIZES.borderRadius.full,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressSection: {
    flex: 1,
    gap: SIZES.spacing.xs,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
  },
  question: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 26,
    marginTop: SIZES.spacing.sm,
  },
  questionCard: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  wrongOption: {
    backgroundColor: COLORS.danger + '20',
    borderColor: COLORS.danger,
  },
  wrongOptionText: {
    color: COLORS.danger,
  },
});
