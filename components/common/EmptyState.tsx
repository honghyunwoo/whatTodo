import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { SIZES } from '@/constants/sizes';

type AnimationType = 'tasks' | 'learn' | 'generic';

interface EmptyStateProps {
  type?: AnimationType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

const ANIMATIONS: Record<AnimationType, any> = {
  tasks: require('@/assets/animations/empty-tasks.json'),
  learn: require('@/assets/animations/empty-tasks.json'), // 같은 애니메이션 재사용
  generic: require('@/assets/animations/empty-tasks.json'),
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.container, style]}
    >
      <View style={styles.animationContainer}>
        <LottieView
          source={ANIMATIONS[type]}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>

      <Text
        style={[
          styles.title,
          TYPOGRAPHY.h3,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={[
            styles.description,
            TYPOGRAPHY.body,
            { color: isDark ? '#8E8E93' : '#6B6B6B' },
          ]}
        >
          {description}
        </Text>
      )}

      {action && <View style={styles.actionContainer}>{action}</View>}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.xxl,
  },
  animationContainer: {
    width: 180,
    height: 180,
    marginBottom: SIZES.spacing.lg,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: SIZES.spacing.xl,
  },
});

export default EmptyState;
