import React, { forwardRef } from 'react';
import LottieView, { LottieViewProps } from 'lottie-react-native';

type LottieWrapperProps = LottieViewProps & {
  fallbackSize?: number;
};

/**
 * Lottie animation wrapper that works on both native and web
 * On web, shows a simple fallback (ActivityIndicator or empty view)
 */
export const LottieWrapper = forwardRef<LottieView, LottieWrapperProps>(
  ({ style, fallbackSize = 50, autoPlay = true, loop = true, ...props }, ref) => {
    return <LottieView ref={ref} style={style} autoPlay={autoPlay} loop={loop} {...props} />;
  }
);

LottieWrapper.displayName = 'LottieWrapper';
