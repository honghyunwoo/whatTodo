import React, { memo, useCallback, useRef } from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import { Checkbox, Text, IconButton } from 'react-native-paper';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { SubTask } from '@/types/task';
import { todoHaptics } from '@/services/hapticService';

interface SubTaskItemProps {
  subtask: SubTask;
  taskId: string;
  onToggle: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
  onUpdate: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  index?: number;
}

function SubTaskItemComponent({
  subtask,
  taskId,
  onToggle,
  onDelete,
  onUpdate,
  index = 0,
}: SubTaskItemProps) {
  const { colors, isDark } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(subtask.title);
  const inputRef = useRef<TextInput>(null);

  const handleToggle = useCallback(async () => {
    await todoHaptics.tap();
    onToggle(taskId, subtask.id);
  }, [taskId, subtask.id, onToggle]);

  const handleDelete = useCallback(async () => {
    await todoHaptics.delete();
    onDelete(taskId, subtask.id);
  }, [taskId, subtask.id, onDelete]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditTitle(subtask.title);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [subtask.title]);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== subtask.title) {
      onUpdate(taskId, subtask.id, { title: trimmed });
    }
    setIsEditing(false);
  }, [editTitle, subtask.title, subtask.id, taskId, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditTitle(subtask.title);
    setIsEditing(false);
  }, [subtask.title]);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: 10 }}
      transition={{
        type: 'timing',
        duration: 200,
        delay: index * 30,
      }}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#2C2C2E' : '#F9F9FB',
        },
      ]}
    >
      {/* Checkbox */}
      <Checkbox.Android
        status={subtask.completed ? 'checked' : 'unchecked'}
        onPress={handleToggle}
        color={COLORS.primary}
      />

      {/* Content */}
      <View style={styles.content}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            value={editTitle}
            onChangeText={setEditTitle}
            onBlur={handleSaveEdit}
            onSubmitEditing={handleSaveEdit}
            style={[
              styles.editInput,
              {
                color: colors.text,
                backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
              },
            ]}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={handleStartEdit} style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                subtask.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {subtask.title}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Actions */}
      {!isEditing && (
        <IconButton
          icon={() => (
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={isDark ? '#8E8E93' : '#A0A0A0'}
            />
          )}
          onPress={handleDelete}
          size={20}
          style={styles.deleteButton}
        />
      )}

      {isEditing && (
        <View style={styles.editActions}>
          <IconButton
            icon={() => <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            onPress={handleSaveEdit}
            size={20}
          />
          <IconButton
            icon={() => <Ionicons name="close" size={18} color="#FF3B30" />}
            onPress={handleCancelEdit}
            size={20}
          />
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius.sm,
    marginVertical: 2,
    paddingRight: 4,
  },
  content: {
    flex: 1,
    paddingVertical: SIZES.spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.bodySmall,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  editInput: {
    ...TYPOGRAPHY.bodySmall,
    borderRadius: SIZES.radius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  deleteButton: {
    margin: 0,
  },
  editActions: {
    flexDirection: 'row',
  },
});

export const SubTaskItem = memo(SubTaskItemComponent);
