import * as Speech from 'expo-speech';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { ListeningActivity } from '@/types/activity';

import { Dictation, DictationQuestion, DictationResult } from './exercises/Dictation';
import { QuizView } from './QuizView';

interface ListeningViewProps {
  activity: ListeningActivity;
  onComplete?: (score: number) => void;
}

type ViewMode = 'listen' | 'quiz' | 'dictation' | 'complete';

// 받아쓰기 문제 생성 함수
function createDictationQuestions(audioText: string): DictationQuestion[] {
  const sentences = audioText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences.slice(0, 5).map((sentence, index) => ({
    id: `dictation-${index}`,
    audioText: sentence,
    difficulty:
      sentence.split(' ').length < 5 ? 'easy' : sentence.split(' ').length < 10 ? 'medium' : 'hard',
  }));
}

export function ListeningView({ activity, onComplete }: ListeningViewProps) {
  const [mode, setMode] = useState<ViewMode>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Null safety: activity.audio와 activity.questions가 없으면 기본값 사용
  const audio = activity?.audio;
  const questions = activity?.questions ?? [];

  const handlePlay = useCallback(async () => {
    if (!audio?.text) return;

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const rate = audio.speed || 1.0;

    try {
      await Speech.speak(audio.text, {
        language: 'en-US',
        rate,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, audio]);

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

  const handleDictationComplete = useCallback(
    (results: DictationResult[]) => {
      const correctCount = results.filter((r) => r.correct).length;
      const calculatedScore = Math.round((correctCount / results.length) * 100);
      setScore(calculatedScore);
      setMode('complete');
      onComplete?.(calculatedScore);
    },
    [onComplete]
  );

  const handleStartDictation = useCallback(() => {
    Speech.stop();
    setIsPlaying(false);
    setMode('dictation');
  }, []);

  const handleRestart = useCallback(() => {
    setMode('listen');
    setScore(0);
    setShowTranscript(false);
  }, []);

  if (mode === 'quiz') {
    if (questions.length === 0) {
      return (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎧</Text>
          <Text style={styles.completedTitle}>퀴즈 데이터 없음</Text>
        </View>
      );
    }
    return <QuizView exercises={questions} onComplete={handleQuizComplete} />;
  }

  if (mode === 'dictation') {
    const dictationQuestions = audio?.text ? createDictationQuestions(audio.text) : [];
    if (dictationQuestions.length === 0) {
      return (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>📝</Text>
          <Text style={styles.completedTitle}>받아쓰기 데이터 없음</Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            이 레슨의 받아쓰기 데이터를 생성할 수 없습니다.
          </Text>
        </View>
      );
    }
    return <Dictation questions={dictationQuestions} onComplete={handleDictationComplete} />;
  }

  // 오디오 데이터가 없는 경우
  if (!audio?.text) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎧</Text>
        <Text style={styles.completedTitle}>오디오 데이터 없음</Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          이 레슨의 오디오 데이터를 불러올 수 없습니다.
        </Text>
      </View>
    );
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
          <Text style={styles.speedInfo}>속도: {audio.speed}x</Text>
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
            <Text style={styles.transcriptText}>{audio.text}</Text>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleStartQuiz}
        style={styles.quizButton}
        disabled={questions.length === 0}
      >
        퀴즈 시작 ({questions.length}문제)
      </Button>

      <Button
        mode="outlined"
        onPress={handleStartDictation}
        style={styles.dictationButton}
        icon="pencil"
      >
        받아쓰기 연습
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
  dictationButton: {
    marginTop: SIZES.spacing.sm,
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
