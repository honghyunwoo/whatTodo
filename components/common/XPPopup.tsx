/**
 * XP Popup Component - Phase 0
 * XP 획득 시 플로팅 애니메이션
 *
 * 심리학 원리: Micro-wins - 작은 성취감의 시각화
 * 보상이 "보이면" 더 강한 도파민 반응
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export type XPVariant = 'normal' | 'bonus' | 'double' | 'jackpot';

interface XPPopupProps {
  amount: number;
  visible: boolean;
  variant?: XPVariant;
  onComplete?: () => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const VARIANT_STYLES: Record<XPVariant, { color: string; emoji: string; scale: number }> = {
  normal: { color: COLORS.primary, emoji: '', scale: 1 },
  bonus: { color: '#FFD700', emoji: ' +', scale: 1.1 },
  double: { color: '#FF6B35', emoji: ' 2x', scale: 1.2 },
  jackpot: { color: '#FF4500', emoji: ' JACKPOT', scale: 1.3 },
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function XPPopup({ amount, visible, variant = 'normal', onComplete }: XPPopupProps) {
  const styles = VARIANT_STYLES[variant];

  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible || amount <= 0) return null;

  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: [1, 1, 0],
        translateY: -80,
        scale: [styles.scale, styles.scale * 0.9, 0.8],
      }}
      transition={{
        type: 'timing',
        duration: 1500,
      }}
      style={componentStyles.container}
    >
      <Text style={[componentStyles.text, { color: styles.color }]}>
        +{amount} XP{styles.emoji}
      </Text>

      {/* 보너스일 때 이모지 추가 */}
      {variant !== 'normal' && (
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: [1.2, 1], rotate: '10deg' }}
          transition={{ type: 'spring', damping: 10 }}
          style={componentStyles.bonusIndicator}
        >
          <Text style={componentStyles.bonusEmoji}>
            {variant === 'bonus' && '🎁'}
            {variant === 'double' && '✨'}
            {variant === 'jackpot' && '💎'}
          </Text>
        </MotiView>
      )}
    </MotiView>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const componentStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  bonusIndicator: {
    marginLeft: SIZES.spacing.xs,
  },
  bonusEmoji: {
    fontSize: 24,
  },
});

export default XPPopup;
