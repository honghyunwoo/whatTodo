/**
 * TestView Component
 * Generic test-taking UI that works with testStore
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import { useTestStore } from '@/store/testStore';
import type { TestMeta, TestQuestion } from '@/types/test';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface TestViewProps {
  testMeta: TestMeta;
  questions: TestQuestion[];
  onComplete?: () => void;
  onCancel?: () => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function TestView({ testMeta, questions, onComplete, onCancel }: TestViewProps) {
  const { colors, isDark } = useTheme();

  const {
    currentSession,
    startTest,
    answerQuestion,
    nextQuestion,
    submitTest,
    cancelTest,
    getCurrentProgress,
  } = useTestStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Start test on mount
  useEffect(() => {
    startTest(testMeta, questions);
    setStartTime(Date.now());

    return () => {
      // Clean up if component unmounts without completing
    };
  }, [testMeta, questions, startTest]);

  // Get current question
  const currentQuestion = currentSession?.questions[currentSession.currentIndex];
  const isLastQuestion = currentSession
    ? currentSession.currentIndex === currentSession.questions.length - 1
    : false;
  const progress = getCurrentProgress() / 100;

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    async (answer: string) => {
      if (showFeedback || !currentQuestion) return;

      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const isCorrect = answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();

      setSelectedAnswer(answer);
      setShowFeedback(true);

      // Haptic feedback
      if (isCorrect) {
        await learnHaptics.correct();
      } else {
        await learnHaptics.wrong();
      }

      // Record answer
      answerQuestion(currentQuestion.id, answer, timeSpent, false);

      // Auto-advance after delay
      setTimeout(() => {
        if (isLastQuestion) {
          handleSubmit();
        } else {
          handleNext();
        }
      }, 1500);
    },
    [showFeedback, currentQuestion, startTime, answerQuestion, isLastQuestion]
  );

  // Handle next question
  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStartTime(Date.now());
    nextQuestion();
  }, [nextQuestion]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    const result = submitTest();
    onComplete?.();
    router.replace('/test/result');
  }, [submitTest, onComplete]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelTest();
    onCancel?.();
    router.back();
  }, [cancelTest, onCancel]);

  // Check if answer is correct
  const isAnswerCorrect = (answer: string) => {
    if (!currentQuestion) return false;
    return answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
  };

  // Get option style
  const getOptionStyle = (option: string) => {
    if (!showFeedback) {
      return { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface };
    }

    if (selectedAnswer === option) {
      if (isAnswerCorrect(option)) {
        return { backgroundColor: '#22c55e', borderColor: '#22c55e' };
      } else {
        return { backgroundColor: '#ef4444', borderColor: '#ef4444' };
      }
    }

    if (isAnswerCorrect(option)) {
      return { backgroundColor: '#22c55e', borderColor: '#22c55e' };
    }

    return { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface, opacity: 0.5 };
  };

  if (!currentSession || !currentQuestion) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{testMeta.title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} color={COLORS.primary} style={styles.progressBar} />
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentSession.currentIndex + 1} / {currentSession.questions.length}
        </Text>
      </View>

      {/* Question Card */}
      <Animated.View key={currentQuestion.id} entering={FadeInUp.duration(300)}>
        <Card
          style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            {/* Activity Type Badge */}
            <View style={styles.typeBadge}>
              <MaterialCommunityIcons
                name={
                  currentQuestion.activityType === 'vocabulary'
                    ? 'book-alphabet'
                    : currentQuestion.activityType === 'grammar'
                      ? 'format-text'
                      : currentQuestion.activityType === 'listening'
                        ? 'headphones'
                        : currentQuestion.activityType === 'reading'
                          ? 'book-open-page-variant'
                          : currentQuestion.activityType === 'speaking'
                            ? 'microphone'
                            : 'pencil'
                }
                size={16}
                color={COLORS.primary}
              />
              <Text style={[styles.typeText, { color: COLORS.primary }]}>
                {currentQuestion.activityType.charAt(0).toUpperCase() +
                  currentQuestion.activityType.slice(1)}
              </Text>
            </View>

            {/* Question Text */}
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>

            {/* Points */}
            <View style={styles.pointsBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
              <Text style={styles.pointsText}>{currentQuestion.points} points</Text>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options?.map((option, index) => (
          <Animated.View key={index} entering={FadeInUp.duration(300).delay(100 + index * 50)}>
            <Pressable
              style={[styles.optionButton, getOptionStyle(option), { borderColor: COLORS.border }]}
              onPress={() => handleSelectAnswer(option)}
              disabled={showFeedback}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionLetter,
                    showFeedback && selectedAnswer === option && isAnswerCorrect(option)
                      ? { backgroundColor: '#fff' }
                      : showFeedback && selectedAnswer === option
                        ? { backgroundColor: '#fff' }
                        : { backgroundColor: isDark ? '#38383A' : COLORS.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      showFeedback && selectedAnswer === option
                        ? { color: isAnswerCorrect(option) ? '#22c55e' : '#ef4444' }
                        : { color: colors.text },
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    showFeedback && (selectedAnswer === option || isAnswerCorrect(option))
                      ? { color: '#fff' }
                      : { color: colors.text },
                  ]}
                >
                  {option}
                </Text>
              </View>
              {showFeedback && (
                <MaterialCommunityIcons
                  name={
                    isAnswerCorrect(option)
                      ? 'check-circle'
                      : selectedAnswer === option
                        ? 'close-circle'
                        : undefined
                  }
                  size={24}
                  color={
                    showFeedback && (selectedAnswer === option || isAnswerCorrect(option))
                      ? '#fff'
                      : 'transparent'
                  }
                />
              )}
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Feedback */}
      {showFeedback && currentQuestion.explanation && (
        <Animated.View entering={ZoomIn.duration(300)}>
          <Card
            style={[
              styles.feedbackCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <View style={styles.feedbackHeader}>
                <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
                <Text style={[styles.feedbackTitle, { color: colors.text }]}>Explanation</Text>
              </View>
              <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                {currentQuestion.explanation}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  cancelButton: {
    padding: SIZES.spacing.xs,
  },
  title: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: SIZES.borderRadius.full,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
    marginTop: SIZES.spacing.xs,
  },
  questionCard: {
    marginBottom: SIZES.spacing.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.spacing.sm,
  },
  typeText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 28,
    marginBottom: SIZES.spacing.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: SIZES.fontSize.xs,
    color: '#f59e0b',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  optionText: {
    fontSize: SIZES.fontSize.md,
    flex: 1,
  },
  feedbackCard: {
    marginTop: SIZES.spacing.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  feedbackTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 22,
  },
});

export default TestView;
