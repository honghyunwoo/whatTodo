import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { SIZES } from '@/constants/sizes';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

const SIZES_MAP = {
  small: 40,
  medium: 80,
  large: 120,
};

export function LoadingSpinner({
  size = 'medium',
  message,
  overlay = false,
  style,
}: LoadingSpinnerProps) {
  const { isDark } = useTheme();
  const dimension = SIZES_MAP[size];

  const content = (
    <Animated.View entering={ZoomIn.duration(300)} style={[styles.container, style]}>
      <LottieView
        source={require('@/assets/animations/loading.json')}
        autoPlay
        loop
        style={{ width: dimension, height: dimension }}
      />
      {message && (
        <Text
          style={[styles.message, TYPOGRAPHY.bodySmall, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}
        >
          {message}
        </Text>
      )}
    </Animated.View>
  );

  if (overlay) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' },
        ]}
      >
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: SIZES.spacing.md,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
