import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { ActivityType } from '@/types/activity';
import { getActivityIcon, getActivityLabel } from '@/utils/activityLoader';

interface ActivityCardProps {
  type: ActivityType;
  title?: string;
  progress?: number; // 0-100
  completed?: boolean;
  onPress?: () => void;
}

function ActivityCardComponent({
  type,
  title,
  progress = 0,
  completed = false,
  onPress,
}: ActivityCardProps) {
  const icon = getActivityIcon(type);
  const label = title || getActivityLabel(type);

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card style={[styles.card, completed && styles.completedCard]}>
        <Card.Content style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
          {completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>완료</Text>
            </View>
          ) : progress > 0 ? (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          ) : (
            <Text style={styles.startText}>시작하기</Text>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

export const ActivityCard = memo(ActivityCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: SIZES.borderRadius.full,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  completedCard: {
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  completedText: {
    color: COLORS.success,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: SIZES.spacing.xs,
  },
  label: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  pressable: {
    flex: 1,
    margin: SIZES.spacing.xs,
    maxWidth: '50%',
    minWidth: 100,
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressContainer: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 4,
    overflow: 'hidden',
    width: 60,
  },
  startText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.xs,
  },
});
