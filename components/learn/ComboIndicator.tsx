/**
 * Combo Indicator Component - Phase 0
 * 연속 정답 콤보 표시
 *
 * 심리학 원리: Progress Visualization + Variable Reward
 * 불꽃이 커지는 시각적 효과로 동기 부여
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { COMBO_THRESHOLDS, COMBO_LABELS } from '@/constants/rewards';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface ComboIndicatorProps {
  count: number;
  isOnFire: boolean; // 3+
  isBurning: boolean; // 5+
  isLegendary: boolean; // 10+
  showMultiplier?: boolean;
}

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

function getFireEmoji(count: number): string {
  if (count >= COMBO_THRESHOLDS.LEGENDARY) return '🔥🔥🔥';
  if (count >= COMBO_THRESHOLDS.BURNING) return '🔥🔥';
  if (count >= COMBO_THRESHOLDS.ON_FIRE) return '🔥';
  return '';
}

function getComboColor(count: number): string {
  if (count >= COMBO_THRESHOLDS.LEGENDARY) return '#FF4500'; // 주황빨강
  if (count >= COMBO_THRESHOLDS.BURNING) return '#FF6B35'; // 주황
  if (count >= COMBO_THRESHOLDS.ON_FIRE) return '#FFA500'; // 노랑주황
  return COLORS.primary;
}

function getLabel(count: number): string | null {
  if (count >= COMBO_THRESHOLDS.LEGENDARY) return COMBO_LABELS[COMBO_THRESHOLDS.LEGENDARY];
  if (count >= COMBO_THRESHOLDS.BURNING) return COMBO_LABELS[COMBO_THRESHOLDS.BURNING];
  if (count >= COMBO_THRESHOLDS.ON_FIRE) return COMBO_LABELS[COMBO_THRESHOLDS.ON_FIRE];
  return null;
}

function getMultiplier(count: number): string {
  if (count >= COMBO_THRESHOLDS.LEGENDARY) return 'x2.0';
  if (count >= COMBO_THRESHOLDS.BURNING) return 'x1.5';
  if (count >= COMBO_THRESHOLDS.ON_FIRE) return 'x1.2';
  return '';
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function ComboIndicator({
  count,
  isOnFire,
  isBurning,
  isLegendary,
  showMultiplier = true,
}: ComboIndicatorProps) {
  // 2 미만이면 표시 안함
  if (count < 2) return null;

  const fireEmoji = getFireEmoji(count);
  const color = getComboColor(count);
  const label = getLabel(count);
  const multiplier = getMultiplier(count);

  return (
    <AnimatePresence>
      <MotiView
        key={`combo-${count}`}
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 300 }}
        style={[styles.container, { backgroundColor: `${color}15` }]}
      >
        {/* 불꽃 이모지 (애니메이션) */}
        {isOnFire && (
          <MotiView
            from={{ scale: 1 }}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              type: 'timing',
              duration: 600,
              loop: true,
            }}
          >
            <Text style={styles.fire}>{fireEmoji}</Text>
          </MotiView>
        )}

        {/* 콤보 숫자 */}
        <MotiView
          from={{ scale: 0.8 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ type: 'spring', damping: 8 }}
        >
          <Text style={[styles.count, { color }]}>x{count}</Text>
        </MotiView>

        {/* 라벨 (ON FIRE! 등) */}
        {label && <Text style={[styles.label, { color }]}>{label}</Text>}

        {/* 배수 표시 */}
        {showMultiplier && multiplier && (
          <View style={[styles.multiplierBadge, { backgroundColor: color }]}>
            <Text style={styles.multiplierText}>{multiplier}</Text>
          </View>
        )}
      </MotiView>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────
// Compact 버전 (인라인용)
// ─────────────────────────────────────

interface ComboIndicatorCompactProps {
  count: number;
}

export function ComboIndicatorCompact({ count }: ComboIndicatorCompactProps) {
  if (count < 3) return null;

  const fireEmoji = getFireEmoji(count);
  const color = getComboColor(count);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      style={styles.compactContainer}
    >
      <Text style={styles.compactFire}>{fireEmoji}</Text>
      <Text style={[styles.compactCount, { color }]}>x{count}</Text>
    </MotiView>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.full,
    gap: SIZES.spacing.xs,
  },
  fire: {
    fontSize: 24,
  },
  count: {
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  multiplierBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.sm,
    marginLeft: SIZES.spacing.xs,
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Compact 스타일
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactFire: {
    fontSize: 16,
  },
  compactCount: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ComboIndicator;
