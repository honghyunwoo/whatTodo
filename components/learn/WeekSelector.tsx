import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { WEEK_IDS } from '@/store/learnStore';

interface WeekSelectorProps {
  selectedWeek: string;
  onSelectWeek: (weekId: string) => void;
  weekProgress?: Record<string, number>;
}

export function WeekSelector({ selectedWeek, onSelectWeek, weekProgress = {} }: WeekSelectorProps) {
  const renderWeekItem = useCallback(
    (weekId: string, index: number) => {
      const isSelected = weekId === selectedWeek;
      const progress = weekProgress[weekId] || 0;
      const isCompleted = progress >= 100;

      return (
        <Pressable
          key={weekId}
          style={({ pressed }) => [
            styles.weekItem,
            isSelected && styles.selectedWeekItem,
            isCompleted && !isSelected && styles.completedWeekItem,
            pressed && styles.pressed,
          ]}
          onPress={() => onSelectWeek(weekId)}
        >
          <Text style={[
            styles.weekNumber, 
            isSelected && styles.selectedWeekNumber,
            isCompleted && !isSelected && styles.completedWeekNumber,
          ]}>
            {index + 1}주차
          </Text>
          
          {isCompleted ? (
            <View style={[styles.statusIcon, isSelected && styles.selectedStatusIcon]}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          ) : progress > 0 ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={[styles.progressText, isSelected && styles.selectedProgressText]}>
                {progress}%
              </Text>
            </View>
          ) : (
            <Text style={[styles.notStarted, isSelected && styles.selectedNotStarted]}>
              시작 전
            </Text>
          )}
        </Pressable>
      );
    },
    [selectedWeek, weekProgress, onSelectWeek]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {WEEK_IDS.map(renderWeekItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkIcon: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  completedWeekItem: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success,
  },
  completedWeekNumber: {
    color: COLORS.success,
  },
  notStarted: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: SIZES.spacing.xs,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    height: '100%',
  },
  progressBarBg: {
    backgroundColor: COLORS.border,
    borderRadius: 2,
    height: 4,
    marginBottom: 2,
    overflow: 'hidden',
    width: 50,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.xs,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  scrollContent: {
    paddingVertical: SIZES.spacing.sm,
  },
  selectedNotStarted: {
    color: COLORS.surface + 'CC',
  },
  selectedProgressText: {
    color: COLORS.surface + 'CC',
  },
  selectedStatusIcon: {
    backgroundColor: COLORS.surface,
  },
  selectedWeekItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedWeekNumber: {
    color: COLORS.surface,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: SIZES.borderRadius.full,
    height: 20,
    justifyContent: 'center',
    marginTop: SIZES.spacing.xs,
    width: 20,
  },
  weekItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1.5,
    marginRight: SIZES.spacing.sm,
    minWidth: 72,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  weekNumber: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
