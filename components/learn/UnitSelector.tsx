/**
 * 유닛 선택 컴포넌트
 * 레벨 내 유닛 목록을 표시하고 선택할 수 있습니다.
 */

import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import type { UnitCardData } from '@/types/lesson';

interface UnitSelectorProps {
  units: UnitCardData[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
}

export function UnitSelector({ units, selectedUnitId, onSelectUnit }: UnitSelectorProps) {
  const renderUnitItem = useCallback(
    (unit: UnitCardData) => {
      const isSelected = unit.id === selectedUnitId;
      const isCompleted = unit.status === 'completed';
      const isLocked = unit.status === 'locked';

      return (
        <Pressable
          key={unit.id}
          style={({ pressed }) => [
            styles.unitItem,
            isSelected && styles.selectedUnitItem,
            isCompleted && !isSelected && styles.completedUnitItem,
            isLocked && styles.lockedUnitItem,
            pressed && !isLocked && styles.pressed,
          ]}
          onPress={() => !isLocked && onSelectUnit(unit.id)}
          disabled={isLocked}
        >
          <View style={styles.unitHeader}>
            <Text style={styles.unitIcon}>{unit.icon}</Text>
            <Text
              style={[
                styles.unitNumber,
                isSelected && styles.selectedUnitNumber,
                isCompleted && !isSelected && styles.completedUnitNumber,
                isLocked && styles.lockedText,
              ]}
            >
              Unit {unit.unitNumber}
            </Text>
          </View>

          <Text
            style={[
              styles.unitTitle,
              isSelected && styles.selectedUnitTitle,
              isLocked && styles.lockedText,
            ]}
            numberOfLines={1}
          >
            {unit.title}
          </Text>

          {isCompleted ? (
            <View style={[styles.statusIcon, isSelected && styles.selectedStatusIcon]}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          ) : isLocked ? (
            <Text style={styles.lockedIcon}>🔒</Text>
          ) : unit.progress > 0 ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${unit.progress}%` },
                    isSelected && styles.selectedProgressBar,
                  ]}
                />
              </View>
              <Text style={[styles.progressText, isSelected && styles.selectedProgressText]}>
                {unit.completedLessons}/{unit.totalLessons}
              </Text>
            </View>
          ) : (
            <Text style={[styles.notStarted, isSelected && styles.selectedNotStarted]}>
              시작하기
            </Text>
          )}
        </Pressable>
      );
    },
    [selectedUnitId, onSelectUnit]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {units.map(renderUnitItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkIcon: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  completedUnitItem: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success,
  },
  completedUnitNumber: {
    color: COLORS.success,
  },
  lockedIcon: {
    fontSize: 16,
    marginTop: SIZES.spacing.xs,
  },
  lockedText: {
    color: COLORS.textSecondary,
    opacity: 0.6,
  },
  lockedUnitItem: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  notStarted: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
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
    width: 60,
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
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  selectedNotStarted: {
    color: COLORS.surface + 'CC',
  },
  selectedProgressBar: {
    backgroundColor: COLORS.surface,
  },
  selectedProgressText: {
    color: COLORS.surface + 'CC',
  },
  selectedStatusIcon: {
    backgroundColor: COLORS.surface,
  },
  selectedUnitItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedUnitNumber: {
    color: COLORS.surface,
  },
  selectedUnitTitle: {
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
  unitHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
  unitIcon: {
    fontSize: 16,
  },
  unitItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1.5,
    marginRight: SIZES.spacing.sm,
    minWidth: 100,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  unitNumber: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  unitTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginTop: SIZES.spacing.xs,
  },
});
