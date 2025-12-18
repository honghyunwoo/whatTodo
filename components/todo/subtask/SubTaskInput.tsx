import React, { memo, useCallback, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { todoHaptics } from '@/services/hapticService';

interface SubTaskInputProps {
  onAdd: (title: string) => void;
  disabled?: boolean;
  maxReached?: boolean;
}

function SubTaskInputComponent({ onAdd, disabled, maxReached }: SubTaskInputProps) {
  const { colors, isDark } = useTheme();
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleAdd = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || maxReached) return;

    await todoHaptics.tap();
    onAdd(trimmed);
    setValue('');
  }, [value, disabled, maxReached, onAdd]);

  const handleSubmit = useCallback(() => {
    handleAdd();
  }, [handleAdd]);

  if (maxReached) {
    return (
      <View style={[styles.maxContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFF5F5' }]}>
        <Ionicons name="warning-outline" size={16} color="#FF9500" />
        <Text style={[styles.maxText, { color: isDark ? '#FF9500' : '#D97706' }]}>
          최대 20개까지 추가할 수 있습니다
        </Text>
      </View>
    );
  }

  return (
    <MotiView
      animate={{
        borderColor: isFocused ? COLORS.primary : isDark ? '#3A3A3C' : '#E5E5E7',
      }}
      transition={{ type: 'timing', duration: 150 }}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#2C2C2E' : '#F9F9FB',
          borderWidth: 1,
        },
      ]}
    >
      <Ionicons
        name="add-circle-outline"
        size={20}
        color={isFocused ? COLORS.primary : isDark ? '#8E8E93' : '#A0A0A0'}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={setValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSubmit}
        placeholder="세부 항목 추가..."
        placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
        style={[
          styles.input,
          {
            color: colors.text,
          },
        ]}
        returnKeyType="done"
        editable={!disabled}
      />
      {value.trim().length > 0 && (
        <Pressable onPress={handleAdd} style={styles.addButton}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        </Pressable>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  icon: {
    marginRight: SIZES.spacing.xs,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    paddingVertical: SIZES.spacing.sm,
  },
  addButton: {
    padding: SIZES.spacing.xs,
  },
  maxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  maxText: {
    ...TYPOGRAPHY.caption,
  },
});

export const SubTaskInput = memo(SubTaskInputComponent);
