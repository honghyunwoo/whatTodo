import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  height = 8,
  color = COLORS.primary,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color, height }]} />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {current}/{total} ({percentage}%)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fill: {
    borderRadius: SIZES.borderRadius.full,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
    textAlign: 'right',
  },
  track: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
    width: '100%',
  },
});
