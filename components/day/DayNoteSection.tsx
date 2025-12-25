/**
 * Day Note Section 컴포넌트
 *
 * 하루의 한 줄 기록 입력/수정
 * journalStore의 notes 필드 사용
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useJournalStore } from '@/store/journalStore';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

interface DayNoteSectionProps {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 기존 메모 (있다면) */
  existingNote?: string;
}

/**
 * Day Note Section 메인 컴포넌트
 */
export function DayNoteSection({ date, existingNote }: DayNoteSectionProps) {
  const { colors, isDark } = useTheme();
  const journalStore = useJournalStore();

  const [note, setNote] = useState(existingNote || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // existingNote 변경 시 동기화
  useEffect(() => {
    setNote(existingNote || '');
  }, [existingNote]);

  const handleSave = () => {
    const trimmedNote = note.trim();

    // 기존 엔트리 조회
    const entry = journalStore.getEntry(date);

    if (entry) {
      // 업데이트
      journalStore.updateEntry(date, { notes: trimmedNote });
    } else if (trimmedNote) {
      // 신규 생성 (메모가 있을 때만)
      journalStore.createEntry({ date, notes: trimmedNote });
    }

    // 저장 완료 표시
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleSave();
  };

  const characterCount = note.length;
  const hasContent = note.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.md,
        isFocused && styles.containerFocused,
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.title, { color: colors.text }]}>한 줄 기록</Text>
        </View>

        {/* 저장 상태 표시 */}
        {isSaved && (
          <View style={styles.savedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={[styles.savedText, { color: COLORS.success }]}>저장됨</Text>
          </View>
        )}
      </View>

      {/* 입력 영역 */}
      <TextInput
        value={note}
        onChangeText={setNote}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder="오늘 어땠나요? (한 줄이면 충분해요)"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={200}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: isFocused ? COLORS.primary : colors.border,
          },
        ]}
      />

      {/* 하단 정보 */}
      <View style={styles.footer}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          💡 Tip: 한 단어만 써도 OK
        </Text>

        <Text
          style={[
            styles.characterCount,
            {
              color: characterCount > 180 ? COLORS.error : colors.textSecondary,
            },
          ]}
        >
          {characterCount}/200
        </Text>
      </View>

      {/* 빠른 입력 제안 (메모가 없을 때만) */}
      {!hasContent && !isFocused && (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>빠른 입력:</Text>
          <View style={styles.suggestionButtons}>
            {['좋은 하루', '피곤한 하루', '보통', '바쁜 하루'].map((suggestion) => (
              <Pressable
                key={suggestion}
                style={[styles.suggestionButton, { backgroundColor: COLORS.primary + '20' }]}
                onPress={() => setNote(suggestion)}
              >
                <Text style={[styles.suggestionText, { color: COLORS.primary }]}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  characterCount: {
    fontSize: SIZES.fontSize.xs,
  },
  container: {
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  containerFocused: {
    borderColor: COLORS.primary,
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
    marginBottom: SIZES.spacing.md,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  hint: {
    fontSize: SIZES.fontSize.xs,
  },
  input: {
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    fontSize: SIZES.fontSize.md,
    minHeight: 80,
    padding: SIZES.spacing.md,
    textAlignVertical: 'top',
  },
  savedIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  savedText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  suggestionButton: {
    borderRadius: SIZES.borderRadius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  suggestionText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  suggestions: {
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  suggestionsTitle: {
    fontSize: SIZES.fontSize.xs,
  },
  title: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
});
