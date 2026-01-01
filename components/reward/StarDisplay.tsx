import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  ZoomIn,
  FadeOut,
  FadeIn,
} from 'react-native-reanimated';

import { useRewardStore } from '@/store/rewardStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { SIZES } from '@/constants/sizes';

interface StarDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

const SIZE_CONFIG = {
  sm: {
    iconSize: 16,
    fontSize: 14,
    padding: 6,
    gap: 4,
  },
  md: {
    iconSize: 20,
    fontSize: 16,
    padding: 8,
    gap: 6,
  },
  lg: {
    iconSize: 24,
    fontSize: 20,
    padding: 10,
    gap: 8,
  },
};

// Gold color palette
const STAR_COLORS = {
  primary: '#FFD700',
  secondary: '#FFA500',
  glow: 'rgba(255, 215, 0, 0.3)',
};

export function StarDisplay({ size = 'md', showAnimation = true }: StarDisplayProps) {
  const { stars } = useRewardStore();
  const { isDark } = useTheme();
  const config = SIZE_CONFIG[size];

  // Animation values
  const scale = useSharedValue(1);
  const prevStars = useSharedValue(stars);

  // Animate when stars change
  useEffect(() => {
    if (showAnimation && stars !== prevStars.value && stars > prevStars.value) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
    prevStars.value = stars;
  }, [stars, showAnimation, prevStars, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Animated.View entering={ZoomIn.springify().damping(15)}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)',
            paddingHorizontal: config.padding + 4,
            paddingVertical: config.padding,
            borderRadius: SIZES.borderRadius.lg,
          },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconWrapper, { marginRight: config.gap }]}>
          <Ionicons name="star" size={config.iconSize} color={STAR_COLORS.primary} />
        </View>
        <Text
          style={[
            styles.text,
            {
              fontSize: config.fontSize,
              color: isDark ? '#FFFFFF' : '#333333',
            },
          ]}
        >
          {formatNumber(stars)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// Compact version for headers
export function StarDisplayCompact() {
  const { stars } = useRewardStore();
  const { isDark } = useTheme();

  return (
    <View style={styles.compactContainer}>
      <Ionicons name="star" size={18} color={STAR_COLORS.primary} />
      <Text style={[styles.compactText, { color: isDark ? '#FFFFFF' : '#333333' }]}>
        {stars.toLocaleString()}
      </Text>
    </View>
  );
}

// Floating reward animation when earning stars
interface FloatingRewardProps {
  amount: number;
  visible: boolean;
  onComplete: () => void;
}

export function FloatingReward({ amount, visible, onComplete }: FloatingRewardProps) {
  useEffect(() => {
    if (visible && amount > 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visible, amount, onComplete]);

  if (!visible || amount <= 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(1000)}
      style={styles.floatingContainer}
    >
      <Ionicons name="star" size={20} color={STAR_COLORS.primary} />
      <Text style={styles.floatingText}>+{amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    ...TYPOGRAPHY.label,
    fontWeight: '600',
  },
  floatingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingText: {
    ...TYPOGRAPHY.label,
    fontWeight: '700',
    color: STAR_COLORS.primary,
  },
});

export default StarDisplay;
