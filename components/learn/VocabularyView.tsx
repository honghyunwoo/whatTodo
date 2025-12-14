import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { FlashCardResult, VocabularyActivity } from '@/types/activity';

import { FlashCard } from './FlashCard';
import { ProgressBar } from './ProgressBar';

interface VocabularyViewProps {
  activity: VocabularyActivity;
  onComplete?: (score: number) => void;
}

export function VocabularyView({ activity, onComplete }: VocabularyViewProps) {
  const saveFlashCardResults = useLearnStore((state) => state.saveFlashCardResults);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<FlashCardResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const words = activity.words;
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  const score = useMemo(() => {
    if (results.length === 0) return 0;
    const knownCount = results.filter((r) => r.known).length;
    return Math.round((knownCount / results.length) * 100);
  }, [results]);

  const handleKnown = useCallback(() => {
    const newResults = [...results, { wordId: currentWord.id, known: true, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity.id, newResults);
      setIsCompleted(true);
      onComplete?.(Math.round((newResults.filter((r) => r.known).length / newResults.length) * 100));
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentWord, results, isLastWord, activity.id, saveFlashCardResults, onComplete]);

  const handleUnknown = useCallback(() => {
    const newResults = [...results, { wordId: currentWord.id, known: false, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity.id, newResults);
      setIsCompleted(true);
      onComplete?.(Math.round((newResults.filter((r) => r.known).length / newResults.length) * 100));
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentWord, results, isLastWord, activity.id, saveFlashCardResults, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsCompleted(false);
  }, []);

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={styles.completedTitle}>학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        <Text style={styles.statsText}>
          {results.filter((r) => r.known).length}개 암기 / {results.length}개 중
        </Text>
        <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
          다시 학습하기
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activity.title}</Text>
        <ProgressBar current={currentIndex + 1} total={words.length} />
      </View>
      <FlashCard word={currentWord} onKnown={handleKnown} onUnknown={handleUnknown} />
    </View>
  );
}

const styles = StyleSheet.create({
  completedContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  completedTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.spacing.md,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: '700',
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
});
