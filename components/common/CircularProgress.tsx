import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { COLORS } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  centerContent?: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
}

export function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 10,
  color,
  backgroundColor,
  showPercentage = true,
  centerContent,
  style,
  animated = true,
}: CircularProgressProps) {
  const { colors, isDark } = useTheme();

  const progressValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate progress
  React.useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    progressValue.value = animated
      ? withTiming(clampedProgress, { duration: 800 })
      : clampedProgress;
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const progressColor = color || colors.primary;
  const bgColor = backgroundColor || (isDark ? '#3A3A3C' : '#E5E5EA');

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {centerContent || (showPercentage && (
          <Text
            style={[
              styles.percentage,
              TYPOGRAPHY.h3,
              {
                color: colors.text,
                fontSize: size * 0.2,
              },
            ]}
          >
            {Math.round(progress)}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontWeight: '700',
  },
});

export default CircularProgress;
