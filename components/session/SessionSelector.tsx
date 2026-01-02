/**
 * SessionSelector Component
 * 30초/1분/5분 학습 세션 선택 UI
 * PRD 핵심 기능: 시간 선택 후 해당 분량만큼 학습
 *
 * Enhanced with:
 * - Reanimated animations for card entry
 * - Haptic feedback on press
 * - Improved press interactions
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { SESSION_CONFIG, SessionType } from '@/types/scenario';
import { feedbackService } from '@/services/feedbackService';

interface SessionOption {
  type: SessionType;
  emoji: string;
  description: string;
  gradient: readonly [string, string];
  iconBg: string;
}

const SESSION_OPTIONS: SessionOption[] = [
  {
    type: '30s',
    emoji: '⚡',
    description: '진짜 바쁠 때',
    gradient: ['#FF6B6B', '#FF8E53'] as const,
    iconBg: 'rgba(255, 255, 255, 0.25)',
  },
  {
    type: '1m',
    emoji: '☕',
    description: '잠깐 시간 날 때',
    gradient: ['#4A90D9', '#6B5CE7'] as const,
    iconBg: 'rgba(255, 255, 255, 0.25)',
  },
  {
    type: '5m',
    emoji: '📚',
    description: '제대로 공부할 때',
    gradient: ['#00B894', '#00CEC9'] as const,
    iconBg: 'rgba(255, 255, 255, 0.25)',
  },
];

interface SessionCardProps {
  option: SessionOption;
  index: number;
  onPress: () => void;
  disabled: boolean;
}

const SessionCard = memo(function SessionCard({
  option,
  index,
  onPress,
  disabled,
}: SessionCardProps) {
  const scale = useSharedValue(1);
  const config = SESSION_CONFIG[option.type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    feedbackService.tap();
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      style={[styles.optionCard, animatedStyle]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={`${config.label} 세션 시작`}
        accessibilityRole="button"
        accessibilityHint={`${config.expressionCount}개의 표현을 학습합니다`}
        accessibilityState={{ disabled }}
        style={[styles.pressable, disabled && styles.optionCardDisabled]}
      >
        <LinearGradient
          colors={option.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optionGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {/* Emoji with background */}
          <View style={[styles.emojiContainer, { backgroundColor: option.iconBg }]}>
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
          </View>

          {/* Time label */}
          <Text style={styles.optionTime}>{config.label}</Text>

          {/* Expression count badge */}
          <View style={styles.countBadge}>
            <Text style={styles.optionCount}>{config.expressionCount}문장</Text>
          </View>

          {/* Description */}
          <Text style={styles.optionDesc}>{option.description}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

interface SessionSelectorProps {
  onSelectSession: (type: SessionType) => void;
  disabled?: boolean;
}

function SessionSelectorComponent({ onSelectSession, disabled = false }: SessionSelectorProps) {
  const handlePress = useCallback(
    (type: SessionType) => {
      if (!disabled) {
        onSelectSession(type);
      }
    },
    [onSelectSession, disabled]
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.delay(0).duration(400)} style={styles.header}>
        <Text style={styles.title}>⏱️ 오늘은 얼마나?</Text>
        <Text style={styles.subtitle}>30초만 해도 스트릭 유지!</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {SESSION_OPTIONS.map((option, index) => (
          <SessionCard
            key={option.type}
            option={option}
            index={index}
            onPress={() => handlePress(option.type)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

export const SessionSelector = memo(SessionSelectorComponent);
SessionSelector.displayName = 'SessionSelector';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    borderRadius: 24,
    elevation: 6,
    flex: 1,
    marginHorizontal: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  pressable: {
    flex: 1,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionGradient: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -20,
    right: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -15,
    left: -15,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTime: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  optionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  optionDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
});
