/**
 * Dictation Exercise Component
 * Listen and type dictation exercise using TTS
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

export interface DictationQuestion {
  id: string;
  audioText: string; // The text to be spoken
  maxReplays?: number; // Default: 3
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
  context?: string; // Optional context for the sentence
}

export interface DictationResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  timeSpent: number;
  replaysUsed: number;
  wordAccuracy: number; // 0-100
  wordDetails: WordDetail[];
}

export interface WordDetail {
  expected: string;
  actual: string | null;
  correct: boolean;
}

interface DictationProps {
  questions: DictationQuestion[];
  onComplete: (results: DictationResult[]) => void;
  speeds?: number[]; // Default: [1.0, 0.8, 0.6]
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const DEFAULT_SPEEDS = [1.0, 0.8, 0.6];
const DEFAULT_MAX_REPLAYS = 3;

// Speed labels
const SPEED_LABELS: Record<number, string> = {
  1.0: 'Normal',
  0.8: 'Slow',
  0.6: 'Slower',
};

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare two texts word by word
 */
function compareWords(expected: string, actual: string): {
  accuracy: number;
  details: WordDetail[];
  isCorrect: boolean;
} {
  const expectedWords = normalizeText(expected).split(' ');
  const actualWords = normalizeText(actual).split(' ');

  const details: WordDetail[] = [];
  let correctCount = 0;

  for (let i = 0; i < expectedWords.length; i++) {
    const expWord = expectedWords[i];
    const actWord = actualWords[i] || null;
    const isCorrect = expWord === actWord;

    if (isCorrect) correctCount++;

    details.push({
      expected: expWord,
      actual: actWord,
      correct: isCorrect,
    });
  }

  // Check for extra words
  for (let i = expectedWords.length; i < actualWords.length; i++) {
    details.push({
      expected: '',
      actual: actualWords[i],
      correct: false,
    });
  }

  const accuracy = Math.round((correctCount / expectedWords.length) * 100);
  const isCorrect = accuracy === 100;

  return { accuracy, details, isCorrect };
}

/**
 * Get first letter hint
 */
function getFirstLetterHint(text: string): string {
  const words = text.split(' ');
  return words.map(word => {
    const firstChar = word.charAt(0);
    const rest = word.slice(1).replace(/[a-zA-Z]/g, '_');
    return firstChar + rest;
  }).join(' ');
}

/**
 * Get word count hint
 */
function getWordCountHint(text: string): number {
  return normalizeText(text).split(' ').length;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function Dictation({
  questions,
  onComplete,
  speeds = DEFAULT_SPEEDS
}: DictationProps) {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<DictationResult[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    accuracy: number;
    details: WordDetail[];
    isCorrect: boolean;
  } | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(speeds[0]);

  // Hint state
  const [showFirstLetterHint, setShowFirstLetterHint] = useState(false);
  const [showWordCountHint, setShowWordCountHint] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const maxReplays = currentQuestion.maxReplays ?? DEFAULT_MAX_REPLAYS;
  const canReplay = replaysUsed < maxReplays && !isSubmitted;

  // Stop speech on unmount or question change
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [currentIndex]);

  // Play the audio text
  const playAudio = useCallback(async () => {
    if (isPlaying || !canReplay) return;

    setIsPlaying(true);
    setReplaysUsed(prev => prev + 1);

    try {
      await Speech.speak(currentQuestion.audioText, {
        language: 'en-US',
        rate: currentSpeed,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      setIsPlaying(false);
    }
  }, [isPlaying, canReplay, currentQuestion.audioText, currentSpeed]);

  // Change playback speed
  const changeSpeed = useCallback(() => {
    const currentIdx = speeds.indexOf(currentSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    setCurrentSpeed(speeds[nextIdx]);
    learnHaptics.selection();
  }, [currentSpeed, speeds]);

  // Handle submit answer
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || userInput.trim() === '') return;

    Speech.stop();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const result = compareWords(currentQuestion.audioText, userInput);

    // Haptic feedback
    if (result.isCorrect) {
      await learnHaptics.correct();
    } else if (result.accuracy >= 80) {
      await learnHaptics.selection();
    } else {
      await learnHaptics.wrong();
    }

    const dictationResult: DictationResult = {
      questionId: currentQuestion.id,
      correct: result.isCorrect,
      userAnswer: userInput.trim(),
      correctAnswer: currentQuestion.audioText,
      timeSpent,
      replaysUsed,
      wordAccuracy: result.accuracy,
      wordDetails: result.details,
    };

    setResults(prev => [...prev, dictationResult]);
    setAnswerResult(result);
    setIsSubmitted(true);
  }, [isSubmitted, userInput, currentQuestion, startTime, replaysUsed]);

  // Handle next question
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results);
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsSubmitted(false);
      setAnswerResult(null);
      setReplaysUsed(0);
      setCurrentSpeed(speeds[0]);
      setShowFirstLetterHint(false);
      setShowWordCountHint(false);
      setStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isLastQuestion, onComplete, results, speeds]);

  // Get feedback message
  const getFeedbackMessage = () => {
    if (!answerResult) return '';
    if (answerResult.isCorrect) return 'Perfect!';
    if (answerResult.accuracy >= 80) return 'Almost there!';
    if (answerResult.accuracy >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };

  // Get feedback color
  const getFeedbackColor = () => {
    if (!answerResult) return COLORS.primary;
    if (answerResult.isCorrect) return '#22c55e';
    if (answerResult.accuracy >= 80) return '#f59e0b';
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

            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Listen and type what you hear
            </Text>

            {/* Context (if provided) */}
            {currentQuestion.context && (
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>
                {currentQuestion.context}
              </Text>
            )}
          </Card.Content>
        </Card>
      </MotiView>

      {/* Audio Controls */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 100 }}
      >
        <View style={styles.audioControls}>
          {/* Play Button */}
          <Pressable
            style={[
              styles.playButton,
              {
                backgroundColor: isPlaying
                  ? '#f59e0b'
                  : canReplay
                  ? COLORS.primary
                  : COLORS.border,
              },
            ]}
            onPress={playAudio}
            disabled={!canReplay || isPlaying}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'volume-high' : 'play'}
              size={32}
              color="#fff"
            />
          </Pressable>

          {/* Speed Control */}
          <Pressable
            style={[styles.speedButton, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
            onPress={changeSpeed}
          >
            <MaterialCommunityIcons name="speedometer" size={20} color={colors.text} />
            <Text style={[styles.speedText, { color: colors.text }]}>
              {SPEED_LABELS[currentSpeed] || `${currentSpeed}x`}
            </Text>
          </Pressable>

          {/* Replay Counter */}
          <View style={styles.replayCounter}>
            <MaterialCommunityIcons
              name="replay"
              size={18}
              color={canReplay ? colors.textSecondary : '#ef4444'}
            />
            <Text
              style={[
                styles.replayText,
                { color: canReplay ? colors.textSecondary : '#ef4444' },
              ]}
            >
              {replaysUsed}/{maxReplays}
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Hint Buttons */}
      {!isSubmitted && (
        <View style={styles.hintButtons}>
          {/* Word Count Hint */}
          {!showWordCountHint && (
            <Pressable
              style={styles.hintButton}
              onPress={() => setShowWordCountHint(true)}
            >
              <MaterialCommunityIcons name="counter" size={16} color="#f59e0b" />
              <Text style={styles.hintButtonText}>Word Count</Text>
            </Pressable>
          )}

          {/* First Letter Hint */}
          {!showFirstLetterHint && (
            <Pressable
              style={styles.hintButton}
              onPress={() => setShowFirstLetterHint(true)}
            >
              <MaterialCommunityIcons name="format-letter-case" size={16} color="#f59e0b" />
              <Text style={styles.hintButtonText}>First Letters</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Hint Displays */}
      {(showWordCountHint || showFirstLetterHint) && !isSubmitted && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.hintContainer}
        >
          {showWordCountHint && (
            <View style={styles.hintRow}>
              <MaterialCommunityIcons name="counter" size={16} color="#f59e0b" />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {getWordCountHint(currentQuestion.audioText)} words
              </Text>
            </View>
          )}
          {showFirstLetterHint && (
            <View style={styles.hintRow}>
              <MaterialCommunityIcons name="format-letter-case" size={16} color="#f59e0b" />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {getFirstLetterHint(currentQuestion.audioText)}
              </Text>
            </View>
          )}
        </MotiView>
      )}

      {/* Input Section */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 200 }}
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
            placeholder="Type what you hear..."
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitted}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </MotiView>

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
            <Text
              style={[
                styles.submitButtonText,
                { color: userInput.trim() ? '#fff' : colors.textSecondary },
              ]}
            >
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
                        : answerResult.accuracy >= 80
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

                {/* Accuracy Score */}
                <View style={styles.accuracySection}>
                  <Text style={[styles.accuracyLabel, { color: colors.textSecondary }]}>
                    Word Accuracy:
                  </Text>
                  <View style={styles.accuracyBar}>
                    <View
                      style={[
                        styles.accuracyFill,
                        {
                          width: `${answerResult.accuracy}%`,
                          backgroundColor: getFeedbackColor(),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.accuracyValue, { color: getFeedbackColor() }]}>
                    {answerResult.accuracy}%
                  </Text>
                </View>

                {/* Word-by-Word Comparison */}
                <View style={styles.wordComparison}>
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                    Word by word:
                  </Text>
                  <View style={styles.wordList}>
                    {answerResult.details.map((detail, index) => (
                      <View
                        key={index}
                        style={[
                          styles.wordBadge,
                          {
                            backgroundColor: detail.correct
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            borderColor: detail.correct ? '#22c55e' : '#ef4444',
                          },
                        ]}
                      >
                        {detail.expected && (
                          <Text
                            style={[
                              styles.wordExpected,
                              { color: detail.correct ? '#22c55e' : '#ef4444' },
                            ]}
                          >
                            {detail.expected}
                          </Text>
                        )}
                        {!detail.correct && detail.actual && (
                          <Text style={styles.wordActual}>
                            ({detail.actual})
                          </Text>
                        )}
                        {!detail.correct && !detail.actual && detail.expected && (
                          <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={12}
                            color="#ef4444"
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Correct Answer */}
                <View style={styles.correctAnswerSection}>
                  <Text style={[styles.correctLabel, { color: colors.textSecondary }]}>
                    Correct sentence:
                  </Text>
                  <Text style={[styles.correctText, { color: colors.text }]}>
                    {currentQuestion.audioText}
                  </Text>
                </View>
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
  instructionText: {
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  contextText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  speedText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  replayCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  replayText: {
    fontSize: SIZES.fontSize.sm,
  },
  hintButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.sm,
  },
  hintButtonText: {
    color: '#f59e0b',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  hintContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  hintText: {
    fontSize: SIZES.fontSize.sm,
    fontFamily: 'monospace',
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: SIZES.borderRadius.md,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    minHeight: 100,
  },
  input: {
    fontSize: SIZES.fontSize.md,
    paddingVertical: SIZES.spacing.md,
    textAlignVertical: 'top',
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
  accuracySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  accuracyLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  accuracyBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 4,
  },
  accuracyValue: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  wordComparison: {
    marginBottom: SIZES.spacing.md,
  },
  comparisonLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  wordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.sm,
    borderWidth: 1,
  },
  wordExpected: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  wordActual: {
    fontSize: SIZES.fontSize.xs,
    color: '#9ca3af',
  },
  correctAnswerSection: {
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  correctLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.xs,
  },
  correctText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    fontStyle: 'italic',
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

export default Dictation;
