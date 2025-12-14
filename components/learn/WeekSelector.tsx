import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { WEEK_IDS } from '@/store/learnStore';

interface WeekSelectorProps {
  selectedWeek: string;
  onSelectWeek: (weekId: string) => void;
  weekProgress?: Record<string, number>; // weekId -> completion %
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
          style={[styles.weekItem, isSelected && styles.selectedWeekItem]}
          onPress={() => onSelectWeek(weekId)}
        >
          <Text style={[styles.weekNumber, isSelected && styles.selectedWeekNumber]}>
            Week {index + 1}
          </Text>
          {isCompleted ? (
            <Text style={styles.completedIndicator}>완료</Text>
          ) : progress > 0 ? (
            <View style={styles.progressDots}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < Math.round((progress / 100) * 6) && styles.filledDot,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </Pressable>
      );
    },
    [selectedWeek, weekProgress, onSelectWeek]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {WEEK_IDS.map(renderWeekItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  completedIndicator: {
    color: COLORS.success,
    fontSize: SIZES.fontSize.xs,
    marginTop: SIZES.spacing.xs,
  },
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
  },
  dot: {
    backgroundColor: COLORS.border,
    borderRadius: 3,
    height: 6,
    marginHorizontal: 1,
    width: 6,
  },
  filledDot: {
    backgroundColor: COLORS.primary,
  },
  progressDots: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.md,
  },
  selectedWeekItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedWeekNumber: {
    color: COLORS.surface,
  },
  weekItem: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    marginRight: SIZES.spacing.sm,
    minWidth: 80,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  weekNumber: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
