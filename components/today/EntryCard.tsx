/**
 * EntryCard - 타임라인 항목 카드
 *
 * 메모/할일/일기를 타임라인에서 표시
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/types/task';
import { DiaryEntry, MOOD_CONFIG } from '@/store/diaryStore';
import { useTaskStore } from '@/store/taskStore';

// 통합 항목 타입
export type TimelineEntry =
  | { type: 'todo'; data: Task; time: string }
  | { type: 'memo'; data: DiaryEntry; time: string }
  | { type: 'diary'; data: DiaryEntry; time: string };

interface EntryCardProps {
  entry: TimelineEntry;
}

// 시간 포맷 (HH:mm → 오전/오후 h:mm)
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

// 타입별 설정
const TYPE_CONFIG = {
  todo: {
    icon: 'checkbox-outline' as const,
    iconDone: 'checkbox' as const,
    color: '#10B981',
    label: '할일',
  },
  memo: {
    icon: 'create-outline' as const,
    iconDone: 'create-outline' as const,
    color: '#3B82F6',
    label: '메모',
  },
  diary: {
    icon: 'book-outline' as const,
    iconDone: 'book-outline' as const,
    color: '#8B5CF6',
    label: '일기',
  },
};

export function EntryCard({ entry }: EntryCardProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const toggleComplete = useTaskStore((state) => state.toggleComplete);

  const config = TYPE_CONFIG[entry.type];

  // 할일 체크 토글
  const handleToggleTodo = useCallback(() => {
    if (entry.type === 'todo') {
      toggleComplete(entry.data.id);
    }
  }, [entry, toggleComplete]);

  // 카드 클릭
  const handlePress = useCallback(() => {
    if (entry.type === 'todo') {
      router.push(`/task/${entry.data.id}`);
    } else if (entry.type === 'diary' || entry.type === 'memo') {
      // 일기/메모 상세 페이지로 (나중에 구현)
      router.push(`/diary/${entry.data.date}`);
    }
  }, [entry, router]);

  // 할일 카드
  if (entry.type === 'todo') {
    const task = entry.data;
    const isCompleted = task.completed;

    return (
      <View style={styles.container}>
        {/* 시간 + 타입 표시 */}
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: colors.textSecondary }]}>{entry.time}</Text>
          <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
            <Ionicons
              name={isCompleted ? config.iconDone : config.icon}
              size={12}
              color={config.color}
            />
            <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        {/* 카드 */}
        <Pressable
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            !isDark && SHADOWS.sm,
            isCompleted && styles.cardCompleted,
          ]}
          onPress={handlePress}
        >
          <Pressable
            style={[
              styles.checkbox,
              {
                borderColor: isCompleted ? config.color : colors.border,
                backgroundColor: isCompleted ? config.color : 'transparent',
              },
            ]}
            onPress={handleToggleTodo}
            hitSlop={8}
          >
            {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </Pressable>

          <View style={styles.content}>
            <Text
              style={[styles.title, { color: colors.text }, isCompleted && styles.titleCompleted]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.subtasks && task.subtasks.length > 0 && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                서브태스크 {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </Text>
            )}
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  // 메모/일기 카드
  const diaryEntry = entry.data;
  const isDiaryType = entry.type === 'diary';
  const moodConfig = diaryEntry.mood ? MOOD_CONFIG[diaryEntry.mood] : null;

  return (
    <View style={styles.container}>
      {/* 시간 + 타입 표시 */}
      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{entry.time}</Text>
        <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        {moodConfig && <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>}
      </View>

      {/* 카드 */}
      <Pressable
        style={[
          styles.card,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
          !isDark && SHADOWS.sm,
        ]}
        onPress={handlePress}
      >
        <View style={[styles.cardAccent, { backgroundColor: config.color }]} />

        <View style={styles.contentFull}>
          {isDiaryType && diaryEntry.title !== '오늘의 일기' && (
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {diaryEntry.title}
            </Text>
          )}
          <Text style={[styles.contentText, { color: colors.text }]} numberOfLines={3}>
            {diaryEntry.content}
          </Text>

          {/* 태그 */}
          {diaryEntry.tags && diaryEntry.tags.length > 0 && (
            <View style={styles.tags}>
              {diaryEntry.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}
                >
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.xs,
  },
  time: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.sm,
    gap: 4,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  moodEmoji: {
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.sm,
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentFull: {
    flex: 1,
    paddingLeft: SIZES.spacing.sm,
  },
  title: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  subtitle: {
    fontSize: SIZES.fontSize.xs,
  },
  contentText: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.sm,
  },
  tag: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.full,
  },
  tagText: {
    fontSize: SIZES.fontSize.xs,
  },
});

export default EntryCard;
