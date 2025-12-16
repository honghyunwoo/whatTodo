/**
 * Streak Warning Component - Phase 0
 * 스트릭 위험 경고 모달
 *
 * 심리학 원리: Loss Aversion (손실 회피)
 * "잃을 위험" > "얻을 기회"
 * 경고는 행동을 촉구하는 가장 강력한 방법
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useStreakStore } from '@/store/streakStore';
import { feedbackService } from '@/services/feedbackService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface StreakWarningProps {
  visible: boolean;
  onDismiss: () => void;
  onStartLearning: () => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function StreakWarning({ visible, onDismiss, onStartLearning }: StreakWarningProps) {
  const { colors, isDark } = useTheme();
  const streakStore = useStreakStore();
  const { currentStreak, streakFreezes } = streakStore;

  /**
   * 스트릭 프리즈 사용
   */
  const handleUseFreeze = async () => {
    const success = streakStore.useStreakFreeze();
    if (success) {
      await feedbackService.success();
      streakStore.markWarningShown();
      onDismiss();
    } else {
      await feedbackService.wrong();
    }
  };

  /**
   * 학습 시작
   */
  const handleStartLearning = () => {
    streakStore.markWarningShown();
    onStartLearning();
  };

  /**
   * 나중에 (경고만 닫기)
   */
  const handleDismiss = () => {
    streakStore.markWarningShown();
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          {/* 경고 아이콘 (흔들림 애니메이션) */}
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{
              rotate: ['-10deg', '10deg', '-10deg', '10deg', '0deg'],
            }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <Text style={styles.warningEmoji}>😱</Text>
          </MotiView>

          {/* 타이틀 */}
          <Text style={[styles.title, { color: COLORS.danger }]}>
            {currentStreak}일 스트릭이 위험해요!
          </Text>

          {/* 설명 */}
          <Text style={[styles.message, { color: colors.text }]}>
            오늘 학습을 완료하지 않으면{'\n'}
            스트릭이 사라져요!
          </Text>

          {/* 스트릭 표시 */}
          <View style={[styles.streakDisplay, { backgroundColor: isDark ? '#2C2C2E' : '#FFF3CD' }]}>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 800, loop: true }}
            >
              <Text style={styles.fireEmoji}>🔥</Text>
            </MotiView>
            <Text style={[styles.streakNumber, { color: COLORS.warning }]}>{currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>일 연속</Text>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttons}>
            {/* 학습하기 버튼 (메인) */}
            <Pressable
              style={[styles.primaryButton, { backgroundColor: COLORS.primary }]}
              onPress={handleStartLearning}
            >
              <MaterialCommunityIcons name="book-open-variant" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>지금 학습하기</Text>
            </Pressable>

            {/* 프리즈 사용 버튼 */}
            {streakFreezes > 0 && (
              <Pressable
                style={[
                  styles.freezeButton,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#E3F2FD',
                    borderColor: '#2196F3',
                  },
                ]}
                onPress={handleUseFreeze}
              >
                <Text style={styles.freezeEmoji}>❄️</Text>
                <View style={styles.freezeTextContainer}>
                  <Text style={[styles.freezeButtonText, { color: '#2196F3' }]}>
                    스트릭 프리즈 사용
                  </Text>
                  <Text style={[styles.freezeCount, { color: colors.textSecondary }]}>
                    {streakFreezes}개 남음
                  </Text>
                </View>
              </Pressable>
            )}

            {/* 나중에 버튼 */}
            <Pressable style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={[styles.dismissText, { color: colors.textSecondary }]}>나중에</Text>
            </Pressable>
          </View>

          {/* 프리즈 없을 때 안내 */}
          {streakFreezes === 0 && (
            <Text style={[styles.noFreezeHint, { color: colors.textSecondary }]}>
              💡 학습을 완료하면 프리즈를 획득할 수 있어요!
            </Text>
          )}
        </MotiView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: SIZES.borderRadius.xl,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
  },
  warningEmoji: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.spacing.lg,
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.lg,
  },
  fireEmoji: {
    fontSize: 32,
    marginRight: SIZES.spacing.sm,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 16,
    marginLeft: SIZES.spacing.xs,
  },
  buttons: {
    width: '100%',
    gap: SIZES.spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1.5,
    gap: SIZES.spacing.sm,
  },
  freezeEmoji: {
    fontSize: 20,
  },
  freezeTextContainer: {
    alignItems: 'center',
  },
  freezeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  freezeCount: {
    fontSize: 12,
  },
  dismissButton: {
    paddingVertical: SIZES.spacing.md,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
  },
  noFreezeHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
    fontStyle: 'italic',
  },
});

export default StreakWarning;
