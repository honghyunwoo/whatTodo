/**
 * TodayEntry - 통합 입력 컴포넌트
 *
 * 메모/할일/일기를 한 곳에서 작성
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { COLORS } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useTaskStore } from '@/store/taskStore';
import { useDiaryStore, MoodType, MOOD_CONFIG } from '@/store/diaryStore';

// 입력 타입
type EntryType = 'memo' | 'todo' | 'diary';

interface EntryTypeConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  color: string;
}

const ENTRY_TYPES: Record<EntryType, EntryTypeConfig> = {
  memo: {
    icon: 'create-outline',
    label: '메모',
    placeholder: '생각나는 것을 적어보세요...',
    color: '#3B82F6',
  },
  todo: {
    icon: 'checkbox-outline',
    label: '할일',
    placeholder: '오늘 할 일을 추가하세요...',
    color: '#10B981',
  },
  diary: {
    icon: 'book-outline',
    label: '일기',
    placeholder: '오늘 하루는 어땠나요?',
    color: '#8B5CF6',
  },
};

// 기분 선택용 (일기)
const MOODS: MoodType[] = [
  'happy',
  'excited',
  'peaceful',
  'neutral',
  'tired',
  'sad',
  'anxious',
  'angry',
];

export function TodayEntry() {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  // Store
  const addTask = useTaskStore((state) => state.addTask);
  const addDiaryEntry = useDiaryStore((state) => state.addEntry);

  // State
  const [entryType, setEntryType] = useState<EntryType>('memo');
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const config = ENTRY_TYPES[entryType];

  // 입력창 확장
  const handleFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  // 타입 변경
  const handleTypeChange = useCallback((type: EntryType) => {
    setEntryType(type);
    if (type !== 'diary') {
      setSelectedMood(null);
    }
  }, []);

  // 제출
  const handleSubmit = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    switch (entryType) {
      case 'todo':
        addTask({
          title: trimmedText,
          category: 'other',
          priority: 'medium',
          dueDate: dateStr,
        });
        break;

      case 'memo':
        addDiaryEntry({
          date: dateStr,
          title: '메모',
          content: trimmedText,
          tags: ['메모'],
        });
        break;

      case 'diary':
        addDiaryEntry({
          date: dateStr,
          title: '오늘의 일기',
          content: trimmedText,
          mood: selectedMood || undefined,
          tags: ['일기'],
        });
        break;
    }

    // 리셋
    setText('');
    setSelectedMood(null);
    setIsExpanded(false);
    Keyboard.dismiss();
  }, [text, entryType, selectedMood, addTask, addDiaryEntry]);

  // 취소
  const handleCancel = useCallback(() => {
    setText('');
    setSelectedMood(null);
    setIsExpanded(false);
    Keyboard.dismiss();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
          !isDark && SHADOWS.md,
        ]}
      >
        {/* 타입 선택 탭 */}
        <View style={styles.typeSelector}>
          {(Object.keys(ENTRY_TYPES) as EntryType[]).map((type) => {
            const typeConfig = ENTRY_TYPES[type];
            const isSelected = entryType === type;

            return (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  isSelected && { backgroundColor: typeConfig.color + '20' },
                ]}
                onPress={() => handleTypeChange(type)}
              >
                <Ionicons
                  name={typeConfig.icon}
                  size={18}
                  color={isSelected ? typeConfig.color : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: isSelected ? typeConfig.color : colors.textSecondary },
                    isSelected && styles.typeLabelSelected,
                  ]}
                >
                  {typeConfig.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 입력창 */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }, isExpanded && styles.inputExpanded]}
            placeholder={config.placeholder}
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 일기 기분 선택 */}
        {isExpanded && entryType === 'diary' && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.moodSelector}
          >
            <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>오늘 기분은?</Text>
            <View style={styles.moodList}>
              {MOODS.map((mood) => {
                const moodConfig = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;

                return (
                  <Pressable
                    key={mood}
                    style={[
                      styles.moodButton,
                      isSelected && {
                        backgroundColor: moodConfig.color + '20',
                        borderColor: moodConfig.color,
                      },
                    ]}
                    onPress={() => setSelectedMood(isSelected ? null : mood)}
                  >
                    <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* 액션 버튼 */}
        {isExpanded && (
          <Animated.View entering={SlideInDown.duration(200)} style={styles.actions}>
            <Pressable
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>취소</Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: config.color },
                !text.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>추가</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  card: {
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    gap: 6,
  },
  typeLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  typeLabelSelected: {
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 44,
  },
  input: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
    paddingVertical: SIZES.spacing.xs,
  },
  inputExpanded: {
    minHeight: 80,
  },
  moodSelector: {
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  moodLabel: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
  },
  moodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: SIZES.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadius.md,
    gap: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TodayEntry;
