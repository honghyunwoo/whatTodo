import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { SIZES } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { SubTaskProgress as SubTaskProgressType } from '@/types/task';

interface SubTaskProgressProps {
  progress: SubTaskProgressType;
  compact?: boolean;
}

function SubTaskProgressComponent({ progress, compact }: SubTaskProgressProps) {
  const { isDark } = useTheme();

  const progressColor = useMemo(() => {
    if (progress.percentage === 100) return '#34C759'; // Green
    if (progress.percentage >= 75) return '#10B981'; // Teal
    if (progress.percentage >= 50) return '#F59E0B'; // Amber
    if (progress.percentage >= 25) return '#FF9500'; // Orange
    return isDark ? '#8E8E93' : '#A0A0A0'; // Gray
  }, [progress.percentage, isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress.percentage}%`, { duration: 300 }),
    backgroundColor: withTiming(progressColor, { duration: 300 }),
  }));

  if (progress.total === 0) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="checkbox-outline" size={12} color={progressColor} />
        <Text style={[styles.compactText, { color: progressColor }]}>
          {progress.completed}/{progress.total}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Ionicons name="list-outline" size={14} color={isDark ? '#8E8E93' : '#6B6B6B'} />
          <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>세부 항목</Text>
        </View>
        <Text style={[styles.count, { color: progressColor }]}>
          {progress.completed}/{progress.total}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5E7' }]}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>

      {/* Percentage */}
      {progress.percentage === 100 && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
          <Text style={styles.completedText}>모든 항목 완료!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...TYPOGRAPHY.caption,
  },
  count: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.spacing.xs,
  },
  completedText: {
    ...TYPOGRAPHY.caption,
    color: '#34C759',
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
});

export const SubTaskProgress = memo(SubTaskProgressComponent);
