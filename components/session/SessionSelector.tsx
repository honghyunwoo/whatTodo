/**
 * SessionSelector Component
 * 30초/1분/5분 학습 세션 선택 UI
 * PRD 핵심 기능: 시간 선택 후 해당 분량만큼 학습
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { SESSION_CONFIG, SessionType } from '@/types/scenario';

interface SessionOption {
  type: SessionType;
  emoji: string;
  description: string;
  gradient: [string, string];
}

const SESSION_OPTIONS: SessionOption[] = [
  {
    type: '30s',
    emoji: '⚡',
    description: '진짜 바쁠 때',
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  {
    type: '1m',
    emoji: '☕',
    description: '잠깐 시간 날 때',
    gradient: ['#4A90D9', '#6B5CE7'],
  },
  {
    type: '5m',
    emoji: '📚',
    description: '제대로 공부할 때',
    gradient: ['#00B894', '#00CEC9'],
  },
];

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
      <View style={styles.header}>
        <Text style={styles.title}>⏱️ 오늘은 얼마나?</Text>
        <Text style={styles.subtitle}>30초만 해도 스트릭 유지!</Text>
      </View>

      <View style={styles.optionsContainer}>
        {SESSION_OPTIONS.map((option) => {
          const config = SESSION_CONFIG[option.type];
          return (
            <Pressable
              key={option.type}
              onPress={() => handlePress(option.type)}
              disabled={disabled}
              accessibilityLabel={`${config.label} 세션 시작`}
              accessibilityRole="button"
              accessibilityHint={`${config.expressionCount}개의 표현을 학습합니다`}
              accessibilityState={{ disabled }}
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.optionCardPressed,
                disabled && styles.optionCardDisabled,
              ]}
            >
              <LinearGradient
                colors={option.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionGradient}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionTime}>{config.label}</Text>
                <Text style={styles.optionCount}>{config.expressionCount}문장</Text>
                <Text style={styles.optionDesc}>{option.description}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
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
  optionCard: {
    borderRadius: 20,
    elevation: 4,
    flex: 1,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  optionCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionGradient: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 20,
  },
  optionTime: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
});
