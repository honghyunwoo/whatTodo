import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { ActivityType } from '@/types/activity';
import { getActivityIcon, getActivityLabel } from '@/utils/activityLoader';

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
  const icon = ACTIVITY_ICONS[type] || getActivityIcon(type);
  const label = title || ACTIVITY_LABELS_KR[type] || getActivityLabel(type);
  const colors = COLORS.activity[type];

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
      ]}
    >
      <View style={[
        styles.card,
        { backgroundColor: completed ? colors.light : COLORS.surface },
        completed && { borderColor: colors.main, borderWidth: 2 },
      ]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.light }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        
        <Text style={[styles.label, completed && { color: colors.main }]}>{label}</Text>
        
        {completed ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.main }]}>
            <Text style={styles.statusText}>완료</Text>
          </View>
        ) : (
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: colors.main,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.startText, { color: colors.main }]}>
              {progress > 0 ? `${progress}%` : '시작하기'}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const ActivityCard = memo(ActivityCardComponent);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.xl,
    elevation: 2,
    padding: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 28,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: SIZES.spacing.sm,
    width: 56,
  },
  label: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  pressable: {
    flex: 1,
    maxWidth: '48%',
    minWidth: 140,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  progressBar: {
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressBarContainer: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 6,
    marginBottom: SIZES.spacing.xs,
    overflow: 'hidden',
    width: '100%',
  },
  progressSection: {
    alignItems: 'center',
    width: '100%',
  },
  startText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: SIZES.borderRadius.full,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '700',
  },
});
