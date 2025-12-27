import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, Easing, ZoomIn } from 'react-native-reanimated';

import { useRewardStore } from '@/store/rewardStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StreakRingProps {
  size?: number;
  strokeWidth?: number;
  maxStreak?: number;
}

// Color progression based on streak
const getStreakColor = (streak: number): { start: string; end: string } => {
  if (streak >= 30) return { start: '#FF6B6B', end: '#FFE66D' }; // Fire
  if (streak >= 14) return { start: '#FF9F43', end: '#FECA57' }; // Orange
  if (streak >= 7) return { start: '#5F27CD', end: '#A55EEA' }; // Purple
  if (streak >= 3) return { start: '#00D2D3', end: '#54A0FF' }; // Blue
  return { start: '#A0A0A0', end: '#C0C0C0' }; // Gray
};

export function StreakRing({ size = 100, strokeWidth = 10, maxStreak = 30 }: StreakRingProps) {
  const { streak, longestStreak } = useRewardStore();
  const { isDark } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(streak / maxStreak, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const colors = getStreakColor(streak);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(strokeDashoffset, {
      duration: 800,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }),
  }));

  return (
    <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <LinearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.start} />
              <Stop offset="100%" stopColor={colors.end} />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#3A3A3C' : '#E5E5EA'}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#streakGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text
            style={[
              styles.streakNumber,
              TYPOGRAPHY.numberLarge,
              { color: isDark ? '#FFFFFF' : '#000000' },
            ]}
          >
            {streak}
          </Text>
          <Text
            style={[
              styles.streakLabel,
              TYPOGRAPHY.caption,
              { color: isDark ? '#8E8E93' : '#6B6B6B' },
            ]}
          >
            days
          </Text>
        </View>
      </View>

      {/* Longest streak indicator */}
      {longestStreak > 0 && longestStreak > streak && (
        <View style={styles.longestContainer}>
          <Text
            style={[
              styles.longestText,
              TYPOGRAPHY.caption,
              { color: isDark ? '#8E8E93' : '#6B6B6B' },
            ]}
          >
            Best: {longestStreak}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// Compact streak indicator for headers
export function StreakBadge() {
  const { streak } = useRewardStore();
  const { isDark } = useTheme();
  const colors = getStreakColor(streak);

  if (streak === 0) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)' },
      ]}
    >
      <View style={[styles.badgeIndicator, { backgroundColor: colors.start }]} />
      <Text style={[styles.badgeText, { color: isDark ? '#FFFFFF' : '#333333' }]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  streakLabel: {
    marginTop: -4,
  },
  longestContainer: {
    marginTop: 8,
  },
  longestText: {},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    ...TYPOGRAPHY.label,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default StreakRing;
