/**
 * ScenarioCard
 * 시나리오 선택 카드 컴포넌트
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Scenario,
  ScenarioProgress,
  SCENARIO_CATEGORIES,
  DIFFICULTY_LABELS,
} from '@/types/scenario';

// ─────────────────────────────────────
// Props
// ─────────────────────────────────────

interface ScenarioCardProps {
  scenario: Scenario;
  progress?: ScenarioProgress;
  onPress: (scenario: Scenario) => void;
  compact?: boolean;
}

// ─────────────────────────────────────
// 카테고리별 그라디언트 색상
// ─────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  travel: ['#4CAF50', '#81C784'],
  business: ['#2196F3', '#64B5F6'],
  daily: ['#FF9800', '#FFB74D'],
  social: ['#E91E63', '#F06292'],
  emergency: ['#F44336', '#E57373'],
};

// ─────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────

export function ScenarioCard({ scenario, progress, onPress, compact = false }: ScenarioCardProps) {
  const { colors, isDark } = useTheme();

  const categoryMeta = SCENARIO_CATEGORIES[scenario.category];
  const difficultyMeta = DIFFICULTY_LABELS[scenario.difficulty];
  const gradientColors = CATEGORY_GRADIENTS[scenario.category] || ['#9E9E9E', '#BDBDBD'];

  const progressPercent = progress?.progress || 0;
  const isCompleted = progress?.isCompleted || false;

  const handlePress = () => {
    onPress(scenario);
  };

  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
          !isDark && SHADOWS.sm,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
      >
        <LinearGradient colors={gradientColors} style={styles.compactIconContainer}>
          <Ionicons
            name={categoryMeta.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color="#FFFFFF"
          />
        </LinearGradient>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
            {scenario.nameKo}
          </Text>
          <Text style={[styles.compactSubtitle, { color: colors.textSecondary }]}>
            {scenario.expressions.length}개 표현
          </Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.md,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      {/* 상단: 아이콘 + 카테고리 */}
      <View style={styles.header}>
        <LinearGradient colors={gradientColors} style={styles.iconContainer}>
          <Ionicons
            name={categoryMeta.icon as keyof typeof Ionicons.glyphMap}
            size={28}
            color="#FFFFFF"
          />
        </LinearGradient>
        <View style={styles.badges}>
          <View style={[styles.levelBadge, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}>
            <Text style={[styles.levelText, { color: colors.text }]}>{scenario.level}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyMeta.color + '20' }]}>
            <Text style={[styles.difficultyText, { color: difficultyMeta.color }]}>
              {difficultyMeta.labelKo}
            </Text>
          </View>
        </View>
      </View>

      {/* 중간: 제목 + 설명 */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {scenario.nameKo}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {scenario.name}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {scenario.descriptionKo}
        </Text>
      </View>

      {/* 하단: 진행률 + 통계 */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {scenario.expressions.length}개 표현
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              ~{scenario.estimatedTime}분
            </Text>
          </View>
        </View>

        {/* 진행률 바 */}
        {progressPercent > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: isCompleted ? '#4CAF50' : gradientColors[0],
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {progressPercent}%
            </Text>
          </View>
        )}

        {/* 완료 배지 */}
        {isCompleted && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.completedText}>완료!</Text>
          </View>
        )}
      </View>

      {/* 액센트 바 */}
      <View style={[styles.accentBar, { backgroundColor: gradientColors[0] }]} />
    </Pressable>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: SIZES.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
  },
  levelText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
  },
  difficultyText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  content: {
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.xs,
  },
  description: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    gap: SIZES.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: SIZES.fontSize.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: '#4CAF50',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: SIZES.borderRadius.lg,
    borderBottomLeftRadius: SIZES.borderRadius.lg,
  },

  // Compact 스타일
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
    gap: SIZES.spacing.sm,
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: SIZES.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  compactSubtitle: {
    fontSize: SIZES.fontSize.xs,
  },
  completedBadge: {
    marginLeft: SIZES.spacing.xs,
  },
});

export default ScenarioCard;
