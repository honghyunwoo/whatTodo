/**
 * Session Result Page
 * 세션 완료 후 결과 화면
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────

export default function SessionResultScreen() {
  const router = useRouter();
  const { score, correct, total, stars } = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    stars: string;
  }>();
  const { colors, isDark } = useTheme();

  const scoreNum = parseInt(score || '0', 10);
  const correctNum = parseInt(correct || '0', 10);
  const totalNum = parseInt(total || '0', 10);
  const starsNum = parseInt(stars || '0', 10);

  // 점수에 따른 메시지와 색상
  const { message, emoji, gradient } = useMemo(() => {
    if (scoreNum >= 90) {
      return {
        message: '완벽해요!',
        emoji: '🎉',
        gradient: ['#4CAF50', '#81C784'] as [string, string],
      };
    } else if (scoreNum >= 70) {
      return {
        message: '잘했어요!',
        emoji: '👏',
        gradient: ['#2196F3', '#64B5F6'] as [string, string],
      };
    } else if (scoreNum >= 50) {
      return {
        message: '좋아요!',
        emoji: '👍',
        gradient: ['#FF9800', '#FFB74D'] as [string, string],
      };
    } else {
      return {
        message: '다음엔 더 잘할 수 있어요!',
        emoji: '💪',
        gradient: ['#9C27B0', '#BA68C8'] as [string, string],
      };
    }
  }, [scoreNum]);

  const handleGoHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleTryAgain = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        {/* 이모지 */}
        <Text style={styles.emoji}>{emoji}</Text>

        {/* 메시지 */}
        <Text style={styles.message}>{message}</Text>

        {/* 점수 */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{scoreNum}</Text>
          <Text style={styles.scoreLabel}>점</Text>
        </View>

        {/* 상세 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{correctNum}</Text>
            <Text style={styles.statLabel}>정답</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{totalNum}</Text>
            <Text style={styles.statLabel}>문제</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.starEmoji}>⭐</Text>
            <Text style={styles.statValue}>+{starsNum}</Text>
            <Text style={styles.statLabel}>별 획득</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 격려 메시지 */}
      <View style={styles.encouragementContainer}>
        <View
          style={[
            styles.encouragementCard,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            !isDark && SHADOWS.md,
          ]}
        >
          <Ionicons name="bulb" size={24} color="#FF9800" />
          <View style={styles.encouragementContent}>
            <Text style={[styles.encouragementTitle, { color: colors.text }]}>학습 팁</Text>
            <Text style={[styles.encouragementText, { color: colors.textSecondary }]}>
              {scoreNum >= 70
                ? '꾸준히 하면 더 빨리 늘어요! 내일도 도전해보세요.'
                : '틀린 표현을 다시 복습하면 기억에 오래 남아요!'}
            </Text>
          </View>
        </View>
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: isDark ? '#3C3C3E' : '#E5E5E7' },
          ]}
          onPress={handleTryAgain}
        >
          <Ionicons name="refresh" size={20} color={colors.text} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>다시 하기</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.primaryButton, { backgroundColor: gradient[0] }]}
          onPress={handleGoHome}
        >
          <Ionicons name="home" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>홈으로</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroGradient: {
    paddingVertical: SIZES.spacing.xl * 2,
    paddingHorizontal: SIZES.spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.borderRadius.xl * 2,
    borderBottomRightRadius: SIZES.borderRadius.xl * 2,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  message: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SIZES.spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SIZES.spacing.xl,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SIZES.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: SIZES.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  starEmoji: {
    fontSize: 24,
  },
  encouragementContainer: {
    flex: 1,
    padding: SIZES.spacing.lg,
    justifyContent: 'center',
  },
  encouragementCard: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    gap: SIZES.spacing.md,
    alignItems: 'flex-start',
  },
  encouragementContent: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryButton: {
    ...SHADOWS.md,
  },
  secondaryButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  primaryButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
