/**
 * Vocabulary View
 * 어휘 학습
 */

import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { FlashCardResult, VocabularyActivity } from '@/types/activity';
import { feedbackService } from '@/services/feedbackService';

import { MinimalPairs, MinimalPairQuestion, MinimalPairsResult } from './exercises/MinimalPairs';
import { FlashCard } from './FlashCard';
import { ProgressBar } from './ProgressBar';

// 한국인 학습자를 위한 샘플 최소대립쌍 데이터
const SAMPLE_MINIMAL_PAIRS: MinimalPairQuestion[] = [
  {
    pair: {
      id: 'ship-sheep',
      word1: 'ship',
      word2: 'sheep',
      pronunciation1: '/ʃɪp/',
      pronunciation2: '/ʃiːp/',
      meaning1: '배',
      meaning2: '양',
      soundFocus: '/ɪ/ vs /iː/',
      koreanTip:
        "한국어에는 이 두 소리 구분이 없어요. ship은 짧게 '쉽', sheep은 길게 '쉬~프'처럼 발음해요.",
      category: 'vowel',
      difficulty: 'medium',
    },
    targetWord: 1,
    showHint: false,
  },
  {
    pair: {
      id: 'rice-lice',
      word1: 'rice',
      word2: 'lice',
      pronunciation1: '/raɪs/',
      pronunciation2: '/laɪs/',
      meaning1: '쌀',
      meaning2: '이(머릿니)',
      soundFocus: '/r/ vs /l/',
      koreanTip:
        'R은 혀를 뒤로 말아서, L은 혀를 윗니 뒤에 대고 발음해요. 한국어 ㄹ과는 둘 다 달라요!',
      category: 'consonant',
      difficulty: 'hard',
    },
    targetWord: 2,
    showHint: false,
  },
  {
    pair: {
      id: 'bat-bet',
      word1: 'bat',
      word2: 'bet',
      pronunciation1: '/bæt/',
      pronunciation2: '/bet/',
      meaning1: '박쥐/방망이',
      meaning2: '내기하다',
      soundFocus: '/æ/ vs /e/',
      koreanTip: "bat의 /æ/는 입을 크게 벌려서 '애'와 '아' 사이, bet의 /e/는 그냥 '에' 발음이에요.",
      category: 'vowel',
      difficulty: 'medium',
    },
    targetWord: 1,
    showHint: false,
  },
];

interface VocabularyViewProps {
  activity: VocabularyActivity;
  onComplete?: (score: number, xpEarned: number) => void;
}

export function VocabularyView({ activity, onComplete }: VocabularyViewProps) {
  const saveFlashCardResults = useLearnStore((state) => state.saveFlashCardResults);
  const addWordToSrs = useSrsStore((state) => state.addWord);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<FlashCardResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMinimalPairs, setShowMinimalPairs] = useState(false);

  // Null safety: activity.words가 없으면 빈 배열 사용
  const words = activity?.words ?? [];
  const currentWord = words.length > 0 ? words[currentIndex] : null;
  const isLastWord = words.length > 0 && currentIndex === words.length - 1;

  const score = useMemo(() => {
    if (results.length === 0) return 0;
    const knownCount = results.filter((r) => r.known).length;
    return Math.round((knownCount / results.length) * 100);
  }, [results]);

  const handleKnown = useCallback(async () => {
    if (!currentWord) return;
    // Trigger success feedback
    await feedbackService.success();

    const newResults = [...results, { wordId: currentWord.id, known: true, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity?.id ?? '', newResults);
      setIsCompleted(true);
      const finalScore = Math.round(
        (newResults.filter((r) => r.known).length / newResults.length) * 100
      );
      onComplete?.(finalScore, 0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentWord, results, isLastWord, activity?.id, saveFlashCardResults, onComplete]);

  const handleUnknown = useCallback(async () => {
    if (!currentWord) return;
    // Trigger wrong feedback
    await feedbackService.wrong();

    // SRS에 단어 추가 (복습이 필요한 단어)
    addWordToSrs({
      wordId: currentWord.id,
      word: currentWord.word,
      meaning: currentWord.meaning,
      example: currentWord.example,
      pronunciation: currentWord.pronunciation,
    });

    const newResults = [...results, { wordId: currentWord.id, known: false, attempts: 1 }];
    setResults(newResults);

    if (isLastWord) {
      saveFlashCardResults(activity?.id ?? '', newResults);
      setIsCompleted(true);
      const finalScore = Math.round(
        (newResults.filter((r) => r.known).length / newResults.length) * 100
      );
      onComplete?.(finalScore, 0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentWord,
    results,
    isLastWord,
    activity?.id,
    saveFlashCardResults,
    onComplete,
    addWordToSrs,
  ]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsCompleted(false);
    setShowMinimalPairs(false);
  }, []);

  const handleMinimalPairsComplete = useCallback((_pairResults: MinimalPairsResult[]) => {
    setShowMinimalPairs(false);
  }, []);

  // 데이터가 없는 경우 빈 상태 표시 (hooks 호출 후에 조건부 반환)
  if (words.length === 0 || !currentWord) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>📚</Text>
        <Text style={styles.completedTitle}>단어 데이터 없음</Text>
        <Text style={styles.statsText}>이 레슨의 단어 데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  if (isCompleted) {
    // 발음 구분 연습 모드
    if (showMinimalPairs) {
      return (
        <MinimalPairs questions={SAMPLE_MINIMAL_PAIRS} onComplete={handleMinimalPairsComplete} />
      );
    }

    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={styles.completedTitle}>학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        <Text style={styles.statsText}>
          {results.filter((r) => r.known).length}개 암기 / {results.length}개 중
        </Text>

        {/* 발음 구분 연습 버튼 */}
        <Button
          mode="outlined"
          onPress={() => setShowMinimalPairs(true)}
          style={styles.minimalPairsButton}
          icon="ear-hearing"
        >
          발음 구분 연습
        </Button>

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
  minimalPairsButton: {
    marginTop: SIZES.spacing.lg,
    borderColor: COLORS.primary,
  },
  restartButton: {
    marginTop: SIZES.spacing.md,
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
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
});
