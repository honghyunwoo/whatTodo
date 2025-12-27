import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { ReadingActivity } from '@/types/activity';

import { QuizView } from './QuizView';

interface ReadingViewProps {
  activity: ReadingActivity;
  onComplete?: (score: number) => void;
}

type ViewMode = 'read' | 'quiz' | 'complete';

export function ReadingView({ activity, onComplete }: ReadingViewProps) {
  const [mode, setMode] = useState<ViewMode>('read');
  const [score, setScore] = useState(0);
  const [showVocabulary, setShowVocabulary] = useState(false);

  // Null safety: activity.passage, activity.vocabulary, activity.questions가 없으면 기본값 사용
  const passage = activity?.passage;
  const vocabulary = activity?.vocabulary ?? [];
  const questions = activity?.questions ?? [];

  const handleStartQuiz = useCallback(() => {
    setMode('quiz');
  }, []);

  const handleQuizComplete = useCallback(
    (results: { correct: boolean }[]) => {
      const correctCount = results.filter((r) => r.correct).length;
      const calculatedScore = Math.round((correctCount / results.length) * 100);
      setScore(calculatedScore);
      setMode('complete');
      onComplete?.(calculatedScore);
    },
    [onComplete]
  );

  const handleRestart = useCallback(() => {
    setMode('read');
    setScore(0);
    setShowVocabulary(false);
  }, []);

  if (mode === 'quiz') {
    if (questions.length === 0) {
      return (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>📄</Text>
          <Text style={styles.completedTitle}>퀴즈 데이터 없음</Text>
        </View>
      );
    }
    return <QuizView exercises={questions} onComplete={handleQuizComplete} />;
  }

  // 지문 데이터가 없는 경우
  if (!passage?.text) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>📄</Text>
        <Text style={styles.completedTitle}>읽기 데이터 없음</Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          이 레슨의 지문 데이터를 불러올 수 없습니다.
        </Text>
      </View>
    );
  }

  if (mode === 'complete') {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>📄</Text>
        <Text style={styles.completedTitle}>읽기 학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
          다시 학습하기
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{activity.title}</Text>
      {activity.description && <Text style={styles.description}>{activity.description}</Text>}

      <Card style={styles.passageCard}>
        <Card.Content>
          <View style={styles.passageHeader}>
            <Text style={styles.passageLabel}>지문</Text>
            <Text style={styles.wordCount}>{passage.wordCount ?? 0} words</Text>
          </View>
          <Divider style={styles.divider} />
          <Text style={styles.passageText}>{passage.text}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="text"
        onPress={() => setShowVocabulary(!showVocabulary)}
        style={styles.vocabularyToggle}
        icon={showVocabulary ? 'chevron-up' : 'chevron-down'}
      >
        핵심 어휘 ({vocabulary.length}개)
      </Button>

      {showVocabulary && vocabulary.length > 0 && (
        <Card style={styles.vocabularyCard}>
          <Card.Content>
            <View style={styles.vocabularyList}>
              {vocabulary.map((vocab, index) => (
                <Chip key={index} style={styles.vocabularyChip} textStyle={styles.vocabularyText}>
                  {vocab.word}: {vocab.meaning}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleStartQuiz}
        style={styles.quizButton}
        disabled={questions.length === 0}
      >
        독해 퀴즈 시작 ({questions.length}문제)
      </Button>
    </ScrollView>
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
  content: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xl,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  divider: {
    marginVertical: SIZES.spacing.sm,
  },
  passageCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  passageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passageLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  passageText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 26,
  },
  quizButton: {
    marginTop: SIZES.spacing.lg,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  vocabularyCard: {
    backgroundColor: COLORS.background,
    marginBottom: SIZES.spacing.md,
  },
  vocabularyChip: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.xs,
    marginRight: SIZES.spacing.xs,
  },
  vocabularyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vocabularyText: {
    fontSize: SIZES.fontSize.sm,
  },
  vocabularyToggle: {
    marginBottom: SIZES.spacing.sm,
  },
  wordCount: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
});
