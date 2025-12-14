import React, { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
} from 'react-native-reanimated';

import { BADGES, Badge, BadgeCategory, getBadgesByCategory } from '@/types/badges';
import { useRewardStore } from '@/store/rewardStore';
import { SIZES } from '@/constants/sizes';
import { COLORS } from '@/constants/colors';

interface BadgeGridProps {
  category?: BadgeCategory;
  showLocked?: boolean;
}

function BadgeGridComponent({ category, showLocked = true }: BadgeGridProps) {
  const { unlockedBadges, hasBadge } = useRewardStore();

  // Get badges to display
  const badges = category ? getBadgesByCategory(category) : Object.values(BADGES);

  // Filter if not showing locked
  const displayBadges = showLocked ? badges : badges.filter((b) => hasBadge(b.id));

  if (displayBadges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="trophy-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No badges yet</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {displayBadges.map((badge, index) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          isUnlocked={hasBadge(badge.id)}
          index={index}
        />
      ))}
    </ScrollView>
  );
}

interface BadgeItemProps {
  badge: Badge;
  isUnlocked: boolean;
  index: number;
}

function BadgeItemComponent({ badge, isUnlocked, index }: BadgeItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isUnlocked) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      style={[
        styles.badgeItem,
        animatedStyle,
        !isUnlocked && styles.badgeItemLocked,
      ]}
    >
      {/* Badge Icon Container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isUnlocked ? badge.color + '20' : '#f0f0f0' },
        ]}
      >
        <MaterialCommunityIcons
          name={badge.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={32}
          color={isUnlocked ? badge.color : '#ccc'}
        />

        {/* Lock overlay for locked badges */}
        {!isUnlocked && (
          <View style={styles.lockOverlay}>
            <MaterialCommunityIcons name="lock" size={14} color="#999" />
          </View>
        )}
      </View>

      {/* Badge Name */}
      <Text
        style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
    </Animated.View>
  );
}

const BadgeItem = memo(BadgeItemComponent);

// Full Badge Card with description (for detail view)
interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
}

export function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  return (
    <View style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}>
      <View
        style={[
          styles.cardIconContainer,
          { backgroundColor: isUnlocked ? badge.color + '20' : '#f0f0f0' },
        ]}
      >
        <MaterialCommunityIcons
          name={badge.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={40}
          color={isUnlocked ? badge.color : '#ccc'}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardName, !isUnlocked && styles.cardNameLocked]}>
          {badge.name}
        </Text>
        <Text style={[styles.cardDescription, !isUnlocked && styles.cardDescriptionLocked]}>
          {badge.description}
        </Text>

        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(badge.category) }]}>
          <Text style={styles.categoryText}>{badge.category}</Text>
        </View>
      </View>

      {isUnlocked && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
      )}
    </View>
  );
}

// Badge Stats Summary
interface BadgeStatsProps {
  showLabel?: boolean;
}

export function BadgeStats({ showLabel = true }: BadgeStatsProps) {
  const { unlockedBadges } = useRewardStore();
  const totalBadges = Object.keys(BADGES).length;
  const unlockedCount = unlockedBadges.length;
  const progress = totalBadges > 0 ? unlockedCount / totalBadges : 0;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsIconRow}>
        <MaterialCommunityIcons name="trophy" size={24} color="#FFC107" />
        <Text style={styles.statsCount}>
          {unlockedCount}/{totalBadges}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {showLabel && (
        <Text style={styles.statsLabel}>Badges Earned</Text>
      )}
    </View>
  );
}

const getCategoryColor = (category: BadgeCategory): string => {
  switch (category) {
    case 'todo':
      return '#4CAF50';
    case 'game':
      return '#2196F3';
    case 'learning':
      return '#FF9800';
    case 'special':
      return '#9C27B0';
    default:
      return '#757575';
  }
};

const styles = StyleSheet.create({
  badgeCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
    width: 70,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeName: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#999',
  },
  cardContent: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  cardDescriptionLocked: {
    color: '#aaa',
  },
  cardIconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  cardName: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: 'bold',
  },
  cardNameLocked: {
    color: '#999',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  emptyText: {
    color: '#999',
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.round,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
    width: 56,
  },
  lockOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 20,
  },
  progressBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    height: 6,
    marginTop: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#FFC107',
    borderRadius: 4,
    height: '100%',
  },
  scrollContainer: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
  },
  statsContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
  },
  statsCount: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsIconRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statsLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 4,
  },
});

export const BadgeGrid = memo(BadgeGridComponent);
