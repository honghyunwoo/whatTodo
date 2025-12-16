/**
 * Session Complete Modal - Phase 0.5
 * 학습 완료 후 "한 레슨 더?" 유도 모달
 *
 * 심리학 원리: Action Prompt (행동 유도)
 * - 완료 직후가 다음 행동 유도의 최적 타이밍
 * - 긍정적 감정 상태에서 다음 행동 결정
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface SessionCompleteModalProps {
  visible: boolean;
  score: number;
  xpEarned: number;
  streak: number;
  perfectScore: boolean;
  activityType: string;
  onOneMore: () => void;
  onGoHome: () => void;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function SessionCompleteModal({
  visible,
  score,
  xpEarned,
  streak,
  perfectScore,
  activityType,
  onOneMore,
  onGoHome,
}: SessionCompleteModalProps) {
  const { isDark } = useTheme();

  // 점수에 따른 메시지
  const getMessage = () => {
    if (perfectScore) return '완벽해요! 만점!';
    if (score >= 90) return '훌륭해요!';
    if (score >= 70) return '잘했어요!';
    if (score >= 50) return '좋은 시작이에요!';
    return '계속 연습해봐요!';
  };

  // 점수에 따른 이모지
  const getEmoji = () => {
    if (perfectScore) return '🎯';
    if (score >= 90) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 50) return '💪';
    return '📚';
  };

  // 활동 타입 한글화
  const getActivityName = () => {
    const names: Record<string, string> = {
      vocabulary: '어휘',
      grammar: '문법',
      listening: '듣기',
      reading: '읽기',
      speaking: '말하기',
      writing: '쓰기',
    };
    return names[activityType] || '학습';
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          {/* 성공 애니메이션 */}
          {perfectScore && (
            <LottieView
              source={require('@/assets/animations/confetti.json')}
              autoPlay
              loop={false}
              style={styles.confetti}
            />
          )}

          {/* 이모지 애니메이션 */}
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 200 }}
          >
            <Text style={styles.emoji}>{getEmoji()}</Text>
          </MotiView>

          {/* 축하 메시지 */}
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : COLORS.text }]}>
            {getMessage()}
          </Text>

          <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : COLORS.textSecondary }]}>
            {getActivityName()} 학습 완료
          </Text>

          {/* 결과 요약 */}
          <View
            style={[styles.statsContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' }]}
          >
            {/* 점수 */}
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : COLORS.text }]}>
                {score}점
              </Text>
              <Text
                style={[styles.statLabel, { color: isDark ? '#8E8E93' : COLORS.textSecondary }]}
              >
                점수
              </Text>
            </View>

            {/* XP */}
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>✨</Text>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>+{xpEarned}</Text>
              <Text
                style={[styles.statLabel, { color: isDark ? '#8E8E93' : COLORS.textSecondary }]}
              >
                XP
              </Text>
            </View>

            {/* 스트릭 */}
            {streak > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{streak}일</Text>
                <Text
                  style={[styles.statLabel, { color: isDark ? '#8E8E93' : COLORS.textSecondary }]}
                >
                  연속
                </Text>
              </View>
            )}
          </View>

          {/* 버튼들 */}
          <View style={styles.buttons}>
            {/* 한 레슨 더! (메인 버튼 - 더 크고 눈에 띄게) */}
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            >
              <Pressable
                style={[styles.primaryButton, { backgroundColor: COLORS.primary }]}
                onPress={onOneMore}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>한 레슨 더!</Text>
              </Pressable>
            </MotiView>

            {/* XP 보너스 안내 */}
            <Text style={[styles.bonusHint, { color: COLORS.primary }]}>
              🎁 연속 학습 보너스 +5 XP
            </Text>

            {/* 오늘은 여기까지 (보조 버튼) */}
            <Pressable style={styles.secondaryButton} onPress={onGoHome}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? '#8E8E93' : COLORS.textSecondary },
                ]}
              >
                오늘은 여기까지
              </Text>
            </Pressable>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SIZES.spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md + 4,
    paddingHorizontal: SIZES.spacing.xl,
    borderRadius: SIZES.borderRadius.lg,
    width: '100%',
    gap: SIZES.spacing.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bonusHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  secondaryButton: {
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});

export default SessionCompleteModal;
