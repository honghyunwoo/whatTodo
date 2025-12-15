import React, { memo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS, withAlpha } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskPriority } from '@/types/task';
import { SwipeableRow } from '@/components/common/SwipeableRow';
import { todoHaptics } from '@/services/hapticService';

interface TaskItemProps {
  task: Task;
  onPress?: (task: Task) => void;
  index?: number;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: COLORS.priority.low,
  medium: COLORS.priority.medium,
  high: COLORS.priority.high,
  urgent: COLORS.priority.urgent,
};

const PRIORITY_GRADIENTS: Record<TaskPriority, [string, string]> = {
  low: [COLORS.priority.low, withAlpha(COLORS.priority.low, 0.7)],
  medium: [COLORS.priority.medium, withAlpha(COLORS.priority.medium, 0.7)],
  high: [COLORS.priority.high, withAlpha(COLORS.priority.high, 0.7)],
  urgent: [COLORS.priority.urgent, withAlpha(COLORS.priority.urgent, 0.7)],
};

function TaskItemComponent({ task, onPress, index = 0 }: TaskItemProps) {
  const { colors, isDark } = useTheme();
  const { toggleComplete, deleteTask } = useTaskStore();
  const [showCheckAnimation, setShowCheckAnimation] = React.useState(false);
  const lottieRef = React.useRef<LottieView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleToggle = useCallback(async () => {
    if (!task.completed) {
      setShowCheckAnimation(true);
      await todoHaptics.complete();
      lottieRef.current?.play();
      // 애니메이션이 끝나면 실제 토글
      timerRef.current = setTimeout(() => {
        toggleComplete(task.id);
        setShowCheckAnimation(false);
      }, 400);
    } else {
      toggleComplete(task.id);
    }
  }, [task.id, task.completed, toggleComplete]);

  const handleDelete = useCallback(async () => {
    await todoHaptics.delete();
    deleteTask(task.id);
  }, [task.id, deleteTask]);

  const handlePress = useCallback(() => {
    onPress?.(task);
  }, [task, onPress]);

  const handleSwipeLeft = useCallback(() => {
    handleDelete();
  }, [handleDelete]);

  const handleSwipeRight = useCallback(() => {
    handleToggle();
  }, [handleToggle]);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay: index * 50,
      }}
      style={styles.wrapper}
    >
      <SwipeableRow
        leftAction={{
          icon: task.completed ? 'arrow-undo' : 'checkmark',
          color: '#FFFFFF',
          backgroundColor: task.completed ? '#FF9500' : '#34C759',
          onPress: handleToggle,
        }}
        rightAction={{
          icon: 'trash',
          color: '#FFFFFF',
          backgroundColor: '#FF3B30',
          onPress: handleDelete,
        }}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.container,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            isDark ? {} : SHADOWS.sm,
          ]}
        >
          {/* Priority Indicator */}
          <LinearGradient
            colors={PRIORITY_GRADIENTS[task.priority]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.priorityIndicator}
          />

          {/* Checkbox with Animation */}
          <View style={styles.checkboxContainer}>
            {showCheckAnimation ? (
              <View style={styles.lottieContainer}>
                <LottieView
                  ref={lottieRef}
                  source={require('@/assets/animations/check-success.json')}
                  style={styles.checkLottie}
                  loop={false}
                />
              </View>
            ) : (
              <Checkbox.Android
                status={task.completed ? 'checked' : 'unchecked'}
                onPress={handleToggle}
                color={COLORS.primary}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                task.completed && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[
                  styles.description,
                  { color: isDark ? '#8E8E93' : COLORS.textSecondary },
                ]}
                numberOfLines={1}
              >
                {task.description}
              </Text>
            )}
            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={isDark ? '#8E8E93' : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.dueDate,
                    { color: isDark ? '#8E8E93' : COLORS.textSecondary },
                  ]}
                >
                  {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}
          </View>

          {/* Category Badge */}
          {task.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isDark ? '#8E8E93' : '#6B6B6B' },
                ]}
              >
                {task.category}
              </Text>
            </View>
          )}
        </Pressable>
      </SwipeableRow>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius.md,
    overflow: 'hidden',
    minHeight: 64,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
  },
  checkboxContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLottie: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    paddingRight: SIZES.spacing.sm,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 2,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  dueDate: {
    ...TYPOGRAPHY.caption,
  },
  categoryBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    marginRight: SIZES.spacing.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
});

export const TaskItem = memo(TaskItemComponent);
