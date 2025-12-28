/**
 * Empty mock for lottie-react-native on web
 * This prevents import.meta errors from the actual library
 */
import React from 'react';
import { View } from 'react-native';

const LottieView = React.forwardRef((props, ref) => {
  return React.createElement(View, { ref, ...props });
});

LottieView.displayName = 'LottieView';

export default LottieView;
