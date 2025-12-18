import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { Word } from '@/types/activity';
import { learnHaptics } from '@/services/hapticService';

interface FlashCardProps {
  word: Word;
  onKnown?: () => void;
  onUnknown?: () => void;
  showActions?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FlashCard({ word, onKnown, onUnknown, showActions = true }: FlashCardProps) {
  const { colors, isDark } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipProgress = useSharedValue(0);

  const handleFlip = useCallback(async () => {
    await learnHaptics.cardFlip();
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipProgress.value = withSpring(newFlipped ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isFlipped, flipProgress]);

  const handleKnown = useCallback(async () => {
    await learnHaptics.correct();
    setIsFlipped(false);
    flipProgress.value = withSpring(0);
    onKnown?.();
  }, [onKnown, flipProgress]);

  const handleUnknown = useCallback(async () => {
    await learnHaptics.wrong();
    setIsFlipped(false);
    flipProgress.value = withSpring(0);
    onUnknown?.();
  }, [onUnknown, flipProgress]);

  const handleSpeak = useCallback(
    (e?: { stopPropagation?: () => void }) => {
      // Stop event from propagating to parent (card flip)
      e?.stopPropagation?.();
      Speech.speak(word.word, {
        language: 'en-US',
        rate: 0.8,
      });
    },
    [word.word]
  );

  // Front card animation (visible when not flipped)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180], Extrapolation.CLAMP);
    const opacity = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden' as const,
    };
  });

  // Back card animation (visible when flipped)
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360], Extrapolation.CLAMP);
    const opacity = interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden' as const,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Front Card */}
        <AnimatedPressable onPress={handleFlip} style={[styles.cardWrapper, frontAnimatedStyle]}>
          <Card style={[styles.card, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.frontFace}>
                <View style={styles.wordRow}>
                  <Text style={[styles.word, { color: colors.text }]}>{word.word}</Text>
                  <Pressable onPress={handleSpeak} style={styles.speakButton}>
                    <Ionicons name="volume-medium" size={24} color={COLORS.primary} />
                  </Pressable>
                </View>
                <Text style={[styles.pronunciation, { color: colors.textSecondary }]}>
                  {word.pronunciation}
                </Text>
                <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
                <Text style={[styles.flipHint, { color: colors.textSecondary }]}>
                  탭해서 뒤집기
                </Text>
              </View>
            </Card.Content>
          </Card>
        </AnimatedPressable>

        {/* Back Card */}
        <AnimatedPressable onPress={handleFlip} style={[styles.cardWrapper, backAnimatedStyle]}>
          <Card style={[styles.card, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.backFace}>
                <Text style={[styles.meaning, { color: colors.text }]}>{word.meaning}</Text>
                <View
                  style={[
                    styles.exampleContainer,
                    { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
                  ]}
                >
                  <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>예문</Text>
                  <Text style={[styles.example, { color: colors.text }]}>{word.example}</Text>
                  <Text style={[styles.exampleMeaning, { color: colors.textSecondary }]}>
                    {word.exampleMeaning}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </AnimatedPressable>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, styles.unknownButton]} onPress={handleUnknown}>
            <Ionicons name="close" size={20} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>몰라요</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.knownButton]} onPress={handleKnown}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>알아요</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.md,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  actionIcon: {
    marginRight: SIZES.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.md,
  },
  backFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  card: {
    borderRadius: SIZES.borderRadius.xl,
    elevation: 4,
  },
  cardContainer: {
    position: 'relative',
    marginHorizontal: SIZES.spacing.md,
  },
  cardContent: {
    padding: SIZES.spacing.xl,
  },
  cardWrapper: {
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  example: {
    fontSize: SIZES.fontSize.md,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  exampleContainer: {
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    width: '100%',
  },
  exampleLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  exampleMeaning: {
    fontSize: SIZES.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  flipHint: {
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.lg,
  },
  frontFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  knownButton: {
    backgroundColor: COLORS.success,
  },
  meaning: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },
  partOfSpeech: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.borderRadius.full,
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
  },
  pronunciation: {
    fontSize: SIZES.fontSize.lg,
    marginTop: SIZES.spacing.xs,
  },
  speakButton: {
    padding: SIZES.spacing.xs,
    marginLeft: SIZES.spacing.sm,
  },
  unknownButton: {
    backgroundColor: COLORS.danger,
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
