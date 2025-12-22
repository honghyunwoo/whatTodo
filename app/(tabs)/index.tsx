import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { MonthView } from '@/components/calendar';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useDiaryStore } from '@/store/diaryStore';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  tired: '😴',
  neutral: '😐',
};

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DiaryCalendarScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getAllDatesWithEntries, getEntryByDate } = useDiaryStore();

  const today = useMemo(() => getTodayString(), []);
  const [selectedDate, setSelectedDate] = useState(today);

  const markedDates = useMemo(() => getAllDatesWithEntries(), [getAllDatesWithEntries]);
  const selectedEntry = useMemo(
    () => getEntryByDate(selectedDate),
    [getEntryByDate, selectedDate]
  );

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleOpenDiary = useCallback(() => {
    router.push(`/diary/${selectedDate}`);
  }, [router, selectedDate]);

  const handleOpenSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const formatSelectedDate = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>다이어리</Text>
        <IconButton
          icon={() => <Ionicons name="settings-outline" size={24} color={colors.text} />}
          onPress={handleOpenSettings}
        />
      </View>

      <MonthView
        selectedDate={selectedDate}
        markedDates={markedDates}
        onSelectDate={handleSelectDate}
      />

      <View style={styles.previewContainer}>
        <Text style={[styles.selectedDateText, { color: colors.textSecondary }]}>
          {formatSelectedDate(selectedDate)}
        </Text>

        <Pressable
          style={[
            styles.previewCard,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            !isDark && SHADOWS.md,
          ]}
          onPress={handleOpenDiary}
        >
          {selectedEntry ? (
            <View style={styles.entryContent}>
              <View style={styles.entryHeader}>
                {selectedEntry.mood && (
                  <Text style={styles.moodEmoji}>{MOOD_EMOJI[selectedEntry.mood]}</Text>
                )}
                <Text style={[styles.entryTitle, { color: colors.text }]} numberOfLines={1}>
                  {selectedEntry.title}
                </Text>
              </View>
              <Text style={[styles.entryPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                {selectedEntry.content || '내용 없음'}
              </Text>
              <View style={styles.editHint}>
                <Text style={[styles.editHintText, { color: COLORS.primary }]}>
                  탭하여 수정하기
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Ionicons name="create-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                오늘의 이야기를 기록해보세요
              </Text>
              <View style={styles.writeButton}>
                <Text style={[styles.writeButtonText, { color: COLORS.primary }]}>작성하기</Text>
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
              </View>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editHint: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SIZES.spacing.sm,
  },
  editHintText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  emptyText: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
    textAlign: 'center',
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  entryPreview: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
  },
  entryTitle: {
    flex: 1,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  moodEmoji: {
    fontSize: 24,
  },
  previewCard: {
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    minHeight: 120,
    padding: SIZES.spacing.lg,
  },
  previewContainer: {
    flex: 1,
    paddingTop: SIZES.spacing.lg,
  },
  selectedDateText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.sm,
    marginLeft: SIZES.spacing.lg,
  },
  writeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.md,
  },
  writeButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
