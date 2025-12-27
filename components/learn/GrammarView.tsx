import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { GrammarActivity, QuizResult } from '@/types/activity';

import { QuizView } from './QuizView';

interface GrammarViewProps {
  activity: GrammarActivity;
  onComplete?: (score: number, xpEarned: number) => void;
}

type ViewMode = 'learn' | 'quiz' | 'complete';

export function GrammarView({ activity, onComplete }: GrammarViewProps) {
  const [mode, setMode] = useState<ViewMode>('learn');
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  // Null safety: activity.rules와 activity.exercises가 없으면 빈 배열 사용
  const rules = activity?.rules ?? [];
  const exercises = activity?.exercises ?? [];

  const handleStartQuiz = useCallback(() => {
    setMode('quiz');
  }, []);

  const handleQuizComplete = useCallback(
    (results: QuizResult[], totalXP: number) => {
      const correctCount = results.filter((r) => r.correct).length;
      const calculatedScore = Math.round((correctCount / results.length) * 100);
      setScore(calculatedScore);
      setEarnedXP(totalXP);
      setMode('complete');
      onComplete?.(calculatedScore, totalXP);
    },
    [onComplete]
  );

  const handleRestart = useCallback(() => {
    setMode('learn');
    setScore(0);
    setEarnedXP(0);
  }, []);

  if (mode === 'quiz') {
    if (exercises.length === 0) {
      return (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>📝</Text>
          <Text style={styles.completedTitle}>퀴즈 데이터 없음</Text>
        </View>
      );
    }
    return <QuizView exercises={exercises} onComplete={handleQuizComplete} />;
  }

  if (mode === 'complete') {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>📖</Text>
        <Text style={styles.completedTitle}>문법 학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        {earnedXP > 0 && <Text style={styles.xpText}>✨ +{earnedXP} XP</Text>}
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

      {rules.map((rule, index) => (
        <Card key={rule.id} style={styles.ruleCard}>
          <Card.Content>
            <Text style={styles.ruleNumber}>규칙 {index + 1}</Text>
            <Text style={styles.ruleName}>{rule.rule}</Text>
            <Text style={styles.ruleExplanation}>{rule.explanation}</Text>

            {rule.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.examplesLabel}>예문</Text>
                {rule.examples.map((example, i) => (
                  <View key={i} style={styles.example}>
                    <Text style={styles.exampleSentence}>{example.sentence}</Text>
                    <Text style={styles.exampleTranslation}>{example.translation}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={handleStartQuiz}
        style={styles.quizButton}
        disabled={exercises.length === 0}
      >
        퀴즈 시작 ({exercises.length}문제)
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
    marginVertical: SIZES.spacing.md,
  },
  example: {
    marginBottom: SIZES.spacing.sm,
  },
  exampleSentence: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  exampleTranslation: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    fontStyle: 'italic',
    marginTop: SIZES.spacing.xs,
  },
  examplesContainer: {
    marginTop: SIZES.spacing.sm,
  },
  examplesLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  quizButton: {
    marginTop: SIZES.spacing.lg,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  ruleCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  ruleExplanation: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
    marginTop: SIZES.spacing.sm,
  },
  ruleName: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  ruleNumber: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
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
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
});
