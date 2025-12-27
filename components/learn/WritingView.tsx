import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Chip, Divider, Text, TextInput } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { WritingActivity } from '@/types/activity';

interface WritingViewProps {
  activity: WritingActivity;
  onComplete?: (score: number) => void;
}

type ViewMode = 'prompt' | 'write' | 'checklist' | 'complete';

export function WritingView({ activity, onComplete }: WritingViewProps) {
  const [mode, setMode] = useState<ViewMode>('prompt');
  const [writtenText, setWrittenText] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({});

  // Null safety: activity.prompt가 없으면 기본값 사용
  const prompt = activity?.prompt;

  const wordCount = useMemo(() => {
    return writtenText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, [writtenText]);

  const isWordCountValid = prompt?.wordCount
    ? wordCount >= prompt.wordCount.min && wordCount <= prompt.wordCount.max
    : false;

  const handleStartWriting = useCallback(() => {
    setMode('write');
  }, []);

  const handleFinishWriting = useCallback(() => {
    setMode('checklist');
  }, []);

  const handleChecklistToggle = useCallback((key: string) => {
    setChecklistCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleComplete = useCallback(() => {
    const totalItems =
      activity?.evaluationChecklist?.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
    const checkedItems = Object.values(checklistCompleted).filter(Boolean).length;
    const score = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 100;

    setMode('complete');
    onComplete?.(score);
  }, [activity?.evaluationChecklist, checklistCompleted, onComplete]);

  const handleRestart = useCallback(() => {
    setMode('prompt');
    setWrittenText('');
    setShowExamples(false);
    setShowVocabulary(false);
    setChecklistCompleted({});
  }, []);

  // 데이터가 없는 경우 빈 상태 표시 (hooks 호출 후에 조건부 반환)
  if (!prompt?.topic) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>✏️</Text>
        <Text style={styles.completedTitle}>쓰기 데이터 없음</Text>
        <Text style={styles.statsText}>이 레슨의 글쓰기 데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  if (mode === 'complete') {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>✏️</Text>
        <Text style={styles.completedTitle}>쓰기 학습 완료!</Text>
        <Text style={styles.statsText}>{wordCount}단어 작성</Text>
        <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
          다시 쓰기
        </Button>
      </View>
    );
  }

  if (mode === 'checklist') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>자기 평가</Text>
        <Text style={styles.description}>작성한 글을 평가해보세요</Text>

        <Card style={styles.writtenTextCard}>
          <Card.Content>
            <Text style={styles.writtenTextLabel}>내가 쓴 글</Text>
            <Text style={styles.writtenText}>{writtenText}</Text>
            <Text style={styles.wordCountText}>{wordCount} 단어</Text>
          </Card.Content>
        </Card>

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
                    <Text style={styles.checklistText} onPress={() => handleChecklistToggle(key)}>
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

  if (mode === 'write') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.writeHeader}>
          <Text style={styles.title}>글쓰기</Text>
          <View style={styles.wordCountContainer}>
            <Text
              style={[
                styles.wordCountBadge,
                isWordCountValid ? styles.wordCountValid : styles.wordCountInvalid,
              ]}
            >
              {wordCount} / {prompt.wordCount.min}-{prompt.wordCount.max}
            </Text>
          </View>
        </View>

        <Card style={styles.promptSummaryCard}>
          <Card.Content>
            <Text style={styles.promptTopic}>{prompt.topic}</Text>
            <Text style={styles.timeLimit}>⏱️ 제한 시간: {prompt.timeLimit}분</Text>
          </Card.Content>
        </Card>

        <TextInput
          mode="outlined"
          multiline
          numberOfLines={10}
          value={writtenText}
          onChangeText={setWrittenText}
          placeholder="여기에 영어로 글을 작성하세요..."
          style={styles.textInput}
        />

        <Button
          mode="text"
          onPress={() => setShowExamples(!showExamples)}
          icon={showExamples ? 'chevron-up' : 'chevron-down'}
        >
          예시 문장 보기
        </Button>

        {showExamples && activity.exampleSentences && (
          <Card style={styles.helpCard}>
            <Card.Content>
              {activity.exampleSentences.map((example) => (
                <View key={example.id} style={styles.exampleItem}>
                  <Text style={styles.exampleSentence}>{example.sentence}</Text>
                  <Text style={styles.exampleTranslation}>{example.translation}</Text>
                  <Text style={styles.exampleUseCase}>💡 {example.useCase}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="text"
          onPress={() => setShowVocabulary(!showVocabulary)}
          icon={showVocabulary ? 'chevron-up' : 'chevron-down'}
        >
          도움말 어휘
        </Button>

        {showVocabulary && activity.vocabularyHelp && (
          <Card style={styles.helpCard}>
            <Card.Content>
              {activity.vocabularyHelp.map((vocab, index) => (
                <View key={index} style={styles.vocabItem}>
                  <Text style={styles.vocabWord}>{vocab.word}</Text>
                  <Text style={styles.vocabTranslation}>{vocab.translation}</Text>
                  <Text style={styles.vocabExample}>예: {vocab.example}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleFinishWriting}
          style={styles.submitButton}
          disabled={wordCount < prompt.wordCount.min}
        >
          작성 완료
        </Button>
      </ScrollView>
    );
  }

  // Prompt mode (default)
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{activity.title}</Text>
      {activity.description && <Text style={styles.description}>{activity.description}</Text>}

      <Card style={styles.promptCard}>
        <Card.Content>
          <Text style={styles.promptTopic}>{prompt.topic}</Text>
          <Text style={styles.promptDescription}>{prompt.description}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.requirementsLabel}>✅ 요구사항</Text>
          {prompt.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.metaInfo}>
            <Chip icon="text" style={styles.metaChip}>
              {prompt.wordCount.min}-{prompt.wordCount.max} 단어
            </Chip>
            <Chip icon="clock-outline" style={styles.metaChip}>
              {prompt.timeLimit}분
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleStartWriting} style={styles.startButton}>
        글쓰기 시작
      </Button>
    </ScrollView>
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
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  divider: {
    marginVertical: SIZES.spacing.md,
  },
  exampleItem: {
    marginBottom: SIZES.spacing.md,
  },
  exampleSentence: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  exampleTranslation: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
  },
  exampleUseCase: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
  },
  helpCard: {
    backgroundColor: COLORS.background,
    marginBottom: SIZES.spacing.md,
  },
  metaChip: {
    marginRight: SIZES.spacing.sm,
  },
  metaInfo: {
    flexDirection: 'row',
  },
  promptCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  promptDescription: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
    marginTop: SIZES.spacing.sm,
  },
  promptSummaryCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  promptTopic: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  requirementBullet: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    marginRight: SIZES.spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.xs,
  },
  requirementText: {
    color: COLORS.text,
    flex: 1,
    fontSize: SIZES.fontSize.md,
  },
  requirementsLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  restartButton: {
    marginTop: SIZES.spacing.xl,
  },
  startButton: {
    marginTop: SIZES.spacing.md,
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
  },
  submitButton: {
    marginTop: SIZES.spacing.lg,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
    minHeight: 200,
  },
  timeLimit: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  vocabExample: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    fontStyle: 'italic',
    marginTop: SIZES.spacing.xs,
  },
  vocabItem: {
    marginBottom: SIZES.spacing.md,
  },
  vocabTranslation: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  vocabWord: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  wordCountBadge: {
    borderRadius: SIZES.borderRadius.sm,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  wordCountContainer: {
    alignItems: 'center',
  },
  wordCountInvalid: {
    backgroundColor: COLORS.danger + '20',
    color: COLORS.danger,
  },
  wordCountText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.sm,
    textAlign: 'right',
  },
  wordCountValid: {
    backgroundColor: COLORS.success + '20',
    color: COLORS.success,
  },
  writeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  writtenText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
    marginTop: SIZES.spacing.sm,
  },
  writtenTextCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  writtenTextLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
});
