import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, Pressable, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { getTodayString } from '@/utils/day';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useJournalStore } from '@/store/journalStore';

/**
 * QuickNoteInput: 홈 화면의 빠른 메모 입력
 *
 * 기능:
 * - 한 줄 빠른 메모 입력 (200자 제한)
 * - 엔터키로 즉시 저장
 * - 저장 완료 피드백 (2초)
 * - 저장 후 입력창 자동 클리어
 */
export function QuickNoteInput() {
  const { colors, isDark } = useTheme();
  const journalStore = useJournalStore();

  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = useCallback(() => {
    if (!note.trim()) return;

    const today = getTodayString();
    const entry = journalStore.getEntry(today);

    if (entry) {
      // 기존 entry에 메모 추가 (개행으로 구분)
      const newNotes = entry.notes ? `${entry.notes}\n${note.trim()}` : note.trim();
      journalStore.updateEntry(today, { notes: newNotes });
    } else {
      // 새 entry 생성
      journalStore.createEntry({
        date: today,
        notes: note.trim(),
      });
    }

    // 저장 완료 피드백
    setNote('');
    setIsSaved(true);
    Keyboard.dismiss();

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  }, [note, journalStore]);

  const handleSubmitEditing = () => {
    handleSave();
  };

  const characterCount = note.length;
  const isOverLimit = characterCount > 200;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.md,
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.title, { color: colors.text }]}>빠른 기록</Text>
        </View>
        {isSaved && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={[styles.savedText, { color: COLORS.success }]}>저장됨</Text>
          </View>
        )}
      </View>

      {/* 입력창 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7',
              borderColor: isOverLimit ? COLORS.error : 'transparent',
            },
          ]}
          value={note}
          onChangeText={setNote}
          onSubmitEditing={handleSubmitEditing}
          placeholder="오늘 어땠나요? (Enter로 빠르게 저장)"
          placeholderTextColor={colors.textSecondary}
          maxLength={220} // 200자 + 여유
          multiline
          numberOfLines={2}
          returnKeyType="done"
          blurOnSubmit
        />

        {/* 글자 수 카운터 */}
        <View style={styles.footer}>
          <Text
            style={[styles.charCount, { color: isOverLimit ? COLORS.error : colors.textSecondary }]}
          >
            {characterCount}/200
          </Text>

          {/* 저장 버튼 */}
          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  note.trim() && !isOverLimit ? COLORS.primary : colors.textSecondary + '30',
              },
            ]}
            onPress={handleSave}
            disabled={!note.trim() || isOverLimit}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={note.trim() && !isOverLimit ? '#FFFFFF' : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* 안내 텍스트 */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        💡 간단한 메모부터 시작해보세요. 나중에 Day 페이지에서 확인할 수 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  charCount: {
    fontSize: SIZES.fontSize.xs,
  },
  container: {
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.sm,
  },
  hint: {
    fontSize: SIZES.fontSize.xs,
    lineHeight: 16,
    marginTop: SIZES.spacing.sm,
  },
  input: {
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    fontSize: SIZES.fontSize.md,
    minHeight: 60,
    padding: SIZES.spacing.sm,
    textAlignVertical: 'top',
  },
  inputContainer: {
    marginBottom: SIZES.spacing.xs,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  savedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  savedText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
});
