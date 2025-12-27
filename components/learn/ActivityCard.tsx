/**
 * ActivityCard Component
 * Redesigned with color accent bar and gradient icon background
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { ActivityType } from '@/types/activity';

interface ActivityCardProps {
  type: ActivityType;
  title?: string;
  progress?: number;
  completed?: boolean;
  onPress?: () => void;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  vocabulary: '📚',
  grammar: '📝',
  listening: '🎧',
  reading: '📖',
  speaking: '🎤',
  writing: '✍️',
};

const ACTIVITY_LABELS_KR: Record<ActivityType, string> = {
  vocabulary: '단어',
  grammar: '문법',
  listening: '듣기',
  reading: '읽기',
  speaking: '말하기',
  writing: '쓰기',
};

function ActivityCardComponent({
  type,
  title,
  progress = 0,
  completed = false,
  onPress,
}: ActivityCardProps) {
  const icon = ACTIVITY_ICONS[type] ?? '📖';
  const label = title ?? ACTIVITY_LABELS_KR[type] ?? type;
  const colors = COLORS.activity[type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <View
        style={[styles.card, { borderLeftColor: colors.main }, completed && styles.cardCompleted]}
      >
        {/* Gradient Icon Container */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Text style={styles.icon}>{icon}</Text>
        </LinearGradient>

        <Text style={[styles.label, completed && { color: colors.main }]}>{label}</Text>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(completed ? 100 : progress, 100)}%`,
                  backgroundColor: colors.main,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.main }]}>
            {completed ? '✓ 완료' : progress > 0 ? `${progress}%` : '시작'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const ActivityCard = memo(ActivityCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRadius: 16,
    elevation: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardCompleted: {
    backgroundColor: '#F8FFF8',
  },
  icon: {
    fontSize: 28,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  label: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pressable: {
    flex: 1,
    maxWidth: '48%',
    minWidth: 140,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  progressBar: {
    borderRadius: 3,
    height: '100%',
  },
  progressBarContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  progressSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },
});
