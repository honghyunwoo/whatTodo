import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { SIZES } from '@/constants/sizes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BlurModalProps {
  visible: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  intensity?: number;
  contentStyle?: ViewStyle;
  position?: 'center' | 'bottom';
  closeOnBackdrop?: boolean;
}

export function BlurModal({
  visible,
  onClose,
  onDismiss,
  children,
  intensity = 50,
  contentStyle,
  position = 'center',
  closeOnBackdrop = true,
}: BlurModalProps) {
  // Support both onClose and onDismiss for flexibility
  const handleClose = onDismiss || onClose || (() => {});
  const { isDark } = useTheme();

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      handleClose();
    }
  };

  const contentAnimation = position === 'bottom'
    ? { entering: SlideInDown.springify(), exiting: SlideOutDown }
    : { entering: FadeIn.duration(200), exiting: FadeOut.duration(150) };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Blur Background */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress}>
          <BlurView
            intensity={intensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' },
            ]}
          />
        </Pressable>

        {/* Content */}
        <Animated.View
          {...contentAnimation}
          style={[
            styles.content,
            position === 'bottom' && styles.bottomContent,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              maxHeight: SCREEN_HEIGHT * 0.9,
            },
            contentStyle,
          ]}
        >
          {/* Handle bar for bottom sheet */}
          {position === 'bottom' && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: isDark ? '#48484A' : '#E0E0E0' },
                ]}
              />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    padding: SIZES.spacing.lg,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: '100%',
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  handleContainer: {
    paddingTop: SIZES.spacing.sm,
    paddingBottom: SIZES.spacing.xs,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});

export default BlurModal;
