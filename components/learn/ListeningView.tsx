import * as Speech from 'expo-speech';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { ListeningActivity } from '@/types/activity';

import { QuizView } from './QuizView';

interface ListeningViewProps {
  activity: ListeningActivity;
  onComplete?: (score: number) => void;
}

type ViewMode = 'listen' | 'quiz' | 'complete';

export function ListeningView({ activity, onComplete }: ListeningViewProps) {
  const [mode, setMode] = useState<ViewMode>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const rate = activity.audio.speed || 1.0;

    try {
      await Speech.speak(activity.audio.text, {
        language: 'en-US',
        rate,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, activity.audio]);

  const handleStartQuiz = useCallback(() => {
    Speech.stop();
    setIsPlaying(false);
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
    setMode('listen');
    setScore(0);
    setShowTranscript(false);
  }, []);

  if (mode === 'quiz') {
    return <QuizView exercises={activity.questions} onComplete={handleQuizComplete} />;
  }

  if (mode === 'complete') {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎧</Text>
        <Text style={styles.completedTitle}>듣기 학습 완료!</Text>
        <Text style={styles.scoreText}>{score}점</Text>
        <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
          다시 학습하기
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{activity.title}</Text>
      {activity.description && <Text style={styles.description}>{activity.description}</Text>}

      <Card style={styles.playerCard}>
        <Card.Content style={styles.playerContent}>
          <IconButton
            icon={isPlaying ? 'pause-circle' : 'play-circle'}
            size={80}
            iconColor={COLORS.primary}
            onPress={handlePlay}
          />
          <Text style={styles.playerHint}>{isPlaying ? '재생 중...' : '탭하여 재생'}</Text>
          <Text style={styles.speedInfo}>속도: {activity.audio.speed}x</Text>
        </Card.Content>
      </Card>

      <Button
        mode="text"
        onPress={() => setShowTranscript(!showTranscript)}
        style={styles.transcriptToggle}
      >
        {showTranscript ? '대본 숨기기' : '대본 보기'}
      </Button>

      {showTranscript && (
        <Card style={styles.transcriptCard}>
          <Card.Content>
            <Text style={styles.transcriptText}>{activity.audio.text}</Text>
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={handleStartQuiz} style={styles.quizButton}>
        퀴즈 시작 ({activity.questions.length}문제)
      </Button>
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
    padding: SIZES.spacing.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  playerCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  playerContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  playerHint: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
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
  speedInfo: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  transcriptCard: {
    backgroundColor: COLORS.background,
    marginBottom: SIZES.spacing.md,
  },
  transcriptText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
  },
  transcriptToggle: {
    marginBottom: SIZES.spacing.sm,
  },
});
