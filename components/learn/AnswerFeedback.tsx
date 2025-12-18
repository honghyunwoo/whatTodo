/**
 * Answer Feedback Component (Simplified)
 * Basic feedback for answers
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/colors';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  visible: boolean;
  answerTimeMs?: number;
  baseXP?: number;
  combo?: number;
  isFirstAnswer?: boolean;
  isPerfectScore?: boolean;
  onAnimationComplete?: () => void;
  onXPEarned?: (xp: number, bonusXP: number) => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function AnswerFeedback({ isCorrect, visible, onAnimationComplete }: AnswerFeedbackProps) {
  if (!visible) return null;

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
});

export default AnswerFeedback;
