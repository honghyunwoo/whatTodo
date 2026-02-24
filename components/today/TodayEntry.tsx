/**
 * TodayEntry - 통합 입력 컴포넌트 (리디자인)
 *
 * Soft Brutalism + 한지 스타일:
 * - 우아한 카드 디자인
 * - 세련된 탭 선택기
 * - 인장 스타일 기분 선택
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
import Animated, { FadeIn, FadeOut, SlideInDown, SlideInUp, Layout } from 'react-native-reanimated';

import { PALETTE, TYPOGRAPHY, SPACE, RADIUS, SHADOW, withOpacity } from '@/constants/design';
import { useTaskStore } from '@/store/taskStore';
import { useDiaryStore, MoodType, MOOD_CONFIG } from '@/store/diaryStore';

type EntryType = 'memo' | 'todo' | 'diary';

interface EntryTypeConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  color: string;
  lightColor: string;
  emoji: string;
}

const ENTRY_TYPES: Record<EntryType, EntryTypeConfig> = {
  memo: {
    icon: 'document-text-outline',
    label: '메모',
    placeholder: '떠오르는 생각을 자유롭게...',
    color: PALETTE.functional.memo,
    lightColor: withOpacity(PALETTE.functional.memo, 0.1),
    emoji: '📝',
  },
  todo: {
    icon: 'checkbox-outline',
    label: '할일',
    placeholder: '오늘 해야 할 일은...',
    color: PALETTE.functional.todo,
    lightColor: withOpacity(PALETTE.functional.todo, 0.1),
    emoji: '✓',
  },
  diary: {
    icon: 'book-outline',
    label: '일기',
    placeholder: '오늘 하루를 기록해보세요...',
    color: PALETTE.functional.diary,
    lightColor: withOpacity(PALETTE.functional.diary, 0.1),
    emoji: '📖',
  },
};

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
  const inputRef = useRef<TextInput>(null);

  const addTask = useTaskStore((state) => state.addTask);
  const addDiaryEntry = useDiaryStore((state) => state.addEntry);

  const [entryType, setEntryType] = useState<EntryType>('todo');
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [feedback, setFeedback] = useState<null | 'saved' | 'empty'>(null);

  const config = ENTRY_TYPES[entryType];

  const handleFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleTypeChange = useCallback((type: EntryType) => {
    setEntryType(type);
    if (type !== 'diary') {
      setSelectedMood(null);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setFeedback('empty');
      setTimeout(() => {
        setFeedback(null);
      }, 1200);
      return;
    }

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

    setText('');
    setSelectedMood(null);
    setFeedback('saved');
    setTimeout(() => {
      setFeedback(null);
    }, 1500);
    inputRef.current?.focus();
  }, [text, entryType, selectedMood, addTask, addDiaryEntry]);

  const handleCancel = useCallback(() => {
    setText('');
    setSelectedMood(null);
    setFeedback(null);
    Keyboard.dismiss();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View layout={Layout.springify()} style={[styles.card, SHADOW.md]}>
        {/* 타입 선택 탭 - 우아한 스타일 */}
        <View style={styles.typeSelector}>
          {(Object.keys(ENTRY_TYPES) as EntryType[]).map((type, index) => {
            const typeConfig = ENTRY_TYPES[type];
            const isSelected = entryType === type;

            return (
              <Animated.View
                key={type}
                entering={FadeIn.delay(index * 50).duration(300)}
                style={styles.typeButtonWrapper}
              >
                <Pressable
                  style={[
                    styles.typeButton,
                    isSelected && [styles.typeButtonSelected, { borderColor: typeConfig.color }],
                  ]}
                  onPress={() => handleTypeChange(type)}
                >
                  {/* 선택 인디케이터 */}
                  {isSelected && (
                    <View style={[styles.typeIndicator, { backgroundColor: typeConfig.color }]} />
                  )}
                  <Text style={styles.typeEmoji}>{typeConfig.emoji}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && [styles.typeLabelSelected, { color: typeConfig.color }],
                    ]}
                  >
                    {typeConfig.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* 입력 영역 */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputAccent, { backgroundColor: config.color }]} />
          <TextInput
            ref={inputRef}
            style={[styles.input, isExpanded && styles.inputExpanded]}
            placeholder={config.placeholder}
            placeholderTextColor={PALETTE.ink.light}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onSubmitEditing={handleSubmit}
            multiline
            returnKeyType="done"
            blurOnSubmit={false}
            textAlignVertical="top"
          />
        </View>

        {/* 일기 기분 선택 */}
        {isExpanded && entryType === 'diary' && (
          <Animated.View
            entering={SlideInUp.duration(300)}
            exiting={FadeOut.duration(150)}
            style={styles.moodSection}
          >
            <Text style={styles.moodLabel}>오늘의 기분</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood, index) => {
                const moodConfig = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;

                return (
                  <Animated.View key={mood} entering={FadeIn.delay(index * 30).duration(200)}>
                    <Pressable
                      style={[
                        styles.moodButton,
                        isSelected && [
                          styles.moodButtonSelected,
                          {
                            borderColor: moodConfig.color,
                            backgroundColor: withOpacity(moodConfig.color, 0.1),
                          },
                        ],
                      ]}
                      onPress={() => setSelectedMood(isSelected ? null : mood)}
                    >
                      <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* 액션 버튼 */}
        {isExpanded && (
          <Animated.View entering={SlideInDown.duration(250)} style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: config.color },
                !text.trim() && styles.submitButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>저장</Text>
            </Pressable>
          </Animated.View>
        )}

        {feedback && (
          <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)}>
            <View
              style={[
                styles.feedbackContainer,
                feedback === 'saved' ? styles.feedbackSaved : styles.feedbackEmpty,
              ]}
            >
              <Ionicons
                name={feedback === 'saved' ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={feedback === 'saved' ? PALETTE.functional.todo : PALETTE.seal.vermilion}
              />
              <Text
                style={[
                  styles.feedbackText,
                  feedback === 'saved' ? styles.feedbackTextSaved : styles.feedbackTextEmpty,
                ]}
              >
                {feedback === 'saved' ? '저장됨' : '한 글자 이상 입력해주세요'}
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACE.md,
    marginTop: SPACE.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACE.lg,
    borderWidth: 1,
    borderColor: PALETTE.paper.aged,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACE.sm,
    marginBottom: SPACE.lg,
  },
  typeButtonWrapper: {
    flex: 1,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.lg,
    backgroundColor: PALETTE.paper.cream,
    gap: SPACE.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  typeButtonSelected: {
    backgroundColor: '#FFFFFF',
  },
  typeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.medium,
  },
  typeLabelSelected: {
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: PALETTE.paper.cream,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  inputAccent: {
    width: 4,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.size.md,
    lineHeight: 24,
    padding: SPACE.md,
    color: PALETTE.ink.black,
    minHeight: 44,
  },
  inputExpanded: {
    minHeight: 64,
  },
  moodSection: {
    marginTop: SPACE.lg,
    paddingTop: SPACE.md,
    borderTopWidth: 1,
    borderTopColor: PALETTE.paper.aged,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: PALETTE.ink.medium,
    marginBottom: SPACE.sm,
    letterSpacing: 0.5,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE.xs,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.paper.cream,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACE.sm,
    marginTop: SPACE.md,
    paddingTop: SPACE.md,
    borderTopWidth: 1,
    borderTopColor: PALETTE.paper.aged,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACE.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: PALETTE.paper.cream,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.medium,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: SPACE.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    gap: SPACE.xs,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  feedbackContainer: {
    marginTop: SPACE.sm,
    borderRadius: RADIUS.md,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.xs,
  },
  feedbackSaved: {
    backgroundColor: withOpacity(PALETTE.functional.todo, 0.1),
  },
  feedbackEmpty: {
    backgroundColor: withOpacity(PALETTE.seal.vermilion, 0.08),
  },
  feedbackText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  feedbackTextSaved: {
    color: PALETTE.functional.todo,
  },
  feedbackTextEmpty: {
    color: PALETTE.seal.vermilion,
  },
});

export default TodayEntry;
