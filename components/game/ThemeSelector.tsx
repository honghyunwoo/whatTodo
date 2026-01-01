import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { GAME_THEMES, getThemeList } from '@/types/themes';
import { useGameStore } from '@/store/gameStore';
import { useRewardStore } from '@/store/rewardStore';
import { SIZES } from '@/constants/sizes';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ThemeSelectorProps {
  onClose?: () => void;
}

function ThemeSelectorComponent({ onClose }: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useGameStore();
  const { stars, unlockTheme, hasTheme } = useRewardStore();
  const themes = getThemeList();

  const handleThemeSelect = (themeId: string, cost: number) => {
    if (hasTheme(themeId)) {
      // Already unlocked, just select it
      setTheme(themeId);
    } else if (stars >= cost) {
      // Unlock and select
      const success = unlockTheme(themeId, cost);
      if (success) {
        setTheme(themeId);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Themes</Text>
        <View style={styles.starsDisplay}>
          <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
          <Text style={styles.starsText}>{stars}</Text>
        </View>
      </View>

      <View style={styles.themesGrid}>
        {themes.map((theme) => {
          const isUnlocked = hasTheme(theme.id);
          const isSelected = currentTheme === theme.id;
          const canAfford = stars >= theme.cost;

          return (
            <ThemeItem
              key={theme.id}
              theme={theme}
              isUnlocked={isUnlocked}
              isSelected={isSelected}
              canAfford={canAfford}
              onSelect={() => handleThemeSelect(theme.id, theme.cost)}
            />
          );
        })}
      </View>
    </View>
  );
}

interface ThemeItemProps {
  theme: (typeof GAME_THEMES)[keyof typeof GAME_THEMES];
  isUnlocked: boolean;
  isSelected: boolean;
  canAfford: boolean;
  onSelect: () => void;
}

function ThemeItemComponent({
  theme,
  isUnlocked,
  isSelected,
  canAfford,
  onSelect,
}: ThemeItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Get representative colors from theme
  const previewColors = [
    theme.tiles[2].bg,
    theme.tiles[8].bg,
    theme.tiles[64].bg,
    theme.tiles[512].bg,
  ];

  return (
    <AnimatedTouchable
      style={[
        styles.themeItem,
        animatedStyle,
        isSelected && styles.themeItemSelected,
        !isUnlocked && !canAfford && styles.themeItemDisabled,
      ]}
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!isUnlocked && !canAfford}
    >
      {/* Theme preview - 4 color squares */}
      <View style={[styles.themePreview, { backgroundColor: theme.boardBg }]}>
        <View style={styles.previewGrid}>
          {previewColors.map((color, index) => (
            <View key={index} style={[styles.previewTile, { backgroundColor: color }]} />
          ))}
        </View>
      </View>

      {/* Theme name */}
      <Text style={styles.themeName}>{theme.name}</Text>

      {/* Lock/Cost indicator */}
      {!isUnlocked && (
        <View style={styles.costContainer}>
          <MaterialCommunityIcons
            name={canAfford ? 'lock-open-outline' : 'lock-outline'}
            size={14}
            color={canAfford ? '#4CAF50' : '#999'}
          />
          <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
          <Text style={[styles.costText, !canAfford && styles.costTextDisabled]}>{theme.cost}</Text>
        </View>
      )}

      {/* Selected checkmark */}
      {isSelected && isUnlocked && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
        </View>
      )}
    </AnimatedTouchable>
  );
}

const ThemeItem = memo(ThemeItemComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faf8ef',
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
  },
  costContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  costText: {
    color: '#666',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  costTextDisabled: {
    color: '#999',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  previewTile: {
    borderRadius: 2,
    height: 18,
    width: 18,
  },
  selectedBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
  },
  starsDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  starsText: {
    color: '#776e65',
    fontSize: SIZES.fontSize.md,
    fontWeight: 'bold',
  },
  themeItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: SIZES.spacing.sm,
    width: 90,
  },
  themeItemDisabled: {
    opacity: 0.5,
  },
  themeItemSelected: {
    borderColor: '#4CAF50',
  },
  themeName: {
    color: '#776e65',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    marginTop: 6,
  },
  themePreview: {
    borderRadius: SIZES.borderRadius.sm,
    padding: 4,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    justifyContent: 'center',
  },
  title: {
    color: '#776e65',
    fontSize: SIZES.fontSize.lg,
    fontWeight: 'bold',
  },
});

export const ThemeSelector = memo(ThemeSelectorComponent);
