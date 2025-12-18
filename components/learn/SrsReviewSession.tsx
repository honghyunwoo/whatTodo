/**
 * SRS Review Session Component
 * Flashcard-based spaced repetition review UI
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, ProgressBar as PaperProgressBar, Text } from 'react-native-paper';

import { COLORS, withAlpha } from '@/constants/colors';
import { SHADOWS, SIZES } from '@/constants/sizes';
import { useRewardStore } from '@/store/rewardStore';
import { useSrsStore, WordWithSrs } from '@/store/srsStore';
import type { ReviewRating } from '@/types/srs';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface SrsReviewSessionProps {
  onComplete?: (stats: SessionStats) => void;
  onCancel?: () => void;
}

interface SessionStats {
  totalReviewed: number;
  correctCount: number;
  accuracy: number;
  starsEarned: number;
  timeSpent: number;
}

type SessionPhase = 'intro' | 'reviewing' | 'complete';

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const RATING_CONFIG: Record<
  ReviewRating,
  { icon: string; label: string; color: string; shortcut: string }
> = {
  again: { icon: 'refresh', label: '다시', color: COLORS.danger, shortcut: '1' },
  hard: { icon: 'emoticon-neutral-outline', label: '어려움', color: COLORS.warning, shortcut: '2' },
  good: { icon: 'emoticon-happy-outline', label: '알겠음', color: COLORS.success, shortcut: '3' },
  easy: { icon: 'star-outline', label: '쉬움', color: COLORS.primary, shortcut: '4' },
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function SrsReviewSession({ onComplete, onCancel }: SrsReviewSessionProps) {
  const earnStars = useRewardStore((state) => state.earnStars);
  const getWordsForReview = useSrsStore((state) => state.getWordsForReview);
  const reviewWord = useSrsStore((state) => state.reviewWord);
  const getTodayProgress = useSrsStore((state) => state.getTodayProgress);

  const [phase, setPhase] = useState<SessionPhase>('intro');
  const [reviewQueue, setReviewQueue] = useState<WordWithSrs[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalReviewed: 0,
    correctCount: 0,
    accuracy: 0,
    starsEarned: 0,
    timeSpent: 0,
  });
  const [startTime, setStartTime] = useState<number>(0);

  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ─────────────────────────────────────
  // Initialize Session
  // ─────────────────────────────────────

  const initSession = useCallback(() => {
    const dueWords = getWordsForReview();
    setReviewQueue(dueWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({
      totalReviewed: 0,
      correctCount: 0,
      accuracy: 0,
      starsEarned: 0,
      timeSpent: 0,
    });
    setStartTime(Date.now());
    setPhase('reviewing');

    // Reset animations
    flipAnim.setValue(0);
    cardScaleAnim.setValue(1);
    fadeAnim.setValue(1);
  }, [getWordsForReview, flipAnim, cardScaleAnim, fadeAnim]);

  // ─────────────────────────────────────
  // Card Flip Animation
  // ─────────────────────────────────────

  const flipCard = useCallback(() => {
    if (isFlipped) return;

    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  }, [isFlipped, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // ─────────────────────────────────────
  // Handle Rating
  // ─────────────────────────────────────

  const handleRating = useCallback(
    (rating: ReviewRating) => {
      if (currentIndex >= reviewQueue.length) return;

      const currentWord = reviewQueue[currentIndex];
      reviewWord(currentWord.wordId, rating);

      const isCorrect = rating !== 'again';
      const newTotalReviewed = sessionStats.totalReviewed + 1;
      const newCorrectCount = sessionStats.correctCount + (isCorrect ? 1 : 0);
      const newAccuracy = Math.round((newCorrectCount / newTotalReviewed) * 100);

      // Calculate stars: 1 star per 5 correct reviews
      const previousStars = Math.floor(sessionStats.correctCount / 5);
      const newStars = Math.floor(newCorrectCount / 5);
      const starsToAdd = newStars - previousStars;

      if (starsToAdd > 0) {
        earnStars(starsToAdd);
      }

      // Animate card out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= reviewQueue.length) {
          // Session complete
          const timeSpent = Math.round((Date.now() - startTime) / 1000);
          const finalStats: SessionStats = {
            totalReviewed: newTotalReviewed,
            correctCount: newCorrectCount,
            accuracy: newAccuracy,
            starsEarned: newStars,
            timeSpent,
          };
          setSessionStats(finalStats);
          setPhase('complete');
          onComplete?.(finalStats);
        } else {
          // Next card
          setSessionStats((prev) => ({
            ...prev,
            totalReviewed: newTotalReviewed,
            correctCount: newCorrectCount,
            accuracy: newAccuracy,
            starsEarned: newStars,
          }));
          setCurrentIndex(nextIndex);
          setIsFlipped(false);
          flipAnim.setValue(0);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      });
    },
    [
      currentIndex,
      reviewQueue,
      reviewWord,
      sessionStats,
      earnStars,
      fadeAnim,
      flipAnim,
      startTime,
      onComplete,
    ]
  );

  // ─────────────────────────────────────
  // Current Word
  // ─────────────────────────────────────

  const currentWord = useMemo(() => {
    if (currentIndex >= reviewQueue.length) return null;
    return reviewQueue[currentIndex];
  }, [currentIndex, reviewQueue]);

  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  // ─────────────────────────────────────
  // Render: Intro Phase
  // ─────────────────────────────────────

  if (phase === 'intro') {
    const dueCount = getWordsForReview().length;

    return (
      <View style={styles.container}>
        <View style={styles.introContent}>
          <View style={styles.introIcon}>
            <MaterialCommunityIcons name="cards-outline" size={80} color={COLORS.primary} />
          </View>

          <Text style={styles.introTitle}>단어 복습</Text>
          <Text style={styles.introSubtitle}>간격 반복 학습으로 단어를 복습하세요</Text>

          <View style={styles.statsPreview}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{dueCount}</Text>
              <Text style={styles.statLabel}>복습 대기</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={24}
                color={COLORS.success}
              />
              <Text style={styles.statValue}>{todayProgress.done}</Text>
              <Text style={styles.statLabel}>오늘 완료</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="target" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{todayProgress.goal}</Text>
              <Text style={styles.statLabel}>일일 목표</Text>
            </View>
          </View>

          {dueCount > 0 ? (
            <>
              <View style={styles.ratingGuide}>
                <Text style={styles.ratingGuideTitle}>평가 가이드</Text>
                {(
                  Object.entries(RATING_CONFIG) as [
                    ReviewRating,
                    (typeof RATING_CONFIG)[ReviewRating],
                  ][]
                ).map(([rating, config]) => (
                  <View key={rating} style={styles.ratingRow}>
                    <View style={[styles.ratingBadge, { backgroundColor: config.color }]}>
                      <MaterialCommunityIcons name={config.icon as any} size={16} color="#fff" />
                    </View>
                    <Text style={styles.ratingName}>{config.label}</Text>
                    <Text style={styles.ratingDesc}>
                      {rating === 'again' && '기억 안 남'}
                      {rating === 'hard' && '겨우 기억남'}
                      {rating === 'good' && '잘 기억남'}
                      {rating === 'easy' && '너무 쉬움'}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                mode="contained"
                onPress={initSession}
                style={styles.startButton}
                contentStyle={styles.startButtonContent}
              >
                복습 시작 ({dueCount}개)
              </Button>
            </>
          ) : (
            <View style={styles.noWordsContainer}>
              <MaterialCommunityIcons name="check-all" size={48} color={COLORS.success} />
              <Text style={styles.noWordsTitle}>복습 완료!</Text>
              <Text style={styles.noWordsText}>오늘 복습할 단어가 없습니다. 잘하고 있어요!</Text>
            </View>
          )}

          {onCancel && (
            <Button mode="text" onPress={onCancel} style={styles.cancelButton}>
              돌아가기
            </Button>
          )}
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────
  // Render: Complete Phase
  // ─────────────────────────────────────

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.completeContent}>
          <View style={styles.completeIcon}>
            <MaterialCommunityIcons name="trophy-outline" size={80} color={COLORS.warning} />
          </View>

          <Text style={styles.completeTitle}>복습 완료!</Text>
          <Text style={styles.completeSubtitle}>단어 복습을 잘 마쳤습니다</Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{sessionStats.totalReviewed}</Text>
              <Text style={styles.resultStatLabel}>복습함</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{sessionStats.accuracy}%</Text>
              <Text style={styles.resultStatLabel}>정확도</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <View style={styles.starsContainer}>
                <MaterialCommunityIcons name="star" size={24} color={COLORS.warning} />
                <Text style={styles.resultStatValue}>{sessionStats.starsEarned}</Text>
              </View>
              <Text style={styles.resultStatLabel}>별</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.timeText}>
              {Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s
            </Text>
          </View>

          {sessionStats.accuracy >= 80 && (
            <View style={styles.achievementBanner}>
              <MaterialCommunityIcons name="medal" size={24} color={COLORS.warning} />
              <Text style={styles.achievementText}>훌륭해요!</Text>
            </View>
          )}

          <Button mode="contained" onPress={onCancel} style={styles.doneButton}>
            완료
          </Button>

          {getWordsForReview().length > 0 && (
            <Button mode="outlined" onPress={initSession} style={styles.continueButton}>
              계속하기 ({getWordsForReview().length}개 남음)
            </Button>
          )}
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────
  // Render: Reviewing Phase
  // ─────────────────────────────────────

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const progress = ((currentIndex + 1) / reviewQueue.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {reviewQueue.length}
          </Text>
          <Text style={styles.accuracyText}>{sessionStats.accuracy}% 정답</Text>
        </View>

        <View style={styles.starsDisplay}>
          <MaterialCommunityIcons name="star" size={20} color={COLORS.warning} />
          <Text style={styles.starsText}>{sessionStats.starsEarned}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <PaperProgressBar
        progress={progress / 100}
        color={COLORS.primary}
        style={styles.progressBar}
      />

      {/* Flashcard */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardTouchable}>
          {/* Front of card (Word) */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <View style={styles.cardContent}>
              <Text style={styles.wordText}>{currentWord.word}</Text>
              {currentWord.pronunciation && (
                <Text style={styles.pronunciationText}>{currentWord.pronunciation}</Text>
              )}
              <View style={styles.tapHint}>
                <MaterialCommunityIcons name="gesture-tap" size={20} color={COLORS.textSecondary} />
                <Text style={styles.tapHintText}>탭하여 뜻 보기</Text>
              </View>
            </View>
          </Animated.View>

          {/* Back of card (Meaning) */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <View style={styles.cardContent}>
              <Text style={styles.wordTextSmall}>{currentWord.word}</Text>
              <View style={styles.divider} />
              <Text style={styles.meaningText}>{currentWord.meaning}</Text>
              {currentWord.example && (
                <View style={styles.exampleContainer}>
                  <MaterialCommunityIcons
                    name="format-quote-open"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.exampleText}>{currentWord.example}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Rating Buttons */}
      {isFlipped && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingQuestion}>얼마나 잘 기억했나요?</Text>
          <View style={styles.ratingButtons}>
            {(
              Object.entries(RATING_CONFIG) as [
                ReviewRating,
                (typeof RATING_CONFIG)[ReviewRating],
              ][]
            ).map(([rating, config]) => (
              <TouchableOpacity
                key={rating}
                style={[styles.ratingButton, { backgroundColor: withAlpha(config.color, 0.1) }]}
                onPress={() => handleRating(rating)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name={config.icon as any} size={28} color={config.color} />
                <Text style={[styles.ratingButtonText, { color: config.color }]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    backgroundColor: COLORS.background,
  },

  // Intro
  introContent: {
    flex: 1,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  introIcon: {
    marginTop: SIZES.spacing.xxl,
    marginBottom: SIZES.spacing.lg,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  introSubtitle: {
    fontSize: SIZES.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  statsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.spacing.xs,
  },
  statLabel: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  ratingGuide: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    ...SHADOWS.sm,
  },
  ratingGuideTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  ratingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  ratingName: {
    width: 50,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  ratingDesc: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  startButton: {
    width: '100%',
    marginBottom: SIZES.spacing.md,
  },
  startButtonContent: {
    paddingVertical: SIZES.spacing.sm,
  },
  cancelButton: {
    marginTop: SIZES.spacing.sm,
  },
  noWordsContainer: {
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  noWordsTitle: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  noWordsText: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Reviewing
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  accuracyText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  starsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(COLORS.warning, 0.1),
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
  },
  starsText: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.warning,
  },
  progressBar: {
    height: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  cardTouchable: {
    width: '100%',
    height: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    backfaceVisibility: 'hidden',
    ...SHADOWS.lg,
  },
  cardFront: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  wordTextSmall: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.sm,
  },
  pronunciationText: {
    fontSize: SIZES.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.lg,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
  },
  tapHintText: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.spacing.md,
  },
  meaningText: {
    fontSize: SIZES.fontSize.xl,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  exampleText: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: SIZES.spacing.xs,
  },

  // Rating
  ratingContainer: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    ...SHADOWS.lg,
  },
  ratingQuestion: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacing.sm,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  ratingButtonText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginTop: SIZES.spacing.xs,
  },

  // Complete
  completeContent: {
    flex: 1,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  completeIcon: {
    marginTop: SIZES.spacing.xxl,
    marginBottom: SIZES.spacing.lg,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  completeSubtitle: {
    fontSize: SIZES.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.sm,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultStatLabel: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
  },
  resultStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  timeText: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
  },
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(COLORS.warning, 0.1),
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.full,
    marginBottom: SIZES.spacing.xl,
  },
  achievementText: {
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.warning,
  },
  doneButton: {
    width: '100%',
    marginBottom: SIZES.spacing.md,
  },
  continueButton: {
    width: '100%',
  },
});

export default SrsReviewSession;
