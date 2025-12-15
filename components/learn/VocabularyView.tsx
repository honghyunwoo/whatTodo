/**
 * Vocabulary View - Phase 0.5 Enhanced
 * 어휘 학습 with 콤보 시스템 & 피드백
 */

import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { FlashCardResult, VocabularyActivity } from '@/types/activity';
import { feedbackService } from '@/services/feedbackService';
import { selectPraise, calculateXP } from '@/constants/rewards';
import { XPPopup } from '@/components/common/XPPopup';
import { ComboIndicator } from './ComboIndicator';

import { FlashCard } from './FlashCard';
import { ProgressBar } from './ProgressBar';

interface VocabularyViewProps {
  activity: VocabularyActivity;
  onComplete?: (score: number, xpEarned: number) => void;
}

export function VocabularyView({ activity, onComplete }: VocabularyViewProps) {
  const saveFlashCardResults = useLearnStore((state) => state.saveFlashCardResults);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<FlashCardResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Combo & XP State
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpVariant, setXpVariant] = useState<'normal' | 'bonus' | 'double' | 'jackpot'>('normal');

  const words = activity.words;
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  const score = useMemo(() => {
    if (results.length === 0) return 0;
    const knownCount = results.filter((r) => r.known).length;
    return Math.round((knownCount / results.length) * 100);
  }, [results]);

  const handleKnown = useCallback(async () => {
    // Update combo
    const newCombo = combo + 1;
    setCombo(newCombo);

    // Select praise and calculate XP
    const praise = selectPraise({
      streak: newCombo,
      answerTimeMs: 3000,
      isFirstAnswer: currentIndex === 0,
      isPerfectScore: false,
    });

    const xpResult = calculateXP(10, newCombo, praise);
    setCurrentXP(xpResult.totalXP);
    const newTotalXP = totalXP + xpResult.totalXP;
    setTotalXP(newTotalXP);

    // Determine XP variant
    if (xpResult.bonusXP >= 20) {
      setXpVariant('jackpot');
    } else if (xpResult.bonusXP >= 10) {
      setXpVariant('double');
    } else if (xpResult.bonusXP > 0) {
      setXpVariant('bonus');
    } else {
      setXpVariant('normal');
    }

    // Trigger feedback
    if (newCombo >= 5) {
      await feedbackService.combo();
    } else {
      await feedbackService.success();
    }

    // Show XP popup
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1500);

    const newResults = [...results, { wordId: currentWord.id, known: true, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity.id, newResults);
      setIsCompleted(true);
      const finalScore = Math.round(
        (newResults.filter((r) => r.known).length / newResults.length) * 100
      );
      onComplete?.(finalScore, newTotalXP);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentWord,
    results,
    isLastWord,
    activity.id,
    saveFlashCardResults,
    onComplete,
    combo,
    currentIndex,
    totalXP,
  ]);

  const handleUnknown = useCallback(async () => {
    // Reset combo on unknown
    setCombo(0);

    // Trigger wrong feedback
    await feedbackService.wrong();

    const newResults = [...results, { wordId: currentWord.id, known: false, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity.id, newResults);
      setIsCompleted(true);
      const finalScore = Math.round(
        (newResults.filter((r) => r.known).length / newResults.length) * 100
      );
      onComplete?.(finalScore, totalXP);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentWord, results, isLastWord, activity.id, saveFlashCardResults, onComplete, totalXP]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsCompleted(false);
    setCombo(0);
    setTotalXP(0);
  }, []);

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={styles.completedTitle}>학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        {totalXP > 0 && <Text style={styles.xpText}>✨ +{totalXP} XP</Text>}
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
        <View style={styles.titleRow}>
          <Text style={styles.title}>{activity.title}</Text>
          {/* XP Badge */}
          {totalXP > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>✨ {totalXP}</Text>
            </View>
          )}
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressContainer}>
            <ProgressBar current={currentIndex + 1} total={words.length} />
          </View>
          {/* Combo Indicator */}
          {combo >= 2 && (
            <ComboIndicator
              count={combo}
              isOnFire={combo >= 3}
              isBurning={combo >= 5}
              isLegendary={combo >= 10}
            />
          )}
        </View>
      </View>

      <FlashCard word={currentWord} onKnown={handleKnown} onUnknown={handleUnknown} />

      {/* XP Popup */}
      <XPPopup
        amount={currentXP}
        visible={showXP}
        variant={xpVariant}
        onComplete={() => setShowXP(false)}
      />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  progressContainer: {
    flex: 1,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: '700',
  },
  xpText: {
    color: COLORS.warning,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    marginTop: SIZES.spacing.sm,
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
    textAlign: 'center',
  },
  xpBadge: {
    marginLeft: SIZES.spacing.sm,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.md,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
});
