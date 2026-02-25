/**
 * Records Tab
 * 기록 열람 화면 - 과거 활동 검색 및 조회
 */

import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, Searchbar, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useDiaryStore } from '@/store/diaryStore';
import { useLearnStore } from '@/store/learnStore';
import { useTaskStore } from '@/store/taskStore';
import { formatDateToString, getRecentDays } from '@/utils/day';

type FilterType = 'all' | 'todo' | 'learn' | 'diary';

interface RecordItem {
  id: string;
  date: string;
  type: 'todo' | 'learn' | 'diary';
  title: string;
  subtitle?: string;
  emoji: string;
}

export default function RecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const storeTasks = useTaskStore((state) => state.tasks);
  const storeProgress = useLearnStore((state) => state.progress);
  const storeEntries = useDiaryStore((state) => state.entries);

  // Memoize to avoid new array references on each render
  const tasks = useMemo(() => storeTasks ?? [], [storeTasks]);
  const progress = useMemo(() => storeProgress ?? [], [storeProgress]);
  const entries = useMemo(() => storeEntries ?? [], [storeEntries]);

  // 최근 30일 기록 생성
  const records = useMemo(() => {
    const items: RecordItem[] = [];

    // 완료된 Todo
    tasks
      .filter((task) => task.completed)
      .forEach((task) => {
        const todoDate = task.completedAt
          ? formatDateToString(new Date(task.completedAt))
          : task.dueDate || formatDateToString(new Date(task.createdAt));

        items.push({
          id: `todo-${task.id}`,
          date: todoDate,
          type: 'todo',
          title: task.title,
          subtitle: task.priority ? `우선순위: ${task.priority}` : undefined,
          emoji: '✅',
        });
      });

    // 학습 진행
    progress
      .filter((p) => p.completed)
      .forEach((p) => {
        items.push({
          id: `learn-${p.activityId}-${p.weekId}`,
          date: p.lastAttempt ? p.lastAttempt.split('T')[0] : formatDateToString(new Date()),
          type: 'learn',
          title: `${p.activityId} 완료`,
          subtitle: p.score ? `점수: ${p.score}점` : undefined,
          emoji: '📚',
        });
      });

    // 일기
    entries.forEach((entry) => {
      items.push({
        id: `diary-${entry.id}`,
        date: entry.date,
        type: 'diary',
        title: entry.content.slice(0, 50) + (entry.content.length > 50 ? '...' : ''),
        subtitle:
          entry.photos && entry.photos.length > 0
            ? `사진 ${entry.photos.length}장`
            : entry.mood
              ? `기분: ${entry.mood}`
              : undefined,
        emoji: '📝',
      });
    });

    // 날짜순 정렬 (최신순)
    items.sort((a, b) => b.date.localeCompare(a.date));

    return items;
  }, [tasks, progress, entries]);

  // 필터링 및 검색
  const filteredRecords = useMemo(() => {
    let result = records;

    // 타입 필터
    if (filter !== 'all') {
      result = result.filter((item) => item.type === filter);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.subtitle?.toLowerCase().includes(query) ||
          item.date.includes(query)
      );
    }

    return result;
  }, [records, filter, searchQuery]);

  // 날짜별 그룹핑
  const groupedRecords = useMemo(() => {
    const groups: { date: string; items: RecordItem[] }[] = [];
    let currentDate = '';
    let currentGroup: RecordItem[] = [];

    filteredRecords.forEach((item) => {
      if (item.date !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, items: currentGroup });
        }
        currentDate = item.date;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, items: currentGroup });
    }

    return groups;
  }, [filteredRecords]);

  const handleRecordPress = useCallback((item: RecordItem) => {
    if (item.type === 'diary') {
      router.push({
        pathname: '/diary/[date]',
        params: { date: item.date },
      });
    } else {
      router.push({
        pathname: '/day/[date]',
        params: { date: item.date },
      });
    }
  }, []);

  const renderRecordItem = useCallback(
    ({ item }: { item: RecordItem }) => (
      <TouchableOpacity style={styles.recordItem} onPress={() => handleRecordPress(item)}>
        <Text style={styles.recordEmoji}>{item.emoji}</Text>
        <View style={styles.recordContent}>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.recordSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>
        <Text style={styles.recordArrow}>›</Text>
      </TouchableOpacity>
    ),
    [handleRecordPress]
  );

  const renderGroup = useCallback(
    ({ item }: { item: { date: string; items: RecordItem[] } }) => (
      <View style={styles.groupContainer}>
        <Text style={styles.groupDate}>{item.date}</Text>
        {item.items.map((record) => (
          <View key={record.id}>{renderRecordItem({ item: record })}</View>
        ))}
      </View>
    ),
    [renderRecordItem]
  );

  const stats = useMemo(() => {
    const recentDays = getRecentDays(7);
    const activeDays = new Set(records.map((r) => r.date)).size;

    return {
      totalRecords: records.length,
      activeDays,
      thisWeek: records.filter((r) => recentDays.some((d) => d.date === r.date)).length,
    };
  }, [records]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRecords}</Text>
            <Text style={styles.statLabel}>전체 기록</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeDays}</Text>
            <Text style={styles.statLabel}>활동한 날</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </View>
        </View>

        <Searchbar
          placeholder="기록 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        <View style={styles.filterRow}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterChip}
            textStyle={filter === 'all' ? styles.filterChipTextSelected : styles.filterChipText}
          >
            전체
          </Chip>
          <Chip
            selected={filter === 'todo'}
            onPress={() => setFilter('todo')}
            style={styles.filterChip}
            textStyle={filter === 'todo' ? styles.filterChipTextSelected : styles.filterChipText}
          >
            할 일
          </Chip>
          <Chip
            selected={filter === 'learn'}
            onPress={() => setFilter('learn')}
            style={styles.filterChip}
            textStyle={filter === 'learn' ? styles.filterChipTextSelected : styles.filterChipText}
          >
            학습
          </Chip>
          <Chip
            selected={filter === 'diary'}
            onPress={() => setFilter('diary')}
            style={styles.filterChip}
            textStyle={filter === 'diary' ? styles.filterChipTextSelected : styles.filterChipText}
          >
            일기
          </Chip>
        </View>
      </View>

      {groupedRecords.length > 0 ? (
        <FlatList
          data={groupedRecords}
          renderItem={renderGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>
            {searchQuery || filter !== 'all' ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
          </Text>
          <Text style={styles.emptySubtext}>할 일을 완료하고 학습을 시작해보세요!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  filterChip: {
    marginRight: SIZES.spacing.xs,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  filterChipTextSelected: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.sm,
  },
  groupContainer: {
    marginBottom: SIZES.spacing.md,
  },
  groupDate: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.borderRadius.xl,
    borderBottomRightRadius: SIZES.borderRadius.xl,
    paddingBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.sm,
  },
  listContent: {
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xxl,
  },
  recordArrow: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  recordContent: {
    flex: 1,
  },
  recordEmoji: {
    fontSize: 20,
    marginRight: SIZES.spacing.md,
  },
  recordItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    flexDirection: 'row',
    marginBottom: SIZES.spacing.xs,
    marginHorizontal: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  recordSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  recordTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  searchInput: {
    fontSize: SIZES.fontSize.md,
  },
  searchbar: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    elevation: 0,
    marginTop: SIZES.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  statValue: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.spacing.sm,
  },
});
