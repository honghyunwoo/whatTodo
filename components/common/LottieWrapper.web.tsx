import React, { forwardRef } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

import { COLORS } from '@/constants/colors';

type LottieWrapperProps = {
  style?: ViewStyle;
  fallbackSize?: number;
  autoPlay?: boolean;
  loop?: boolean;
  source?: unknown;
};

/**
 * Web fallback for Lottie animations
 * Shows ActivityIndicator instead of Lottie animation
 */
export const LottieWrapper = forwardRef<View, LottieWrapperProps>(
  ({ style, fallbackSize = 50 }, ref) => {
    return (
      <View ref={ref} style={[styles.container, style]}>
        <ActivityIndicator size={fallbackSize > 40 ? 'large' : 'small'} color={COLORS.primary} />
      </View>
    );
  }
);

LottieWrapper.displayName = 'LottieWrapper';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
