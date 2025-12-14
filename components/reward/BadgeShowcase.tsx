/**
 * Badge Showcase Component
 * Displays earned and locked badges in a grid layout
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { COLORS, withAlpha } from '@/constants/colors';
import { SHADOWS, SIZES } from '@/constants/sizes';
import { useRewardStore } from '@/store/rewardStore';
import { Badge, BadgeCategory, BADGES, getBadgesByCategory } from '@/types/badges';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface BadgeShowcaseProps {
  onClose?: () => void;
}

type FilterCategory = 'all' | BadgeCategory;

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const CATEGORY_CONFIG: Record<FilterCategory, { label: string; icon: string }> = {
  all: { label: '전체', icon: 'view-grid' },
  todo: { label: '할일', icon: 'checkbox-marked-outline' },
  game: { label: '게임', icon: 'gamepad-variant' },
  learning: { label: '학습', icon: 'school' },
  special: { label: '특별', icon: 'star' },
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function BadgeShowcase({ onClose }: BadgeShowcaseProps) {
  const unlockedBadges = useRewardStore((state) => state.unlockedBadges);
  const hasBadge = useRewardStore((state) => state.hasBadge);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // ─────────────────────────────────────
  // Badge Data
  // ─────────────────────────────────────

  const allBadges = useMemo(() => Object.values(BADGES), []);

  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') {
      return allBadges;
    }
    return getBadgesByCategory(selectedCategory);
  }, [allBadges, selectedCategory]);

  const badgeStats = useMemo(() => {
    const total = allBadges.length;
    const unlocked = unlockedBadges.length;
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }, [allBadges, unlockedBadges]);

  const categoryStats = useMemo(() => {
    const stats: Record<FilterCategory, { total: number; unlocked: number }> = {
      all: { total: 0, unlocked: 0 },
      todo: { total: 0, unlocked: 0 },
      game: { total: 0, unlocked: 0 },
      learning: { total: 0, unlocked: 0 },
      special: { total: 0, unlocked: 0 },
    };

    allBadges.forEach((badge) => {
      stats[badge.category].total++;
      stats.all.total++;
      if (hasBadge(badge.id)) {
        stats[badge.category].unlocked++;
        stats.all.unlocked++;
      }
    });

    return stats;
  }, [allBadges, hasBadge]);

  // ─────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────

  const handleBadgePress = useCallback((badge: Badge) => {
    setSelectedBadge(badge);
  }, []);

  const closeBadgeModal = useCallback(() => {
    setSelectedBadge(null);
  }, []);

  // ─────────────────────────────────────
  // Render Badge Item
  // ─────────────────────────────────────

  const renderBadgeItem = useCallback((badge: Badge) => {
    const isUnlocked = hasBadge(badge.id);

    return (
      <TouchableOpacity
        key={badge.id}
        style={[
          styles.badgeItem,
          !isUnlocked && styles.badgeItemLocked,
        ]}
        onPress={() => handleBadgePress(badge)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.badgeIconContainer,
            { backgroundColor: isUnlocked ? withAlpha(badge.color, 0.15) : COLORS.border },
          ]}
        >
          <MaterialCommunityIcons
            name={badge.icon as any}
            size={32}
            color={isUnlocked ? badge.color : COLORS.textSecondary}
          />
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <MaterialCommunityIcons name="lock" size={14} color={COLORS.textSecondary} />
            </View>
          )}
        </View>
        <Text
          style={[
            styles.badgeName,
            !isUnlocked && styles.badgeNameLocked,
          ]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>
      </TouchableOpacity>
    );
  }, [hasBadge, handleBadgePress]);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>배지</Text>
          <Text style={styles.headerSubtitle}>
            {badgeStats.unlocked} / {badgeStats.total} 획득
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <MaterialCommunityIcons name="trophy-outline" size={24} color={COLORS.warning} />
          <Text style={styles.progressTitle}>수집 현황</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${badgeStats.percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{badgeStats.percentage}% 완료</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(Object.keys(CATEGORY_CONFIG) as FilterCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const stats = categoryStats[category];
          const isSelected = selectedCategory === category;

          return (
            <Chip
              key={category}
              selected={isSelected}
              onPress={() => setSelectedCategory(category)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              textStyle={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}
              icon={() => (
                <MaterialCommunityIcons
                  name={config.icon as any}
                  size={16}
                  color={isSelected ? '#fff' : COLORS.textSecondary}
                />
              )}
            >
              {config.label} ({stats.unlocked}/{stats.total})
            </Chip>
          );
        })}
      </ScrollView>

      {/* Badge Grid */}
      <ScrollView
        style={styles.badgeList}
        contentContainerStyle={styles.badgeListContent}
      >
        <View style={styles.badgeGrid}>
          {filteredBadges.map(renderBadgeItem)}
        </View>
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={closeBadgeModal}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            {selectedBadge && (
              <Card.Content style={styles.modalContent}>
                <View
                  style={[
                    styles.modalBadgeIcon,
                    {
                      backgroundColor: hasBadge(selectedBadge.id)
                        ? withAlpha(selectedBadge.color, 0.15)
                        : COLORS.border,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={selectedBadge.icon as any}
                    size={48}
                    color={hasBadge(selectedBadge.id) ? selectedBadge.color : COLORS.textSecondary}
                  />
                </View>

                <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                <Text style={styles.modalBadgeDescription}>{selectedBadge.description}</Text>

                <View style={styles.modalStatusContainer}>
                  {hasBadge(selectedBadge.id) ? (
                    <View style={styles.unlockedStatus}>
                      <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
                      <Text style={styles.unlockedText}>획득함</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedStatus}>
                      <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.textSecondary} />
                      <Text style={styles.lockedText}>잠김</Text>
                    </View>
                  )}
                </View>

                <View style={styles.requirementContainer}>
                  <Text style={styles.requirementLabel}>획득 조건</Text>
                  <Text style={styles.requirementText}>
                    {getRequirementText(selectedBadge)}
                  </Text>
                </View>

                <View style={styles.categoryTag}>
                  <MaterialCommunityIcons
                    name={CATEGORY_CONFIG[selectedBadge.category].icon as any}
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.categoryTagText}>
                    {CATEGORY_CONFIG[selectedBadge.category].label}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={closeBadgeModal}
                  style={styles.modalCloseButton}
                >
                  닫기
                </Button>
              </Card.Content>
            )}
          </Card>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function getRequirementText(badge: Badge): string {
  const { type, value } = badge.requirement;

  const requirementTexts: Record<string, string> = {
    tasks_completed: `${value}개 할일 완료`,
    streak_days: `${value}일 연속 학습`,
    total_stars: `${value}개 별 획득`,
    game_score: `${value.toLocaleString()}점 달성`,
    game_2048_reached: `2048 타일 도달`,
    words_learned: `${value}개 단어 학습`,
    login_days: `${value}일 접속`,
    activities_completed: `${value}개 활동 완료`,
    perfect_score: `${value}번 만점`,
    all_skills_daily: `하루에 6개 영역 모두 학습`,
    learning_streak: `${value}일 연속 학습`,
    vocabulary_mastered: `${value}개 어휘 마스터`,
    grammar_mastered: `${value}개 문법 활동 완료`,
    listening_hours: `${value}시간 듣기`,
    speaking_sessions: `${value}회 말하기 연습`,
    writing_submissions: `${value}개 작문 제출`,
    level_reached: `CEFR ${getLevelName(value)} 레벨 도달`,
  };

  return requirementTexts[type] || `${type}: ${value}`;
}

function getLevelName(level: number): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return levels[level - 1] || `Level ${level}`;
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
  },
  closeButton: {
    padding: SIZES.spacing.sm,
  },

  // Progress
  progressCard: {
    margin: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  progressTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: SIZES.radius.full,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: SIZES.radius.full,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },

  // Filter
  filterContainer: {
    maxHeight: 50,
    paddingVertical: SIZES.spacing.sm,
  },
  filterContent: {
    paddingHorizontal: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    marginRight: SIZES.spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  filterChipTextSelected: {
    color: '#fff',
  },

  // Badge Grid
  badgeList: {
    flex: 1,
  },
  badgeListContent: {
    padding: SIZES.spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.sm,
  },
  badgeItemLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 2,
  },
  badgeName: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: SIZES.radius.xl,
  },
  modalContent: {
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  modalBadgeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalBadgeName: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalStatusContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  unlockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(COLORS.success, 0.1),
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.full,
  },
  unlockedText: {
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.full,
  },
  lockedText: {
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
  },
  requirementContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
  },
  requirementLabel: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  requirementText: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  categoryTagText: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.fontSize.sm,
    color: COLORS.textSecondary,
  },
  modalCloseButton: {
    width: '100%',
  },
});

export default BadgeShowcase;
