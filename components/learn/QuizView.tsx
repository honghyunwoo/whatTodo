/**
 * Quiz View
 * 퀴즈 뷰
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { LottieWrapper } from '@/components/common';
import Animated, { FadeIn, FadeOut, FadeInRight, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { Exercise, QuizResult } from '@/types/activity';
import { feedbackService } from '@/services/feedbackService';

interface QuizViewProps {
  exercises: Exercise[];
  onComplete: (results: QuizResult[], totalXP: number) => void;
}

interface AnswerState {
  selected: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
}

export function QuizView({ exercises, onComplete }: QuizViewProps) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>({
    selected: null,
    isCorrect: null,
    showExplanation: false,
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackRef = useRef<any>(null);

  const currentExercise = exercises[currentIndex];
  const isLastQuestion = currentIndex === exercises.length - 1;
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
    setShowFeedback(false);
  }, [currentIndex]);

  const handleSelectAnswer = useCallback(
    async (answer: string) => {
      if (answerState.selected) return;

      const isCorrect = answer === currentExercise.answer;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      // Trigger feedback
      if (isCorrect) {
        await feedbackService.success();
      } else {
        await feedbackService.wrong();
      }

      setShowFeedback(true);
      feedbackRef.current?.play();

      const result: QuizResult = {
        exerciseId: currentExercise.id,
        correct: isCorrect,
        userAnswer: answer,
        timeSpent,
      };

      setResults((prev) => [...prev, result]);
      setAnswerState({
        selected: answer,
        isCorrect,
        showExplanation: true,
      });
    },
    [answerState.selected, currentExercise, startTime]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results, 0);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswerState({
        selected: null,
        isCorrect: null,
        showExplanation: false,
      });
    }
  }, [isLastQuestion, onComplete, results]);

  const getOptionStyle = useCallback(
    (option: string) => {
      if (!answerState.selected) {
        return styles.option;
      }

      if (option === currentExercise.answer) {
        return [styles.option, styles.correctOption];
      }

      if (option === answerState.selected && !answerState.isCorrect) {
        return [styles.option, styles.wrongOption];
      }

      return [styles.option, styles.disabledOption];
    },
    [answerState, currentExercise.answer]
  );

  const getOptionTextStyle = useCallback(
    (option: string) => {
      if (!answerState.selected) {
        return styles.optionText;
      }

      if (option === currentExercise.answer) {
        return [styles.optionText, styles.correctOptionText];
      }

      if (option === answerState.selected && !answerState.isCorrect) {
        return [styles.optionText, styles.wrongOptionText];
      }

      return [styles.optionText, styles.disabledOptionText];
    },
    [answerState, currentExercise.answer]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Feedback Animation Overlay */}
      {showFeedback && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.feedbackOverlay}
          pointerEvents="none"
        >
          <LottieWrapper
            ref={feedbackRef}
            source={
              answerState.isCorrect
                ? require('@/assets/animations/correct-answer.json')
                : require('@/assets/animations/wrong-answer.json')
            }
            style={styles.feedbackAnimation}
            loop={false}
          />
        </Animated.View>
      )}

      {/* 상단: 진행률 & 콤보 */}
      <View style={styles.header}>
        <View style={styles.progressSection}>
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: isDark ? '#38383A' : COLORS.border },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: COLORS.primary, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {exercises.length}
          </Text>
        </View>
      </View>

      {/* 질문 */}
      <Animated.View key={currentIndex} entering={FadeInRight.duration(300)}>
        <Card
          style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            <Text style={[styles.question, { color: colors.text }]}>
              {currentExercise.question}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* 선택지 */}
      <View style={styles.optionsContainer}>
        {currentExercise.options?.map((option, index) => (
          <Animated.View
            key={`${currentIndex}-${index}`}
            entering={FadeInUp.duration(300).delay(index * 100)}
          >
            <Pressable
              style={[
                getOptionStyle(option),
                { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={!!answerState.selected}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* 해설 */}
      {answerState.showExplanation && currentExercise.explanation && (
        <Animated.View entering={FadeInUp.springify().damping(15)}>
          <Card
            style={[
              styles.explanationCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.explanationLabel,
                  { color: answerState.isCorrect ? COLORS.success : COLORS.danger },
                ]}
              >
                {answerState.isCorrect ? '🎉 정답입니다!' : '😢 오답입니다'}
              </Text>
              <Text style={[styles.explanationText, { color: colors.text }]}>
                {currentExercise.explanation}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* 다음 버튼 */}
      {answerState.selected && (
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </Button>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  progressSection: {
    flex: 1,
    marginRight: SIZES.spacing.md,
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  feedbackAnimation: {
    width: 150,
    height: 150,
  },
  praiseContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.md,
  },
  praiseEmoji: {
    fontSize: 32,
    marginBottom: SIZES.spacing.xs,
  },
  praiseText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.sm,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
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
  disabledOptionText: {
    color: COLORS.textSecondary,
  },
  explanationCard: {
    backgroundColor: COLORS.background,
    marginTop: SIZES.spacing.md,
  },
  explanationLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  explanationText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
  },
  nextButton: {
    marginTop: SIZES.spacing.lg,
  },
  option: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  optionText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: SIZES.spacing.lg,
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressContainer: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 8,
    marginBottom: SIZES.spacing.xs,
    overflow: 'hidden',
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
  },
  question: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: COLORS.surface,
  },
  wrongOption: {
    backgroundColor: COLORS.danger + '20',
    borderColor: COLORS.danger,
  },
  wrongOptionText: {
    color: COLORS.danger,
  },
});
