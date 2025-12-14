/**
 * Level Test View Component
 * Adaptive CEFR placement test UI
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, ProgressBar as PaperProgressBar, Text } from 'react-native-paper';

import { COLORS, withAlpha } from '@/constants/colors';
import { SHADOWS, SIZES } from '@/constants/sizes';
import { createQuestionBank } from '@/data/levelTestQuestions';
import { useLearnStore } from '@/store/learnStore';
import type { CEFRLevel } from '@/types/activity';
import type { LevelTestResult, TestQuestion } from '@/types/levelTest';
import { AdaptiveLevelTest, getLevelInfo } from '@/utils/levelTest';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface LevelTestViewProps {
  onComplete?: (result: LevelTestResult) => void;
  onCancel?: () => void;
}

type TestPhase = 'intro' | 'testing' | 'result';

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function LevelTestView({ onComplete, onCancel }: LevelTestViewProps) {
  const setCurrentLevel = useLearnStore((state) => state.setCurrentLevel);

  const [phase, setPhase] = useState<TestPhase>('intro');
  const [test, setTest] = useState<AdaptiveLevelTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<LevelTestResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─────────────────────────────────────
  // Test Initialization
  // ─────────────────────────────────────

  const startTest = useCallback(() => {
    const questionBank = createQuestionBank();
    const newTest = new AdaptiveLevelTest(questionBank, {}, 'A2');
    setTest(newTest);

    const firstQuestion = newTest.getNextQuestion();
    setCurrentQuestion(firstQuestion);
    setPhase('testing');
    setStartTime(Date.now());
  }, []);

  // ─────────────────────────────────────
  // Answer Handling
  // ─────────────────────────────────────

  const handleSelectAnswer = useCallback((index: number) => {
    if (showFeedback || selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowFeedback(true);

    // Animate feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after delay
    setTimeout(() => {
      handleNextQuestion(index);
    }, 1000);
  }, [showFeedback, selectedAnswer, scaleAnim]);

  const handleNextQuestion = useCallback((answerIndex: number) => {
    if (!test || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const { shouldContinue } = test.submitAnswer(currentQuestion, answerIndex, timeSpent);

    if (shouldContinue) {
      // Fade out and get next question
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const nextQuestion = test.getNextQuestion();
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setStartTime(Date.now());

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Test complete
      const testResult = test.getResult();
      if (testResult) {
        setResult(testResult);
        setPhase('result');

        // Save the level
        setCurrentLevel(testResult.finalLevel);
        onComplete?.(testResult);
      }
    }
  }, [test, currentQuestion, startTime, fadeAnim, setCurrentLevel, onComplete]);

  // ─────────────────────────────────────
  // Progress Info
  // ─────────────────────────────────────

  const progress = useMemo(() => {
    if (!test) return { current: 0, max: 30, percentage: 0 };
    return test.getProgress();
  }, [test, currentQuestion]);

  const currentAccuracy = useMemo(() => {
    if (!test) return 0;
    return test.getCurrentAccuracy();
  }, [test, currentQuestion]);

  const currentLevelInfo = useMemo(() => {
    if (!test) return getLevelInfo('A2');
    const state = test.getState();
    return getLevelInfo(state.currentLevel);
  }, [test, currentQuestion]);

  // ─────────────────────────────────────
  // Render: Intro Phase
  // ─────────────────────────────────────

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.introContent}>
          <View style={styles.introIcon}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={80} color={COLORS.primary} />
          </View>

          <Text style={styles.introTitle}>영어 레벨 테스트</Text>
          <Text style={styles.introSubtitle}>
            적응형 문제로 영어 레벨을 측정합니다
          </Text>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>15-30문제</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="trending-up" size={24} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>적응형 난이도</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="target" size={24} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>A1~B2 레벨</Text>
            </View>
          </View>

          <View style={styles.levelPreview}>
            <Text style={styles.levelPreviewTitle}>레벨 안내</Text>
            {(['A1', 'A2', 'B1', 'B2'] as CEFRLevel[]).map((level) => {
              const info = getLevelInfo(level);
              return (
                <View key={level} style={styles.levelRow}>
                  <View style={[styles.levelBadge, { backgroundColor: info.color }]}>
                    <Text style={styles.levelBadgeText}>{level}</Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelName}>{info.name}</Text>
                    <Text style={styles.levelDesc}>{info.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Button
            mode="contained"
            onPress={startTest}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
          >
            테스트 시작
          </Button>

          {onCancel && (
            <Button mode="text" onPress={onCancel} style={styles.cancelButton}>
              취소
            </Button>
          )}
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────
  // Render: Result Phase
  // ─────────────────────────────────────

  if (phase === 'result' && result) {
    const levelInfo = getLevelInfo(result.finalLevel);

    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <View style={[styles.resultLevelBadge, { backgroundColor: levelInfo.color }]}>
            <Text style={styles.resultLevelText}>{result.finalLevel}</Text>
          </View>

          <Text style={styles.resultTitle}>{levelInfo.name}</Text>
          <Text style={styles.resultDescription}>{levelInfo.description}</Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{result.confidence}%</Text>
              <Text style={styles.resultStatLabel}>정확도</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{Math.floor(result.duration / 60)}분</Text>
              <Text style={styles.resultStatLabel}>소요 시간</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{result.suggestedStartWeek}주차</Text>
              <Text style={styles.resultStatLabel}>시작</Text>
            </View>
          </View>

          <Card style={styles.skillCard}>
            <Card.Content>
              <Text style={styles.skillCardTitle}>영역별 분석</Text>
              {Object.entries(result.skillBreakdown).map(([skill, data]) => (
                <View key={skill} style={styles.skillRow}>
                  <Text style={styles.skillName}>{skill}</Text>
                  <View style={styles.skillBarContainer}>
                    <View
                      style={[
                        styles.skillBar,
                        { width: `${data.accuracy}%`, backgroundColor: getLevelInfo(data.estimatedLevel).color }
                      ]}
                    />
                  </View>
                  <Text style={styles.skillLevel}>{data.estimatedLevel}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {result.recommendations.length > 0 && (
            <Card style={styles.recommendationCard}>
              <Card.Content>
                <Text style={styles.recommendationTitle}>추천 학습</Text>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationRow}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            onPress={() => onCancel?.()}
            style={styles.doneButton}
          >
            {result.finalLevel} 레벨로 학습 시작
          </Button>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────
  // Render: Testing Phase
  // ─────────────────────────────────────

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>문제 로딩 중...</Text>
      </View>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.levelIndicator}>
          <View style={[styles.currentLevelBadge, { backgroundColor: currentLevelInfo.color }]}>
            <Text style={styles.currentLevelBadgeText}>{test?.getState().currentLevel}</Text>
          </View>
          <Text style={styles.levelLabel}>{currentLevelInfo.name}</Text>
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{progress.current} / {progress.max}</Text>
          <Text style={styles.accuracyText}>{currentAccuracy}% 정답</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <PaperProgressBar
        progress={progress.percentage / 100}
        color={COLORS.primary}
        style={styles.progressBar}
      />

      {/* Question */}
      <Animated.View
        style={[
          styles.questionContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.questionTypeTag}>
          <MaterialCommunityIcons
            name={getQuestionTypeIcon(currentQuestion.type)}
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.questionTypeText}>{currentQuestion.type}</Text>
        </View>

        {currentQuestion.context && (
          <Card style={styles.contextCard}>
            <Card.Content>
              <Text style={styles.contextText}>{currentQuestion.context}</Text>
            </Card.Content>
          </Card>
        )}

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === currentQuestion.correctAnswer;

            let optionStyle = styles.option;
            let optionTextStyle = styles.optionText;

            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
                optionTextStyle = { ...styles.optionText, ...styles.optionTextCorrect };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
                optionTextStyle = { ...styles.optionText, ...styles.optionTextWrong };
              }
            } else if (isSelected) {
              optionStyle = { ...styles.option, ...styles.optionSelected };
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleSelectAnswer(index)}
                disabled={showFeedback}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIndexContainer}>
                    <Text style={styles.optionIndex}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text style={optionTextStyle}>{option}</Text>
                  {showFeedback && isCorrectOption && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
                  )}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.danger} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && currentQuestion.explanation && (
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <MaterialCommunityIcons
              name={isCorrect ? 'check-circle' : 'information'}
              size={20}
              color={isCorrect ? COLORS.success : COLORS.warning}
            />
            <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function getQuestionTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    vocabulary: 'book-open-variant',
    grammar: 'format-text',
    reading: 'file-document-outline',
    listening: 'headphones',
  };
  return icons[type] || 'help-circle-outline';
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Intro
  introContent: {
    flex: 1,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  introIcon: {
    marginTop: SIZES.spacing.xxl,
    marginBottom: SIZES.spacing.lg,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  introSubtitle: {
    fontSize: SIZES.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.sm,
    ...SHADOWS.sm,
  },
  infoText: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
  },
  levelPreview: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    ...SHADOWS.sm,
  },
  levelPreviewTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  levelBadge: {
    width: 40,
    height: 28,
    borderRadius: SIZES.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  levelBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SIZES.fontSize.sm,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  levelDesc: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  startButton: {
    width: '100%',
    marginBottom: SIZES.spacing.md,
  },
  startButtonContent: {
    paddingVertical: SIZES.spacing.sm,
  },
  cancelButton: {
    marginTop: SIZES.spacing.sm,
  },

  // Testing
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  currentLevelBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  currentLevelBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SIZES.fontSize.sm,
  },
  levelLabel: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  accuracyText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 4,
  },
  questionContainer: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  questionTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.md,
  },
  questionTypeText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  contextCard: {
    marginBottom: SIZES.spacing.md,
    backgroundColor: withAlpha(COLORS.primary, 0.05),
  },
  contextText: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  questionText: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: SIZES.spacing.md,
  },
  option: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: withAlpha(COLORS.primary, 0.05),
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: withAlpha(COLORS.success, 0.1),
  },
  optionWrong: {
    borderColor: COLORS.danger,
    backgroundColor: withAlpha(COLORS.danger, 0.1),
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  optionIndexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndex: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: SIZES.fontSize.lg,
    color: COLORS.text,
  },
  optionTextCorrect: {
    color: COLORS.success,
    fontWeight: '600',
  },
  optionTextWrong: {
    color: COLORS.danger,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  feedbackCorrect: {
    backgroundColor: withAlpha(COLORS.success, 0.1),
  },
  feedbackWrong: {
    backgroundColor: withAlpha(COLORS.warning, 0.1),
  },
  feedbackText: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    color: COLORS.text,
  },

  // Result
  resultContent: {
    flex: 1,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  resultLevelBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.lg,
  },
  resultLevelText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  resultDescription: {
    fontSize: SIZES.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.sm,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultStatLabel: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  resultStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  skillCard: {
    width: '100%',
    marginBottom: SIZES.spacing.md,
  },
  skillCardTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  skillName: {
    width: 80,
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  skillBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginHorizontal: SIZES.spacing.sm,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: 4,
  },
  skillLevel: {
    width: 30,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  recommendationCard: {
    width: '100%',
    marginBottom: SIZES.spacing.lg,
  },
  recommendationTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  doneButton: {
    width: '100%',
    marginTop: 'auto',
  },
});

export default LevelTestView;
