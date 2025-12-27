/**
 * TrueFalse Exercise Component
 * True/False statement verification exercise
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  commonMistake?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TrueFalseResult {
  questionId: string;
  correct: boolean;
  userAnswer: boolean;
  timeSpent: number;
}

interface TrueFalseProps {
  questions: TrueFalseQuestion[];
  onComplete: (results: TrueFalseResult[]) => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function TrueFalse({ questions, onComplete }: TrueFalseProps) {
  const { colors, isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TrueFalseResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.isTrue;

  // Handle answer selection
  const handleSelect = useCallback(
    async (answer: boolean) => {
      if (selectedAnswer !== null) return;

      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const correct = answer === currentQuestion.isTrue;

      // Haptic feedback
      if (correct) {
        await learnHaptics.correct();
      } else {
        await learnHaptics.wrong();
      }

      const result: TrueFalseResult = {
        questionId: currentQuestion.id,
        correct,
        userAnswer: answer,
        timeSpent,
      };

      setResults((prev) => [...prev, result]);
      setSelectedAnswer(answer);
      setShowExplanation(true);
    },
    [selectedAnswer, currentQuestion, startTime]
  );

  // Handle next question
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  }, [isLastQuestion, onComplete, results]);

  // Get button style based on selection state
  const getButtonStyle = (isTrue: boolean) => {
    const baseStyle = [
      styles.answerButton,
      { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
    ];

    if (selectedAnswer === null) {
      return baseStyle;
    }

    // This button was selected
    if (selectedAnswer === isTrue) {
      if (isCorrect) {
        return [...baseStyle, styles.correctButton];
      } else {
        return [...baseStyle, styles.wrongButton];
      }
    }

    // This is the correct answer (show it if user was wrong)
    if (currentQuestion.isTrue === isTrue && !isCorrect) {
      return [...baseStyle, styles.correctButton];
    }

    return [...baseStyle, styles.disabledButton];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View
        style={[styles.progressContainer, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
      >
        <View
          style={[styles.progressBar, { backgroundColor: COLORS.primary, width: `${progress}%` }]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {currentIndex + 1} / {questions.length}
      </Text>

      {/* Question Card */}
      <Animated.View key={currentIndex} entering={FadeInUp.duration(300)}>
        <Card
          style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            {/* Difficulty Badge */}
            {currentQuestion.difficulty && (
              <View style={styles.difficultyBadge}>
                <MaterialCommunityIcons
                  name={
                    currentQuestion.difficulty === 'easy'
                      ? 'circle-outline'
                      : currentQuestion.difficulty === 'medium'
                        ? 'circle-half-full'
                        : 'circle'
                  }
                  size={14}
                  color={
                    currentQuestion.difficulty === 'easy'
                      ? '#22c55e'
                      : currentQuestion.difficulty === 'medium'
                        ? '#f59e0b'
                        : '#ef4444'
                  }
                />
                <Text
                  style={[
                    styles.difficultyText,
                    {
                      color:
                        currentQuestion.difficulty === 'easy'
                          ? '#22c55e'
                          : currentQuestion.difficulty === 'medium'
                            ? '#f59e0b'
                            : '#ef4444',
                    },
                  ]}
                >
                  {currentQuestion.difficulty === 'easy'
                    ? 'Easy'
                    : currentQuestion.difficulty === 'medium'
                      ? 'Medium'
                      : 'Hard'}
                </Text>
              </View>
            )}

            <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>
              Is this statement TRUE or FALSE?
            </Text>
            <Text style={[styles.statement, { color: colors.text }]}>
              &ldquo;{currentQuestion.statement}&rdquo;
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* True/False Buttons */}
      <View style={styles.buttonsContainer}>
        <Animated.View entering={FadeInUp.duration(300).delay(100)} style={styles.buttonWrapper}>
          <Pressable
            style={getButtonStyle(true)}
            onPress={() => handleSelect(true)}
            disabled={selectedAnswer !== null}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={
                selectedAnswer === null
                  ? '#22c55e'
                  : selectedAnswer === true && isCorrect
                    ? '#fff'
                    : selectedAnswer === true
                      ? '#fff'
                      : currentQuestion.isTrue && !isCorrect
                        ? '#fff'
                        : '#9ca3af'
              }
            />
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    selectedAnswer === null
                      ? '#22c55e'
                      : selectedAnswer === true
                        ? '#fff'
                        : currentQuestion.isTrue && !isCorrect
                          ? '#fff'
                          : '#9ca3af',
                },
              ]}
            >
              TRUE
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(300).delay(200)} style={styles.buttonWrapper}>
          <Pressable
            style={getButtonStyle(false)}
            onPress={() => handleSelect(false)}
            disabled={selectedAnswer !== null}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={32}
              color={
                selectedAnswer === null
                  ? '#ef4444'
                  : selectedAnswer === false && isCorrect
                    ? '#fff'
                    : selectedAnswer === false
                      ? '#fff'
                      : !currentQuestion.isTrue && !isCorrect
                        ? '#fff'
                        : '#9ca3af'
              }
            />
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    selectedAnswer === null
                      ? '#ef4444'
                      : selectedAnswer === false
                        ? '#fff'
                        : !currentQuestion.isTrue && !isCorrect
                          ? '#fff'
                          : '#9ca3af',
                },
              ]}
            >
              FALSE
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Explanation */}
      {showExplanation && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <Animated.View entering={FadeInUp.duration(300)}>
            <Card
              style={[
                styles.explanationCard,
                { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
              ]}
            >
              <Card.Content>
                {/* Result Icon */}
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name={isCorrect ? 'check-decagram' : 'close-octagon'}
                    size={28}
                    color={isCorrect ? '#22c55e' : '#ef4444'}
                  />
                  <Text style={[styles.resultText, { color: isCorrect ? '#22c55e' : '#ef4444' }]}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </Text>
                </View>

                {/* Correct Answer */}
                <View style={styles.answerSection}>
                  <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
                    Correct Answer:
                  </Text>
                  <View style={styles.answerValue}>
                    <MaterialCommunityIcons
                      name={currentQuestion.isTrue ? 'check-circle' : 'close-circle'}
                      size={18}
                      color={currentQuestion.isTrue ? '#22c55e' : '#ef4444'}
                    />
                    <Text
                      style={[
                        styles.answerValueText,
                        { color: currentQuestion.isTrue ? '#22c55e' : '#ef4444' },
                      ]}
                    >
                      {currentQuestion.isTrue ? 'TRUE' : 'FALSE'}
                    </Text>
                  </View>
                </View>

                {/* Explanation */}
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  {currentQuestion.explanation}
                </Text>

                {/* Common Mistake */}
                {currentQuestion.commonMistake && !isCorrect && (
                  <View style={styles.tipSection}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#f59e0b" />
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                      {currentQuestion.commonMistake}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animated.View>
        </Animated.View>
      )}

      {/* Next Button */}
      {selectedAnswer !== null && (
        <Animated.View entering={ZoomIn.duration(300)}>
          <Pressable
            style={[styles.nextButton, { backgroundColor: COLORS.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'See Results' : 'Next Question'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  progressContainer: {
    height: 8,
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: SIZES.borderRadius.full,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
    marginBottom: SIZES.spacing.md,
  },
  questionCard: {
    marginBottom: SIZES.spacing.lg,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.spacing.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  statement: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  buttonWrapper: {
    flex: 1,
  },
  answerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SIZES.spacing.xs,
  },
  correctButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  wrongButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  explanationCard: {
    marginBottom: SIZES.spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  resultText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  answerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  answerLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  answerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerValueText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.sm,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default TrueFalse;
