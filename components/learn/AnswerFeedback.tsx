/**
 * Answer Feedback Component - Phase 0
 * 정답/오답 통합 피드백 컴포넌트
 *
 * 핵심 기능:
 * 1. Variable Reward - 랜덤 칭찬 메시지
 * 2. Combo System - 연속 정답 카운터
 * 3. XP Animation - 획득 XP 플로팅
 * 4. Multi-sensory - 햅틱 + 사운드 + 시각
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import LottieView from 'lottie-react-native';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import {
  selectPraise,
  selectWrongMessage,
  calculateXP,
  PraiseVariant,
  WrongVariant,
} from '@/constants/rewards';
import { feedbackService } from '@/services/feedbackService';
import { ComboIndicator } from './ComboIndicator';
import { XPPopup } from '@/components/common/XPPopup';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  visible: boolean;
  answerTimeMs?: number;
  baseXP?: number;
  combo: number;
  isFirstAnswer?: boolean;
  isPerfectScore?: boolean;
  onAnimationComplete?: () => void;
  onXPEarned?: (xp: number, bonusXP: number) => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function AnswerFeedback({
  isCorrect,
  visible,
  answerTimeMs = 5000,
  baseXP = 10,
  combo,
  isFirstAnswer = false,
  isPerfectScore = false,
  onAnimationComplete,
  onXPEarned,
}: AnswerFeedbackProps) {
  const { isDark } = useTheme();

  // State
  const [praise, setPraise] = useState<PraiseVariant | null>(null);
  const [wrongMsg, setWrongMsg] = useState<WrongVariant | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [xpVariant, setXpVariant] = useState<'normal' | 'bonus' | 'double' | 'jackpot'>('normal');

  /**
   * 정답 처리
   */
  const handleCorrectAnswer = useCallback(async () => {
    // 1. 칭찬 메시지 선택 (Variable Reward)
    const selectedPraise = selectPraise({
      streak: combo,
      answerTimeMs,
      isFirstAnswer,
      isPerfectScore,
    });
    setPraise(selectedPraise);

    // 2. XP 계산
    const xpResult = calculateXP(baseXP, combo, selectedPraise);
    setEarnedXP(xpResult.totalXP);

    // XP 변형 결정
    if (xpResult.bonusXP >= 20) {
      setXpVariant('jackpot');
    } else if (xpResult.bonusXP >= 10) {
      setXpVariant('double');
    } else if (xpResult.bonusXP > 0) {
      setXpVariant('bonus');
    } else {
      setXpVariant('normal');
    }

    // 3. 피드백 실행 (햅틱 + 사운드)
    if (selectedPraise.sound === 'bonus' || selectedPraise.bonusXP) {
      await feedbackService.bonus();
    } else if (selectedPraise.sound === 'perfect') {
      await feedbackService.perfect();
    } else if (selectedPraise.sound === 'combo') {
      await feedbackService.combo();
    } else if (selectedPraise.sound === 'amazing') {
      await feedbackService.levelUp();
    } else {
      await feedbackService.success();
    }

    // 4. XP 팝업 표시 (약간의 딜레이)
    setTimeout(() => {
      setShowXP(true);
      onXPEarned?.(xpResult.totalXP, xpResult.bonusXP);
    }, 300);

    // 5. 완료 콜백
    setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);
  }, [combo, answerTimeMs, isFirstAnswer, isPerfectScore, baseXP, onXPEarned, onAnimationComplete]);

  /**
   * 오답 처리
   */
  const handleWrongAnswer = useCallback(async () => {
    // 1. 격려 메시지 선택
    const selectedWrong = selectWrongMessage();
    setWrongMsg(selectedWrong);

    // 2. 피드백 실행
    await feedbackService.wrong();

    // 3. 완료 콜백
    setTimeout(() => {
      onAnimationComplete?.();
    }, 1500);
  }, [onAnimationComplete]);

  // 피드백 처리
  useEffect(() => {
    if (!visible || isCorrect === null) return;

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }, [visible, isCorrect, handleCorrectAnswer, handleWrongAnswer]);

  // 숨김 상태면 렌더링 안함
  if (!visible || isCorrect === null) return null;

  return (
    <View style={styles.container}>
      <AnimatePresence>
        {isCorrect ? (
          /* ─────────────────────────────────────
             정답 피드백
             ───────────────────────────────────── */
          <MotiView
            key="correct-feedback"
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            style={[
              styles.feedbackCard,
              styles.correctCard,
              { backgroundColor: isDark ? '#1a3a1a' : '#d4edda' },
            ]}
          >
            {/* Lottie 애니메이션 */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('@/assets/animations/correct-answer.json')}
                autoPlay
                loop={false}
                style={styles.lottie}
              />
            </View>

            {/* 칭찬 메시지 */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 100 }}
            >
              <Text style={styles.praiseEmoji}>{praise?.emoji}</Text>
              <Text style={[styles.praiseText, { color: COLORS.success }]}>{praise?.text}</Text>
            </MotiView>

            {/* 콤보 인디케이터 */}
            {combo >= 2 && (
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 200 }}
                style={styles.comboContainer}
              >
                <ComboIndicator
                  count={combo}
                  isOnFire={combo >= 3}
                  isBurning={combo >= 5}
                  isLegendary={combo >= 10}
                />
              </MotiView>
            )}

            {/* XP 팝업 */}
            <XPPopup
              amount={earnedXP}
              visible={showXP}
              variant={xpVariant}
              onComplete={() => setShowXP(false)}
            />
          </MotiView>
        ) : (
          /* ─────────────────────────────────────
             오답 피드백
             ───────────────────────────────────── */
          <MotiView
            key="wrong-feedback"
            from={{ opacity: 0, translateX: 0 }}
            animate={{
              opacity: 1,
              translateX: [0, -10, 10, -10, 10, 0], // 흔들림 효과
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={[
              styles.feedbackCard,
              styles.wrongCard,
              { backgroundColor: isDark ? '#3a1a1a' : '#f8d7da' },
            ]}
          >
            {/* Lottie 애니메이션 */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('@/assets/animations/wrong-answer.json')}
                autoPlay
                loop={false}
                style={styles.lottie}
              />
            </View>

            {/* 격려 메시지 */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 100 }}
            >
              <Text style={styles.wrongEmoji}>{wrongMsg?.emoji}</Text>
              <Text style={[styles.wrongText, { color: COLORS.danger }]}>{wrongMsg?.text}</Text>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.lg,
  },
  feedbackCard: {
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.borderRadius.lg,
    minWidth: 280,
  },
  correctCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  wrongCard: {
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: SIZES.spacing.md,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  praiseEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  praiseText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  comboContainer: {
    marginTop: SIZES.spacing.md,
  },
  wrongEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  wrongText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default AnswerFeedback;
