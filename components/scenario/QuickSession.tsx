/**
 * QuickSession
 * 빠른 세션 시작 컴포넌트 (30초/1분/5분)
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { SessionType, SESSION_CONFIG } from '@/types/scenario';

// ─────────────────────────────────────
// Props
// ─────────────────────────────────────

interface QuickSessionProps {
  onSelectSession: (type: SessionType) => void;
  todaySessionCount?: number;
  currentStreak?: number;
}

// ─────────────────────────────────────
// 세션 타입별 설정
// ─────────────────────────────────────

const SESSION_STYLES: Record<
  SessionType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    gradient: [string, string];
    description: string;
  }
> = {
  '30s': {
    icon: 'flash',
    gradient: ['#FF9500', '#FFB74D'],
    description: '빠른 복습',
  },
  '1m': {
    icon: 'timer',
    gradient: ['#007AFF', '#64B5F6'],
    description: '균형 잡힌 학습',
  },
  '5m': {
    icon: 'fitness',
    gradient: ['#5856D6', '#9575CD'],
    description: '집중 학습',
  },
};

// ─────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────

export function QuickSession({
  onSelectSession,
  todaySessionCount = 0,
  currentStreak = 0,
}: QuickSessionProps) {
  const { colors, isDark } = useTheme();

  const sessionTypes: SessionType[] = ['30s', '1m', '5m'];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>오늘의 학습</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            시간을 선택하고 바로 시작하세요
          </Text>
        </View>
        {currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
          </View>
        )}
      </View>

      {/* 세션 버튼 그리드 */}
      <View style={styles.sessionGrid}>
        {sessionTypes.map((type) => {
          const config = SESSION_CONFIG[type];
          const style = SESSION_STYLES[type];

          return (
            <Pressable
              key={type}
              style={({ pressed }) => [styles.sessionButton, pressed && styles.pressed]}
              onPress={() => onSelectSession(type)}
            >
              <LinearGradient
                colors={style.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sessionGradient}
              >
                <Ionicons name={style.icon} size={32} color="#FFFFFF" />
                <Text style={styles.sessionTime}>{config.label}</Text>
                <Text style={styles.sessionDescription}>{style.description}</Text>
                <View style={styles.sessionMeta}>
                  <Ionicons name="chatbubble-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.sessionMetaText}>{config.expressionCount}개 표현</Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      {/* 오늘 세션 통계 */}
      {todaySessionCount > 0 && (
        <View style={[styles.todayStats, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={[styles.todayStatsText, { color: colors.text }]}>
            오늘 <Text style={styles.highlight}>{todaySessionCount}개</Text> 세션 완료
          </Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakNumber: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
    color: '#FF6B35',
  },
  sessionGrid: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  sessionButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sessionGradient: {
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  sessionTime: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: SIZES.spacing.sm,
  },
  sessionDescription: {
    fontSize: SIZES.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.full,
  },
  sessionMetaText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    ...SHADOWS.sm,
  },
  todayStatsText: {
    fontSize: SIZES.fontSize.sm,
  },
  highlight: {
    fontWeight: '700',
    color: '#4CAF50',
  },
});

export default QuickSession;
