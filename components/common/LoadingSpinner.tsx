import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
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
  const { colors, isDark } = useTheme();
  const dimension = SIZES_MAP[size];

  const content = (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[styles.container, style]}
    >
      <LottieView
        source={require('@/assets/animations/loading.json')}
        autoPlay
        loop
        style={{ width: dimension, height: dimension }}
      />
      {message && (
        <Text
          style={[
            styles.message,
            TYPOGRAPHY.bodySmall,
            { color: isDark ? '#8E8E93' : '#6B6B6B' },
          ]}
        >
          {message}
        </Text>
      )}
    </MotiView>
  );

  if (overlay) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 200 }}
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' },
        ]}
      >
        {content}
      </MotiView>
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
