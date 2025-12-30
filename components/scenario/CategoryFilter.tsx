/**
 * CategoryFilter
 * 시나리오 카테고리 필터 컴포넌트
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { ScenarioCategory, SCENARIO_CATEGORIES } from '@/types/scenario';

// ─────────────────────────────────────
// Props
// ─────────────────────────────────────

interface CategoryFilterProps {
  selectedCategory: ScenarioCategory | null;
  onSelectCategory: (category: ScenarioCategory | null) => void;
  counts?: Record<ScenarioCategory, number>;
}

// ─────────────────────────────────────
// 카테고리 순서
// ─────────────────────────────────────

const CATEGORY_ORDER: (ScenarioCategory | 'all')[] = [
  'all',
  'daily',
  'travel',
  'social',
  'business',
  'emergency',
];

// ─────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  counts,
}: CategoryFilterProps) {
  const { colors, isDark } = useTheme();

  const handleSelect = (category: ScenarioCategory | 'all') => {
    if (category === 'all') {
      onSelectCategory(null);
    } else {
      onSelectCategory(category === selectedCategory ? null : category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORY_ORDER.map((category) => {
          const isAll = category === 'all';
          const isSelected = isAll ? selectedCategory === null : selectedCategory === category;
          const meta = isAll ? null : SCENARIO_CATEGORIES[category];
          const count = isAll
            ? counts
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : undefined
            : counts?.[category];

          return (
            <Pressable
              key={category}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? isAll
                      ? '#007AFF'
                      : meta?.color || '#007AFF'
                    : isDark
                      ? '#2C2C2E'
                      : '#F0F0F0',
                },
                pressed && styles.pressed,
              ]}
              onPress={() => handleSelect(category)}
            >
              {!isAll && meta && (
                <Ionicons
                  name={meta.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={styles.chipIcon}
                />
              )}
              {isAll && (
                <Ionicons
                  name="apps"
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {isAll ? '전체' : meta?.labelKo}
              </Text>
              {count !== undefined && count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.3)'
                        : isDark
                          ? '#3C3C3E'
                          : '#E0E0E0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.full,
    gap: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.full,
    marginLeft: 2,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default CategoryFilter;
