import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SIZES } from '@/constants/sizes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface SwipeAction {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

export function SwipeableRow({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const isDeleting = useSharedValue(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    'worklet';
    if (direction === 'left' && onSwipeLeft) {
      runOnJS(onSwipeLeft)();
    } else if (direction === 'right' && onSwipeRight) {
      runOnJS(onSwipeRight)();
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const maxLeft = leftAction ? SWIPE_THRESHOLD : 0;
      const maxRight = rightAction ? -SWIPE_THRESHOLD : 0;

      translateX.value = Math.max(maxRight - 20, Math.min(maxLeft + 20, event.translationX));
    })
    .onEnd((event) => {
      const shouldTriggerLeft = translateX.value > SWIPE_THRESHOLD && leftAction;
      const shouldTriggerRight = translateX.value < -SWIPE_THRESHOLD && rightAction;

      if (shouldTriggerLeft) {
        runOnJS(triggerHaptic)();
        if (onSwipeRight) {
          isDeleting.value = true;
          translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
            handleSwipeComplete('right');
          });
        } else {
          translateX.value = withSpring(0);
        }
      } else if (shouldTriggerRight) {
        runOnJS(triggerHaptic)();
        if (onSwipeLeft) {
          isDeleting.value = true;
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
            handleSwipeComplete('left');
          });
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Left Action Background */}
      {leftAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            { backgroundColor: leftAction.backgroundColor },
            leftActionStyle,
          ]}
        >
          <Ionicons name={leftAction.icon} size={24} color={leftAction.color} />
        </Animated.View>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            { backgroundColor: rightAction.backgroundColor },
            rightActionStyle,
          ]}
        >
          <Ionicons name={rightAction.icon} size={24} color={rightAction.color} />
        </Animated.View>
      )}

      {/* Main Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, rowStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  row: {
    zIndex: 1,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: SWIPE_THRESHOLD,
  },
  leftAction: {
    left: 0,
    borderTopLeftRadius: SIZES.radius.md,
    borderBottomLeftRadius: SIZES.radius.md,
  },
  rightAction: {
    right: 0,
    borderTopRightRadius: SIZES.radius.md,
    borderBottomRightRadius: SIZES.radius.md,
  },
});

export default SwipeableRow;
