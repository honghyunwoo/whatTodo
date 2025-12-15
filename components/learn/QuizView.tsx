/**
 * Quiz View - Phase 0.5 Enhanced
 * 퀴즈 뷰 with 콤보 시스템 & Variable Reward
 *
 * 개선 사항:
 * 1. Combo System - 연속 정답 추적
 * 2. XP Popup - 획득 XP 시각화
 * 3. Enhanced Feedback - feedbackService 통합
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { Exercise, QuizResult } from '@/types/activity';
import { feedbackService } from '@/services/feedbackService';
import { selectPraise, selectWrongMessage, calculateXP } from '@/constants/rewards';
import { ComboIndicator } from './ComboIndicator';
import { XPPopup } from '@/components/common/XPPopup';

interface QuizViewProps {
  exercises: Exercise[];
  onComplete: (results: QuizResult[], totalXP: number) => void;
}

interface AnswerState {
  selected: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
}

export function QuizView({ exercises, onComplete }: QuizViewProps) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>({
    selected: null,
    isCorrect: null,
    showExplanation: false,
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackRef = useRef<LottieView>(null);

  // Combo & XP State
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpVariant, setXpVariant] = useState<'normal' | 'bonus' | 'double' | 'jackpot'>('normal');
  const [praiseText, setPraiseText] = useState('');
  const [praiseEmoji, setPraiseEmoji] = useState('');

  const currentExercise = exercises[currentIndex];
  const isLastQuestion = currentIndex === exercises.length - 1;
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
    setShowFeedback(false);
    setShowXP(false);
  }, [currentIndex]);

  const handleSelectAnswer = useCallback(
    async (answer: string) => {
      if (answerState.selected) return;

      const isCorrect = answer === currentExercise.answer;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const answerTimeMs = Date.now() - startTime;

      // Update combo
      const newCombo = isCorrect ? combo + 1 : 0;
      setCombo(newCombo);

      // Feedback & XP calculation
      if (isCorrect) {
        // Select praise message (Variable Reward)
        const praise = selectPraise({
          streak: newCombo,
          answerTimeMs,
          isFirstAnswer: currentIndex === 0,
          isPerfectScore: false,
        });
        setPraiseText(praise.text);
        setPraiseEmoji(praise.emoji);

        // Calculate XP
        const xpResult = calculateXP(10, newCombo, praise);
        setCurrentXP(xpResult.totalXP);
        setTotalXP((prev) => prev + xpResult.totalXP);

        // Determine XP variant for animation
        if (xpResult.bonusXP >= 20) {
          setXpVariant('jackpot');
        } else if (xpResult.bonusXP >= 10) {
          setXpVariant('double');
        } else if (xpResult.bonusXP > 0) {
          setXpVariant('bonus');
        } else {
          setXpVariant('normal');
        }

        // Trigger feedback based on praise type
        if (praise.sound === 'bonus' || praise.bonusXP) {
          await feedbackService.bonus();
        } else if (praise.sound === 'combo') {
          await feedbackService.combo();
        } else if (praise.sound === 'amazing') {
          await feedbackService.levelUp();
        } else {
          await feedbackService.success();
        }

        // Show XP popup after a short delay
        setTimeout(() => setShowXP(true), 200);
      } else {
        // Wrong answer
        const wrongMsg = selectWrongMessage();
        setPraiseText(wrongMsg.text);
        setPraiseEmoji(wrongMsg.emoji);
        await feedbackService.wrong();
      }

      setShowFeedback(true);
      feedbackRef.current?.play();

      const result: QuizResult = {
        exerciseId: currentExercise.id,
        correct: isCorrect,
        userAnswer: answer,
        timeSpent,
      };

      setResults((prev) => [...prev, result]);
      setAnswerState({
        selected: answer,
        isCorrect,
        showExplanation: true,
      });
    },
    [answerState.selected, currentExercise, startTime, combo, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(results, totalXP);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswerState({
        selected: null,
        isCorrect: null,
        showExplanation: false,
      });
    }
  }, [isLastQuestion, onComplete, results, totalXP]);

  const getOptionStyle = useCallback(
    (option: string) => {
      if (!answerState.selected) {
        return styles.option;
      }

      if (option === currentExercise.answer) {
        return [styles.option, styles.correctOption];
      }

      if (option === answerState.selected && !answerState.isCorrect) {
        return [styles.option, styles.wrongOption];
      }

      return [styles.option, styles.disabledOption];
    },
    [answerState, currentExercise.answer]
  );

  const getOptionTextStyle = useCallback(
    (option: string) => {
      if (!answerState.selected) {
        return styles.optionText;
      }

      if (option === currentExercise.answer) {
        return [styles.optionText, styles.correctOptionText];
      }

      if (option === answerState.selected && !answerState.isCorrect) {
        return [styles.optionText, styles.wrongOptionText];
      }

      return [styles.optionText, styles.disabledOptionText];
    },
    [answerState, currentExercise.answer]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Feedback Animation Overlay */}
      {showFeedback && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.feedbackOverlay}
          pointerEvents="none"
        >
          <LottieView
            ref={feedbackRef}
            source={
              answerState.isCorrect
                ? require('@/assets/animations/correct-answer.json')
                : require('@/assets/animations/wrong-answer.json')
            }
            style={styles.feedbackAnimation}
            loop={false}
          />

          {/* Praise Message */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.praiseContainer}
          >
            <Text style={styles.praiseEmoji}>{praiseEmoji}</Text>
            <Text
              style={[
                styles.praiseText,
                { color: answerState.isCorrect ? COLORS.success : COLORS.danger },
              ]}
            >
              {praiseText}
            </Text>
          </MotiView>

          {/* XP Popup */}
          {showXP && answerState.isCorrect && (
            <XPPopup
              amount={currentXP}
              visible={showXP}
              variant={xpVariant}
              onComplete={() => setShowXP(false)}
            />
          )}
        </Animated.View>
      )}

      {/* 상단: 진행률 & 콤보 */}
      <View style={styles.header}>
        <View style={styles.progressSection}>
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: isDark ? '#38383A' : COLORS.border },
            ]}
          >
            <MotiView
              animate={{ width: `${progress}%` }}
              transition={{ type: 'timing', duration: 300 }}
              style={[styles.progressBar, { backgroundColor: COLORS.primary }]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {exercises.length}
          </Text>
        </View>

        {/* 콤보 표시 (2 이상일 때만) */}
        {combo >= 2 && (
          <ComboIndicator
            count={combo}
            isOnFire={combo >= 3}
            isBurning={combo >= 5}
            isLegendary={combo >= 10}
          />
        )}
      </View>

      {/* XP 누적 표시 */}
      {totalXP > 0 && (
        <View style={[styles.xpBadge, { backgroundColor: isDark ? '#2C2C2E' : '#FFF8E1' }]}>
          <Text style={styles.xpBadgeText}>✨ {totalXP} XP</Text>
        </View>
      )}

      {/* 질문 */}
      <MotiView
        key={currentIndex}
        from={{ opacity: 0, translateX: 30 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <Card
          style={[styles.questionCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            <Text style={[styles.question, { color: colors.text }]}>
              {currentExercise.question}
            </Text>
          </Card.Content>
        </Card>
      </MotiView>

      {/* 선택지 */}
      <View style={styles.optionsContainer}>
        {currentExercise.options?.map((option, index) => (
          <MotiView
            key={`${currentIndex}-${index}`}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: index * 100 }}
          >
            <Pressable
              style={[
                getOptionStyle(option),
                { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={!!answerState.selected}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </Pressable>
          </MotiView>
        ))}
      </View>

      {/* 해설 */}
      {answerState.showExplanation && currentExercise.explanation && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <Card
            style={[
              styles.explanationCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.explanationLabel,
                  { color: answerState.isCorrect ? COLORS.success : COLORS.danger },
                ]}
              >
                {answerState.isCorrect ? '🎉 정답입니다!' : '😢 오답입니다'}
              </Text>
              <Text style={[styles.explanationText, { color: colors.text }]}>
                {currentExercise.explanation}
              </Text>
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* 다음 버튼 */}
      {answerState.selected && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </Button>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  progressSection: {
    flex: 1,
    marginRight: SIZES.spacing.md,
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  feedbackAnimation: {
    width: 150,
    height: 150,
  },
  praiseContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.md,
  },
  praiseEmoji: {
    fontSize: 32,
    marginBottom: SIZES.spacing.xs,
  },
  praiseText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.sm,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  correctOption: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  correctOptionText: {
    color: COLORS.success,
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledOptionText: {
    color: COLORS.textSecondary,
  },
  explanationCard: {
    backgroundColor: COLORS.background,
    marginTop: SIZES.spacing.md,
  },
  explanationLabel: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  explanationText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
  },
  nextButton: {
    marginTop: SIZES.spacing.lg,
  },
  option: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  optionText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: SIZES.spacing.lg,
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressContainer: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 8,
    marginBottom: SIZES.spacing.xs,
    overflow: 'hidden',
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
  },
  question: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: COLORS.surface,
  },
  wrongOption: {
    backgroundColor: COLORS.danger + '20',
    borderColor: COLORS.danger,
  },
  wrongOptionText: {
    color: COLORS.danger,
  },
});
