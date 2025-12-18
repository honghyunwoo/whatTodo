/**
 * Minimal Pairs Exercise Component
 * 최소 대립쌍 발음 구분 훈련 (ship/sheep, beach/bitch 등)
 * 한국인 영어 학습자를 위한 발음 구분 연습
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface MinimalPair {
  id: string;
  word1: string;
  word2: string;
  pronunciation1: string; // IPA
  pronunciation2: string;
  meaning1: string; // Korean meaning
  meaning2: string;
  soundFocus: string; // e.g., "/ɪ/ vs /iː/", "/r/ vs /l/"
  koreanTip: string; // Korean-specific pronunciation tip
  category: 'vowel' | 'consonant' | 'stress';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MinimalPairQuestion {
  pair: MinimalPair;
  targetWord: 1 | 2; // Which word to speak
  showHint: boolean;
}

export interface MinimalPairsResult {
  pairId: string;
  correct: boolean;
  userChoice: 1 | 2;
  targetWord: 1 | 2;
  timeSpent: number;
  replaysUsed: number;
}

interface MinimalPairsProps {
  questions: MinimalPairQuestion[];
  onComplete: (results: MinimalPairsResult[]) => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const MAX_REPLAYS = 5;
const SPEEDS = [1.0, 0.8, 0.6];
const SPEED_LABELS: Record<number, string> = {
  1.0: '보통',
  0.8: '느리게',
  0.6: '더 느리게',
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function MinimalPairs({ questions, onComplete }: MinimalPairsProps) {
  const { colors, isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<MinimalPairsResult[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<1 | 2 | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(SPEEDS[0]);

  // Show tip state
  const [showTip, setShowTip] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentPair = currentQuestion.pair;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const canReplay = replaysUsed < MAX_REPLAYS && !isSubmitted;

  // Get target word
  const targetWord = currentQuestion.targetWord === 1 ? currentPair.word1 : currentPair.word2;

  // Stop speech on unmount or question change
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [currentIndex]);

  // Play the target word
  const playAudio = useCallback(async () => {
    if (isPlaying || !canReplay) return;

    setIsPlaying(true);
    setReplaysUsed((prev) => prev + 1);

    try {
      await Speech.speak(targetWord, {
        language: 'en-US',
        rate: currentSpeed,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, canReplay, targetWord, currentSpeed]);

  // Play word for comparison (after submission)
  const playWord = useCallback(async (word: string) => {
    try {
      await Speech.speak(word, {
        language: 'en-US',
        rate: 0.8,
      });
    } catch {
      // Silent fail
    }
  }, []);

  // Change playback speed
  const changeSpeed = useCallback(() => {
    const currentIdx = SPEEDS.indexOf(currentSpeed);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    setCurrentSpeed(SPEEDS[nextIdx]);
    learnHaptics.selection();
  }, [currentSpeed]);

  // Handle word selection
  const handleSelect = useCallback(
    (choice: 1 | 2) => {
      if (isSubmitted) return;
      setSelectedChoice(choice);
      learnHaptics.selection();
    },
    [isSubmitted]
  );

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || selectedChoice === null) return;

    Speech.stop();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = selectedChoice === currentQuestion.targetWord;

    if (correct) {
      await learnHaptics.correct();
    } else {
      await learnHaptics.wrong();
    }

    const result: MinimalPairsResult = {
      pairId: currentPair.id,
      correct,
      userChoice: selectedChoice,
      targetWord: currentQuestion.targetWord,
      timeSpent,
      replaysUsed,
    };

    setResults((prev) => [...prev, result]);
    setIsCorrect(correct);
    setIsSubmitted(true);
  }, [isSubmitted, selectedChoice, currentQuestion, currentPair, startTime, replaysUsed]);

  // Handle next
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsSubmitted(false);
      setIsCorrect(false);
      setReplaysUsed(0);
      setCurrentSpeed(SPEEDS[0]);
      setShowTip(false);
      setStartTime(Date.now());
    }
  }, [isLastQuestion, onComplete, results]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vowel':
        return 'alpha-a-circle';
      case 'consonant':
        return 'alpha-c-circle';
      case 'stress':
        return 'music-note';
      default:
        return 'microphone';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View
        style={[styles.progressContainer, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
      >
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
        <Card
          style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            {/* Category & Difficulty Badge */}
            <View style={styles.badges}>
              <View style={styles.categoryBadge}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(currentPair.category)}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={[styles.categoryText, { color: COLORS.primary }]}>
                  {currentPair.category === 'vowel'
                    ? '모음'
                    : currentPair.category === 'consonant'
                      ? '자음'
                      : '강세'}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { borderColor: getDifficultyColor(currentPair.difficulty) },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(currentPair.difficulty) },
                  ]}
                >
                  {currentPair.difficulty === 'easy'
                    ? '쉬움'
                    : currentPair.difficulty === 'medium'
                      ? '보통'
                      : '어려움'}
                </Text>
              </View>
            </View>

            <Text style={[styles.instructionText, { color: colors.text }]}>
              들리는 단어를 선택하세요
            </Text>

            {/* Sound Focus */}
            <View style={styles.soundFocusContainer}>
              <MaterialCommunityIcons name="ear-hearing" size={18} color={colors.textSecondary} />
              <Text style={[styles.soundFocusText, { color: colors.textSecondary }]}>
                {currentPair.soundFocus}
              </Text>
            </View>
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
                backgroundColor: isPlaying ? '#f59e0b' : canReplay ? COLORS.primary : COLORS.border,
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
              {SPEED_LABELS[currentSpeed]}
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
              style={[styles.replayText, { color: canReplay ? colors.textSecondary : '#ef4444' }]}
            >
              {replaysUsed}/{MAX_REPLAYS}
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Word Choices */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 200 }}
      >
        <View style={styles.choicesContainer}>
          {/* Word 1 */}
          <Pressable
            style={[
              styles.wordChoice,
              {
                backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
                borderColor: isSubmitted
                  ? currentQuestion.targetWord === 1
                    ? '#22c55e'
                    : selectedChoice === 1
                      ? '#ef4444'
                      : COLORS.border
                  : selectedChoice === 1
                    ? COLORS.primary
                    : COLORS.border,
                borderWidth:
                  selectedChoice === 1 || (isSubmitted && currentQuestion.targetWord === 1) ? 3 : 1,
              },
            ]}
            onPress={() => handleSelect(1)}
            disabled={isSubmitted}
          >
            <Text style={[styles.wordText, { color: colors.text }]}>{currentPair.word1}</Text>
            <Text style={[styles.pronunciationText, { color: colors.textSecondary }]}>
              {currentPair.pronunciation1}
            </Text>
            {isSubmitted && (
              <Pressable style={styles.playWordButton} onPress={() => playWord(currentPair.word1)}>
                <MaterialCommunityIcons name="volume-medium" size={20} color={COLORS.primary} />
              </Pressable>
            )}
            {isSubmitted && currentQuestion.targetWord === 1 && (
              <View style={styles.correctBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            )}
          </Pressable>

          {/* Word 2 */}
          <Pressable
            style={[
              styles.wordChoice,
              {
                backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
                borderColor: isSubmitted
                  ? currentQuestion.targetWord === 2
                    ? '#22c55e'
                    : selectedChoice === 2
                      ? '#ef4444'
                      : COLORS.border
                  : selectedChoice === 2
                    ? COLORS.primary
                    : COLORS.border,
                borderWidth:
                  selectedChoice === 2 || (isSubmitted && currentQuestion.targetWord === 2) ? 3 : 1,
              },
            ]}
            onPress={() => handleSelect(2)}
            disabled={isSubmitted}
          >
            <Text style={[styles.wordText, { color: colors.text }]}>{currentPair.word2}</Text>
            <Text style={[styles.pronunciationText, { color: colors.textSecondary }]}>
              {currentPair.pronunciation2}
            </Text>
            {isSubmitted && (
              <Pressable style={styles.playWordButton} onPress={() => playWord(currentPair.word2)}>
                <MaterialCommunityIcons name="volume-medium" size={20} color={COLORS.primary} />
              </Pressable>
            )}
            {isSubmitted && currentQuestion.targetWord === 2 && (
              <View style={styles.correctBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            )}
          </Pressable>
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
                backgroundColor: selectedChoice ? COLORS.primary : COLORS.border,
              },
            ]}
            onPress={handleSubmit}
            disabled={!selectedChoice}
          >
            <Text
              style={[
                styles.submitButtonText,
                { color: selectedChoice ? '#fff' : colors.textSecondary },
              ]}
            >
              정답 확인
            </Text>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={selectedChoice ? '#fff' : colors.textSecondary}
            />
          </Pressable>
        </MotiView>
      )}

      {/* Result */}
      {isSubmitted && (
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
                    name={isCorrect ? 'check-decagram' : 'close-octagon'}
                    size={32}
                    color={isCorrect ? '#22c55e' : '#ef4444'}
                  />
                  <Text style={[styles.resultText, { color: isCorrect ? '#22c55e' : '#ef4444' }]}>
                    {isCorrect ? '정답입니다!' : '틀렸습니다'}
                  </Text>
                </View>

                {/* Meaning Comparison */}
                <View style={styles.meaningComparison}>
                  <View style={styles.meaningRow}>
                    <Text style={[styles.meaningWord, { color: colors.text }]}>
                      {currentPair.word1}
                    </Text>
                    <Text style={[styles.meaningText, { color: colors.textSecondary }]}>
                      {currentPair.meaning1}
                    </Text>
                  </View>
                  <View style={styles.meaningRow}>
                    <Text style={[styles.meaningWord, { color: colors.text }]}>
                      {currentPair.word2}
                    </Text>
                    <Text style={[styles.meaningText, { color: colors.textSecondary }]}>
                      {currentPair.meaning2}
                    </Text>
                  </View>
                </View>

                {/* Korean Tip Toggle */}
                <Pressable style={styles.tipToggle} onPress={() => setShowTip(!showTip)}>
                  <MaterialCommunityIcons
                    name={showTip ? 'lightbulb-on' : 'lightbulb-outline'}
                    size={18}
                    color="#f59e0b"
                  />
                  <Text style={styles.tipToggleText}>
                    {showTip ? '발음 팁 숨기기' : '발음 팁 보기'}
                  </Text>
                </Pressable>

                {/* Korean Pronunciation Tip */}
                {showTip && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ type: 'timing', duration: 200 }}
                  >
                    <View style={styles.tipContainer}>
                      <Text style={[styles.tipText, { color: colors.text }]}>
                        {currentPair.koreanTip}
                      </Text>
                    </View>
                  </MotiView>
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
            <Text style={styles.nextButtonText}>{isLastQuestion ? '결과 보기' : '다음 문제'}</Text>
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
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.sm,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  instructionText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  soundFocusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
  },
  soundFocusText: {
    fontSize: SIZES.fontSize.md,
    fontFamily: 'monospace',
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
  choicesContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  wordChoice: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    position: 'relative',
  },
  wordText: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.xs,
  },
  pronunciationText: {
    fontSize: SIZES.fontSize.sm,
    fontFamily: 'monospace',
  },
  playWordButton: {
    marginTop: SIZES.spacing.sm,
    padding: SIZES.spacing.xs,
  },
  correctBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
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
  meaningComparison: {
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  meaningWord: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    width: 80,
  },
  meaningText: {
    fontSize: SIZES.fontSize.md,
    flex: 1,
  },
  tipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.sm,
  },
  tipToggleText: {
    color: '#f59e0b',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  tipContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.sm,
  },
  tipText: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
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

export default MinimalPairs;
