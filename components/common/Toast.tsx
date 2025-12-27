import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeInDown, FadeOutUp, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { SIZES } from '@/constants/sizes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  position?: 'top' | 'bottom';
}

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    iconColor: string;
  }
> = {
  success: {
    icon: 'checkmark-circle',
    backgroundColor: '#34C759',
    iconColor: '#FFFFFF',
  },
  error: {
    icon: 'close-circle',
    backgroundColor: '#FF3B30',
    iconColor: '#FFFFFF',
  },
  warning: {
    icon: 'warning',
    backgroundColor: '#FF9500',
    iconColor: '#FFFFFF',
  },
  info: {
    icon: 'information-circle',
    backgroundColor: '#007AFF',
    iconColor: '#FFFFFF',
  },
};

export function Toast({
  visible,
  type = 'info',
  title,
  message,
  duration = 3000,
  onHide,
  position = 'top',
}: ToastProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Haptic feedback based on type
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, type]);

  if (!visible) return null;

  const positionStyle =
    position === 'top'
      ? { top: insets.top + SIZES.spacing.md }
      : { bottom: insets.bottom + SIZES.spacing.md };

  const enteringAnimation =
    position === 'top'
      ? FadeInUp.springify().damping(15).stiffness(150)
      : FadeInDown.springify().damping(15).stiffness(150);

  const exitingAnimation =
    position === 'top'
      ? FadeOutUp.springify().damping(15).stiffness(150)
      : FadeOutDown.springify().damping(15).stiffness(150);

  return (
    <Animated.View
      entering={enteringAnimation}
      exiting={exitingAnimation}
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 5,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.title, TYPOGRAPHY.body, { color: isDark ? '#FFFFFF' : '#000000' }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {message && (
          <Text
            style={[
              styles.message,
              TYPOGRAPHY.bodySmall,
              { color: isDark ? '#8E8E93' : '#6B6B6B' },
            ]}
            numberOfLines={2}
          >
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SIZES.spacing.md,
    right: SIZES.spacing.md,
    maxWidth: SCREEN_WIDTH - SIZES.spacing.md * 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    zIndex: 9999,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  message: {
    marginTop: 2,
  },
});

export default Toast;
