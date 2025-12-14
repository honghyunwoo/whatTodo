/**
 * ShortAnswer Exercise Component
 * Text input-based answer exercise
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  acceptedAnswers: string[]; // Array of acceptable answers
  caseSensitive?: boolean;
  maxLength?: number;
  hint?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ShortAnswerResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  timeSpent: number;
  similarity?: number; // How close was the answer (0-100)
}

interface ShortAnswerProps {
  questions: ShortAnswerQuestion[];
  onComplete: (results: ShortAnswerResult[]) => void;
}

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

/**
 * Normalize string for comparison
 */
function normalizeAnswer(str: string, caseSensitive: boolean): string {
  let normalized = str.trim();
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}

/**
 * Calculate similarity between two strings (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);

  return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Check if answer is correct
 */
function checkAnswer(
  userAnswer: string,
  acceptedAnswers: string[],
  caseSensitive: boolean
): { isCorrect: boolean; bestMatch: string; similarity: number } {
  const normalized = normalizeAnswer(userAnswer, caseSensitive);

  let bestMatch = acceptedAnswers[0];
  let highestSimilarity = 0;

  for (const accepted of acceptedAnswers) {
    const normalizedAccepted = normalizeAnswer(accepted, caseSensitive);

    if (normalized === normalizedAccepted) {
      return { isCorrect: true, bestMatch: accepted, similarity: 100 };
    }

    const similarity = calculateSimilarity(normalized, normalizedAccepted);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = accepted;
    }
  }

  return { isCorrect: false, bestMatch, similarity: highestSimilarity };
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function ShortAnswer({ questions, onComplete }: ShortAnswerProps) {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ShortAnswerResult[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    bestMatch: string;
    similarity: number;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Handle submit answer
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || userInput.trim() === '') return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const result = checkAnswer(
      userInput,
      currentQuestion.acceptedAnswers,
      currentQuestion.caseSensitive ?? false
    );

    // Haptic feedback
    if (result.isCorrect) {
      await learnHaptics.correct();
    } else if (result.similarity >= 80) {
      // Almost correct - light feedback
      await learnHaptics.selection();
    } else {
      await learnHaptics.wrong();
    }

    const answerResult: ShortAnswerResult = {
      questionId: currentQuestion.id,
      correct: result.isCorrect,
      userAnswer: userInput.trim(),
      correctAnswer: result.bestMatch,
      timeSpent,
      similarity: result.similarity,
    };

    setResults((prev) => [...prev, answerResult]);
    setAnswerResult(result);
    setIsSubmitted(true);
  }, [isSubmitted, userInput, currentQuestion, startTime]);

  // Handle next question
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setIsSubmitted(false);
      setAnswerResult(null);
      setShowHint(false);
      setStartTime(Date.now());
      // Focus input for next question
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isLastQuestion, onComplete, results]);

  // Get feedback message
  const getFeedbackMessage = () => {
    if (!answerResult) return '';
    if (answerResult.isCorrect) return 'Correct!';
    if (answerResult.similarity >= 80) return 'Almost there!';
    if (answerResult.similarity >= 50) return 'Close, but not quite';
    return 'Not quite right';
  };

  // Get feedback color
  const getFeedbackColor = () => {
    if (!answerResult) return COLORS.primary;
    if (answerResult.isCorrect) return '#22c55e';
    if (answerResult.similarity >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}>
        <MotiView
          animate={{ width: `${progress}%` }}
          transition={{ type: 'timing', duration: 300 }}
          style={[styles.progressBar, { backgroundColor: COLORS.primary }]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {currentIndex + 1} / {questions.length}
      </Text>

      {/* Question Card */}
      <MotiView
        key={currentIndex}
        from={{ opacity: 0, translateX: 30 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <Card style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
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

            <Text style={[styles.question, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>
          </Card.Content>
        </Card>
      </MotiView>

      {/* Input Section */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 100 }}
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
              borderColor: isSubmitted
                ? getFeedbackColor()
                : userInput.length > 0
                ? COLORS.primary
                : COLORS.border,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your answer..."
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitted}
            maxLength={currentQuestion.maxLength || 100}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          {userInput.length > 0 && !isSubmitted && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setUserInput('')}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Character Count */}
        {currentQuestion.maxLength && (
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {userInput.length} / {currentQuestion.maxLength}
          </Text>
        )}
      </MotiView>

      {/* Hint Button */}
      {currentQuestion.hint && !isSubmitted && !showHint && (
        <Pressable style={styles.hintButton} onPress={() => setShowHint(true)}>
          <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#f59e0b" />
          <Text style={styles.hintButtonText}>Show Hint</Text>
        </Pressable>
      )}

      {/* Hint Display */}
      {showHint && !isSubmitted && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.hintContainer}
        >
          <MaterialCommunityIcons name="lightbulb" size={18} color="#f59e0b" />
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {currentQuestion.hint}
          </Text>
        </MotiView>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor: userInput.trim() ? COLORS.primary : COLORS.border,
              },
            ]}
            onPress={handleSubmit}
            disabled={!userInput.trim()}
          >
            <Text style={[styles.submitButtonText, { color: userInput.trim() ? '#fff' : colors.textSecondary }]}>
              Check Answer
            </Text>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={userInput.trim() ? '#fff' : colors.textSecondary}
            />
          </Pressable>
        </MotiView>
      )}

      {/* Result Card */}
      {isSubmitted && answerResult && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Card
              style={[
                styles.resultCard,
                { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
              ]}
            >
              <Card.Content>
                {/* Result Header */}
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name={
                      answerResult.isCorrect
                        ? 'check-decagram'
                        : answerResult.similarity >= 80
                        ? 'alert-circle'
                        : 'close-octagon'
                    }
                    size={28}
                    color={getFeedbackColor()}
                  />
                  <Text style={[styles.resultText, { color: getFeedbackColor() }]}>
                    {getFeedbackMessage()}
                  </Text>
                </View>

                {/* Similarity Score (if not correct) */}
                {!answerResult.isCorrect && (
                  <View style={styles.similaritySection}>
                    <Text style={[styles.similarityLabel, { color: colors.textSecondary }]}>
                      Accuracy:
                    </Text>
                    <View style={styles.similarityBar}>
                      <View
                        style={[
                          styles.similarityFill,
                          {
                            width: `${answerResult.similarity}%`,
                            backgroundColor: getFeedbackColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.similarityValue, { color: getFeedbackColor() }]}>
                      {answerResult.similarity}%
                    </Text>
                  </View>
                )}

                {/* Your Answer */}
                <View style={styles.answerComparison}>
                  <View style={styles.answerRow}>
                    <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
                      Your answer:
                    </Text>
                    <Text
                      style={[
                        styles.answerText,
                        { color: answerResult.isCorrect ? '#22c55e' : '#ef4444' },
                      ]}
                    >
                      {userInput}
                    </Text>
                  </View>

                  {/* Correct Answer (if wrong) */}
                  {!answerResult.isCorrect && (
                    <View style={styles.answerRow}>
                      <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
                        Correct answer:
                      </Text>
                      <Text style={[styles.answerText, { color: '#22c55e' }]}>
                        {answerResult.bestMatch}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <View style={styles.explanationSection}>
                    <MaterialCommunityIcons name="information" size={18} color={COLORS.primary} />
                    <Text style={[styles.explanationText, { color: colors.text }]}>
                      {currentQuestion.explanation}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </MotiView>
        </Animated.View>
      )}

      {/* Next Button */}
      {isSubmitted && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Pressable
            style={[styles.nextButton, { backgroundColor: COLORS.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'See Results' : 'Next Question'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </MotiView>
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
  question: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 28,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: SIZES.borderRadius.md,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    paddingVertical: SIZES.spacing.md,
  },
  clearButton: {
    padding: SIZES.spacing.xs,
  },
  charCount: {
    fontSize: SIZES.fontSize.xs,
    textAlign: 'right',
    marginBottom: SIZES.spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  hintButtonText: {
    color: '#f59e0b',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.sm,
  },
  submitButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: SIZES.spacing.md,
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
  similaritySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  similarityLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  similarityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  similarityFill: {
    height: '100%',
    borderRadius: 4,
  },
  similarityValue: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  answerComparison: {
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
  },
  answerLabel: {
    fontSize: SIZES.fontSize.sm,
    width: 100,
  },
  answerText: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  explanationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  explanationText: {
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

export default ShortAnswer;
