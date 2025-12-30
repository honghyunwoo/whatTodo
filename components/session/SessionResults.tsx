/**
 * SessionResults Component
 * 세션 완료 후 결과 화면
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useSessionStore } from '@/store/sessionStore';
import { SESSION_CONFIG } from '@/types/scenario';

// Pure functions moved outside component for better performance
const getScoreEmoji = (score: number): string => {
  if (score >= 90) return '🎉';
  if (score >= 70) return '👍';
  if (score >= 50) return '💪';
  return '📚';
};

const getScoreMessage = (score: number): string => {
  if (score >= 90) return '완벽해요!';
  if (score >= 70) return '잘했어요!';
  if (score >= 50) return '좋은 시작이에요!';
  return '다시 도전해봐요!';
};

const getGradientColors = (score: number): [string, string] => {
  if (score >= 70) return ['#00B894', '#00CEC9'];
  if (score >= 50) return ['#4A90D9', '#6B5CE7'];
  return ['#FF6B6B', '#FF8E53'];
};

interface SessionResultsProps {
  onClose: () => void;
  onRetry: () => void;
}

function SessionResultsComponent({ onClose, onRetry }: SessionResultsProps) {
  const getLastSession = useSessionStore((state) => state.getLastSession);
  const getTodaySessions = useSessionStore((state) => state.getTodaySessions);
  const todayStreak = useSessionStore((state) => state.todayStreak);

  const lastSession = useMemo(() => getLastSession(), [getLastSession]);
  const todaySessions = useMemo(() => getTodaySessions(), [getTodaySessions]);

  if (!lastSession) {
    return null;
  }

  // Phase 3: Type safety - fallback to default config
  const config = SESSION_CONFIG[lastSession.type] ?? SESSION_CONFIG['30s'];
  const scorePercent = lastSession.score;
  const todayTotalTime = todaySessions.reduce((sum, s) => {
    const c = SESSION_CONFIG[s.type];
    return sum + c.duration;
  }, 0);
  const todayMinutes = Math.floor(todayTotalTime / 60);
  const todaySeconds = todayTotalTime % 60;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Result Card */}
        <LinearGradient
          colors={getGradientColors(scorePercent)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultCard}
        >
          <Text style={styles.resultEmoji}>{getScoreEmoji(scorePercent)}</Text>
          <Text style={styles.resultMessage}>{getScoreMessage(scorePercent)}</Text>
          <Text style={styles.resultScore}>{scorePercent}점</Text>
          <Text style={styles.resultDetail}>
            {lastSession.correctCount} / {lastSession.totalCount} 정답
          </Text>
        </LinearGradient>

        {/* Session Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{config.label}</Text>
            <Text style={styles.statLabel}>세션 시간</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{todayStreak}</Text>
            <Text style={styles.statLabel}>오늘 세션</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>
              {todayMinutes > 0 ? `${todayMinutes}분` : `${todaySeconds}초`}
            </Text>
            <Text style={styles.statLabel}>오늘 총</Text>
          </View>
        </View>

        {/* Streak Celebration */}
        {todayStreak >= 3 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>오늘 {todayStreak}번째 세션!</Text>
              <Text style={styles.streakSubtitle}>꾸준함이 실력이 됩니다</Text>
            </View>
          </View>
        )}

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            {scorePercent >= 70
              ? '30초도 훌륭한 학습이에요! 내일도 만나요 👋'
              : '모르는 건 당연해요. 복습하면 더 잘 기억날 거예요 💪'}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel="한 번 더 학습하기"
          accessibilityRole="button"
          accessibilityHint="같은 유형의 세션을 다시 시작합니다"
        >
          <Text style={styles.retryButtonText}>한 번 더!</Text>
        </Pressable>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="학습 완료"
          accessibilityRole="button"
          accessibilityHint="결과 화면을 닫고 홈으로 돌아갑니다"
        >
          <Text style={styles.closeButtonText}>완료</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SessionResults = memo(SessionResultsComponent);
SessionResults.displayName = 'SessionResults';

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flex: 1,
    paddingVertical: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  encouragementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  encouragementText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  resultCard: {
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.xxl,
  },
  resultDetail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  resultMessage: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultScore: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    paddingVertical: 16,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xl,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SIZES.spacing.md,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.md,
  },
  streakBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  streakTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
