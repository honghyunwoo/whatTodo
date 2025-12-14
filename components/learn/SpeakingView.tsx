import * as Speech from 'expo-speech';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, IconButton, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { SpeakingActivity, SpeakingSentence } from '@/types/activity';

import { ProgressBar } from './ProgressBar';

interface SpeakingViewProps {
  activity: SpeakingActivity;
  onComplete?: (score: number) => void;
}

type ViewMode = 'practice' | 'checklist' | 'complete';

export function SpeakingView({ activity, onComplete }: SpeakingViewProps) {
  const [mode, setMode] = useState<ViewMode>('practice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practicedSentences, setPracticedSentences] = useState<Set<string>>(new Set());
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({});

  const sentences = activity.sentences;
  const currentSentence = sentences[currentIndex];
  const isLastSentence = currentIndex === sentences.length - 1;

  const handlePlaySentence = useCallback(
    async (sentence: SpeakingSentence) => {
      if (isPlaying) {
        Speech.stop();
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      try {
        await Speech.speak(sentence.text, {
          language: 'en-US',
          rate: 0.8, // 천천히 발음
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      } catch {
        setIsPlaying(false);
      }
    },
    [isPlaying]
  );

  const handleMarkPracticed = useCallback(() => {
    setPracticedSentences((prev) => new Set(prev).add(currentSentence.id));
  }, [currentSentence]);

  const handleNext = useCallback(() => {
    if (isLastSentence) {
      Speech.stop();
      setIsPlaying(false);
      setMode('checklist');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastSentence]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleChecklistToggle = useCallback((key: string) => {
    setChecklistCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleComplete = useCallback(() => {
    const totalItems =
      activity.evaluationChecklist?.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
    const checkedItems = Object.values(checklistCompleted).filter(Boolean).length;
    const score = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 100;

    setMode('complete');
    onComplete?.(score);
  }, [activity.evaluationChecklist, checklistCompleted, onComplete]);

  const handleRestart = useCallback(() => {
    setMode('practice');
    setCurrentIndex(0);
    setPracticedSentences(new Set());
    setChecklistCompleted({});
    Speech.stop();
    setIsPlaying(false);
  }, []);

  if (mode === 'complete') {
    const practicedCount = practicedSentences.size;
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎤</Text>
        <Text style={styles.completedTitle}>말하기 학습 완료!</Text>
        <Text style={styles.statsText}>
          {practicedCount}개 문장 연습 / {sentences.length}개 중
        </Text>
        <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
          다시 연습하기
        </Button>
      </View>
    );
  }

  if (mode === 'checklist') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>자기 평가</Text>
        <Text style={styles.description}>연습 결과를 체크해보세요</Text>

        {activity.evaluationChecklist?.map((category, catIndex) => (
          <Card key={catIndex} style={styles.checklistCard}>
            <Card.Content>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              {category.items.map((item, itemIndex) => {
                const key = `${catIndex}-${itemIndex}`;
                return (
                  <View key={key} style={styles.checklistItem}>
                    <Checkbox
                      status={checklistCompleted[key] ? 'checked' : 'unchecked'}
                      onPress={() => handleChecklistToggle(key)}
                      color={COLORS.primary}
                    />
                    <Text
                      style={styles.checklistText}
                      onPress={() => handleChecklistToggle(key)}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ))}

        <Button mode="contained" onPress={handleComplete} style={styles.completeButton}>
          학습 완료
        </Button>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activity.title}</Text>
        <ProgressBar current={currentIndex + 1} total={sentences.length} />
      </View>

      <ScrollView style={styles.sentenceContainer} contentContainerStyle={styles.sentenceContent}>
        <Card style={styles.sentenceCard}>
          <Card.Content style={styles.sentenceCardContent}>
            <View style={styles.playButtonContainer}>
              <IconButton
                icon={isPlaying ? 'pause-circle' : 'volume-high'}
                size={60}
                iconColor={COLORS.primary}
                onPress={() => handlePlaySentence(currentSentence)}
              />
              <Text style={styles.playHint}>{isPlaying ? '재생 중...' : '탭하여 들어보기'}</Text>
            </View>

            <Text style={styles.sentenceText}>{currentSentence.text}</Text>
            <Text style={styles.translationText}>{currentSentence.translation}</Text>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsLabel}>💡 발음 팁</Text>
              <Text style={styles.tipsText}>{currentSentence.tips}</Text>
            </View>

            <Button
              mode={practicedSentences.has(currentSentence.id) ? 'contained' : 'outlined'}
              onPress={handleMarkPracticed}
              style={styles.practiceButton}
              icon={practicedSentences.has(currentSentence.id) ? 'check' : 'microphone'}
            >
              {practicedSentences.has(currentSentence.id) ? '연습 완료!' : '연습했어요'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.navigation}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={styles.navButton}
        >
          이전
        </Button>
        <Button mode="contained" onPress={handleNext} style={styles.navButton}>
          {isLastSentence ? '평가하기' : '다음'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  checklistCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  checklistItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SIZES.spacing.xs,
  },
  checklistText: {
    color: COLORS.text,
    flex: 1,
    fontSize: SIZES.fontSize.md,
  },
  completeButton: {
    marginTop: SIZES.spacing.md,
  },
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
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  header: {
    padding: SIZES.spacing.md,
  },
  navButton: {
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
  },
  navigation: {
    flexDirection: 'row',
    padding: SIZES.spacing.md,
  },
  playButtonContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  playHint: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  practiceButton: {
    marginTop: SIZES.spacing.lg,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  sentenceCard: {
    backgroundColor: COLORS.surface,
  },
  sentenceCardContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  sentenceContainer: {
    flex: 1,
  },
  sentenceContent: {
    padding: SIZES.spacing.md,
  },
  sentenceText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
  },
  tipsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    width: '100%',
  },
  tipsLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  tipsText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  translationText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
  },
});
