/**
 * ReviewSession Component
 * SRS-based word review interface
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ReviewRating } from '@/types/srs';
import { useSrsStore, WordWithSrs } from '@/store/srsStore';
import { useRewardStore } from '@/store/rewardStore';

// ─────────────────────────────────────
// Rating Button Configuration
// ─────────────────────────────────────

const RATING_CONFIG: {
  rating: ReviewRating;
  label: string;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
}[] = [
  {
    rating: 'again',
    label: 'Again',
    color: '#ef4444',
    icon: 'close-circle',
    description: '1 day',
  },
  {
    rating: 'hard',
    label: 'Hard',
    color: '#f97316',
    icon: 'alert-circle',
    description: '~3 days',
  },
  {
    rating: 'good',
    label: 'Good',
    color: '#22c55e',
    icon: 'check-circle',
    description: '~7 days',
  },
  {
    rating: 'easy',
    label: 'Easy',
    color: '#3b82f6',
    icon: 'check-circle-outline',
    description: '~14 days',
  },
];

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface ReviewSessionProps {
  onComplete?: (stats: ReviewStats) => void;
  maxWords?: number;
}

interface ReviewStats {
  totalReviewed: number;
  correctCount: number;
  incorrectCount: number;
  starsEarned: number;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  onComplete,
  maxWords = 20,
}) => {
  const { getWordsForReview, reviewWord, getDueWordCount } = useSrsStore();
  const { earnStars } = useRewardStore();

  // Get words to review
  const wordsToReview = useMemo(() => {
    return getWordsForReview().slice(0, maxWords);
  }, [getWordsForReview, maxWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
    starsEarned: 0,
  });

  const currentWord = wordsToReview[currentIndex];
  const isComplete = currentIndex >= wordsToReview.length;
  const progress = wordsToReview.length > 0 ? (currentIndex / wordsToReview.length) * 100 : 0;

  // Animation values
  const cardScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  // Handle rating selection
  const handleRating = useCallback(
    (rating: ReviewRating) => {
      if (!currentWord) return;

      // Animate card
      cardScale.value = withSpring(0.95, {}, () => {
        cardScale.value = withSpring(1);
      });

      // Update SRS data
      reviewWord(currentWord.wordId, rating);

      // Update stats
      const isCorrect = rating !== 'again';
      const starsForWord = isCorrect ? (rating === 'easy' ? 3 : rating === 'good' ? 2 : 1) : 0;

      setStats((prev) => ({
        totalReviewed: prev.totalReviewed + 1,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
        starsEarned: prev.starsEarned + starsForWord,
      }));

      // Award stars
      if (starsForWord > 0) {
        earnStars(starsForWord);
      }

      // Move to next word
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentWord, reviewWord, earnStars]
  );

  // Handle flip card
  const handleFlip = useCallback(() => {
    setShowAnswer(true);
  }, []);

  // Session complete screen
  if (isComplete || wordsToReview.length === 0) {
    return (
      <Animated.View entering={FadeIn} style={styles.completeContainer}>
        <MaterialCommunityIcons name="check-decagram" size={64} color="#22c55e" />
        <Text style={styles.completeTitle}>Review Complete!</Text>

        {wordsToReview.length === 0 ? (
          <Text style={styles.completeSubtitle}>No words due for review</Text>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="counter" size={24} color="#6b7280" />
              <Text style={styles.statLabel}>Reviewed</Text>
              <Text style={styles.statValue}>{stats.totalReviewed}</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />
              <Text style={styles.statLabel}>Correct</Text>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.correctCount}</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
              <Text style={styles.statLabel}>Again</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.incorrectCount}</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="star" size={24} color="#fbbf24" />
              <Text style={styles.statLabel}>Stars</Text>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>+{stats.starsEarned}</Text>
            </View>
          </View>
        )}

        {onComplete && (
          <Pressable
            style={styles.doneButton}
            onPress={() => onComplete(stats)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {wordsToReview.length}
        </Text>
      </View>

      {/* Word card */}
      <Animated.View
        key={currentWord.wordId}
        entering={SlideInRight}
        exiting={SlideOutLeft}
        style={[styles.card, cardAnimatedStyle]}
      >
        <Pressable
          style={styles.cardContent}
          onPress={!showAnswer ? handleFlip : undefined}
        >
          {/* Front (Word) */}
          <View style={styles.cardFront}>
            <Text style={styles.wordText}>{currentWord.word}</Text>
            {currentWord.pronunciation && (
              <Text style={styles.pronunciationText}>{currentWord.pronunciation}</Text>
            )}
          </View>

          {/* Back (Answer) - shown after tap */}
          {showAnswer && (
            <Animated.View entering={FadeIn} style={styles.cardBack}>
              <View style={styles.divider} />
              <Text style={styles.meaningText}>{currentWord.meaning}</Text>
              {currentWord.example && (
                <Text style={styles.exampleText}>{currentWord.example}</Text>
              )}
            </Animated.View>
          )}

          {/* Tap hint */}
          {!showAnswer && (
            <View style={styles.tapHint}>
              <MaterialCommunityIcons name="gesture-tap" size={20} color="#9ca3af" />
              <Text style={styles.tapHintText}>Tap to reveal</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Rating buttons */}
      {showAnswer && (
        <Animated.View entering={FadeIn} style={styles.ratingContainer}>
          <Text style={styles.ratingPrompt}>How well did you know it?</Text>
          <View style={styles.ratingButtons}>
            {RATING_CONFIG.map((config) => (
              <Pressable
                key={config.rating}
                style={[styles.ratingButton, { borderColor: config.color }]}
                onPress={() => handleRating(config.rating)}
              >
                <MaterialCommunityIcons
                  name={config.icon}
                  size={24}
                  color={config.color}
                />
                <Text style={[styles.ratingLabel, { color: config.color }]}>
                  {config.label}
                </Text>
                <Text style={styles.ratingDescription}>{config.description}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
    minHeight: 200,
  },
  cardFront: {
    alignItems: 'center',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  pronunciationText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  cardBack: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  meaningText: {
    fontSize: 20,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  exampleText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  tapHintText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingPrompt: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ratingButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
    backgroundColor: '#fff',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  ratingDescription: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  // Complete screen
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  statsContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  doneButton: {
    marginTop: 32,
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewSession;
