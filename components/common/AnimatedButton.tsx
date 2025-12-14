import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/typography';
import { SIZES } from '@/constants/sizes';
import { COLORS } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  gradient?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  haptic = true,
  gradient = false,
}: AnimatedButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = SIZE_STYLES[size];
  const variantStyles = getVariantStyles(variant, isDark, colors, disabled);

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyles.textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  const containerStyle = [
    styles.button,
    sizeStyles.button,
    variantStyles.button,
    disabled && styles.disabled,
    style,
  ];

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={animatedStyle}
      >
        <LinearGradient
          colors={[COLORS.primary, '#5856D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={containerStyle}
        >
          {buttonContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[animatedStyle, containerStyle]}
    >
      {buttonContent}
    </AnimatedPressable>
  );
}

const SIZE_STYLES = {
  small: {
    button: {
      paddingVertical: SIZES.spacing.xs,
      paddingHorizontal: SIZES.spacing.md,
      borderRadius: SIZES.radius.sm,
      minHeight: 32,
    },
    text: {
      ...TYPOGRAPHY.buttonSmall,
    },
  },
  medium: {
    button: {
      paddingVertical: SIZES.spacing.sm,
      paddingHorizontal: SIZES.spacing.lg,
      borderRadius: SIZES.radius.md,
      minHeight: 44,
    },
    text: {
      ...TYPOGRAPHY.button,
    },
  },
  large: {
    button: {
      paddingVertical: SIZES.spacing.md,
      paddingHorizontal: SIZES.spacing.xl,
      borderRadius: SIZES.radius.lg,
      minHeight: 56,
    },
    text: {
      ...TYPOGRAPHY.button,
      fontSize: 18,
    },
  },
};

function getVariantStyles(
  variant: ButtonVariant,
  isDark: boolean,
  colors: any,
  disabled: boolean
) {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        button: {
          backgroundColor: colors.primary,
          opacity,
        },
        textColor: '#FFFFFF',
      };
    case 'secondary':
      return {
        button: {
          backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
          opacity,
        },
        textColor: colors.text,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
          opacity,
        },
        textColor: colors.primary,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
          opacity,
        },
        textColor: colors.primary,
      };
    case 'danger':
      return {
        button: {
          backgroundColor: COLORS.priority.urgent,
          opacity,
        },
        textColor: '#FFFFFF',
      };
    default:
      return {
        button: {
          backgroundColor: colors.primary,
          opacity,
        },
        textColor: '#FFFFFF',
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AnimatedButton;
