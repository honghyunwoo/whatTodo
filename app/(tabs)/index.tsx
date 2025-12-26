import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { MonthView } from '@/components/calendar';
import { TodaySummary } from '@/components/home/TodaySummary';
import { QuickNoteInput } from '@/components/home/QuickNoteInput';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useDiaryStore, MOOD_CONFIG, type MoodType } from '@/store/diaryStore';

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
  const { getStats, streak, longestStreak } = useDiaryStore();

  const today = useMemo(() => getTodayString(), []);
  const [selectedDate, setSelectedDate] = useState(today);

  const entries = useDiaryStore((state) => state.entries);

  const markedDates = useMemo(() => entries.map((e) => e.date), [entries]);
  const selectedEntry = useMemo(
    () => entries.find((e) => e.date === selectedDate),
    [entries, selectedDate]
  );
  const stats = useMemo(() => getStats(), [getStats, entries]);

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

  const topMood = useMemo(() => {
    const moods = Object.entries(stats.moodDistribution) as [MoodType, number][];
    const sorted = moods.sort((a, b) => b[1] - a[1]);
    if (sorted[0] && sorted[0][1] > 0) {
      return MOOD_CONFIG[sorted[0][0]];
    }
    return null;
  }, [stats.moodDistribution]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>다이어리</Text>
        <IconButton
          icon={() => <Ionicons name="settings-outline" size={24} color={colors.text} />}
          onPress={handleOpenSettings}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Day 중심 섹션 - Phase 3 */}
        <TodaySummary />
        <QuickNoteInput />

        {/* 구분선 */}
        <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5E7' }]} />

        {/* 다이어리 섹션 (기존 기능) */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📔 나의 다이어리</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>연속 작성</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={styles.statEmoji}>📝</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalEntries}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>총 기록</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.thisMonthEntries}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>이번 달</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={styles.statEmoji}>{topMood?.emoji || '😐'}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{topMood?.label || '-'}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>주 기분</Text>
          </View>
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
                    <Text style={styles.moodEmoji}>{MOOD_CONFIG[selectedEntry.mood]?.emoji}</Text>
                  )}
                  <Text style={[styles.entryTitle, { color: colors.text }]} numberOfLines={1}>
                    {selectedEntry.title}
                  </Text>
                </View>
                <Text
                  style={[styles.entryPreview, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {selectedEntry.content || '내용 없음'}
                </Text>
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {selectedEntry.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
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

        {longestStreak > 0 && (
          <View
            style={[styles.achievementCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF8E1' }]}
          >
            <Text style={styles.achievementEmoji}>🏆</Text>
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>최장 연속 기록</Text>
              <Text style={[styles.achievementValue, { color: '#F59E0B' }]}>{longestStreak}일</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    marginBottom: SIZES.spacing.sm,
    marginHorizontal: SIZES.spacing.lg,
  },
  achievementCard: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xl,
    padding: SIZES.spacing.md,
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: SIZES.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: SIZES.fontSize.sm,
  },
  achievementValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
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
    paddingTop: SIZES.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  selectedDateText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.sm,
    marginLeft: SIZES.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SIZES.spacing.sm,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
  },
  tagBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.sm,
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
