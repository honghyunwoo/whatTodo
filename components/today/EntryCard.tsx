/**
 * EntryCard - 타임라인 항목 카드 (리디자인)
 *
 * Soft Brutalism + 한지 스타일:
 * - 우아한 카드 디자인
 * - 타입별 색상 악센트
 * - 인장 스타일 체크박스
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

import { PALETTE, TYPOGRAPHY, SPACE, RADIUS, SHADOW, withOpacity } from '@/constants/design';
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
  index?: number;
}

// 타입별 설정
const TYPE_CONFIG = {
  todo: {
    icon: 'checkbox-outline' as const,
    iconDone: 'checkbox' as const,
    color: PALETTE.functional.todo,
    label: '할일',
    emoji: '✓',
  },
  memo: {
    icon: 'document-text-outline' as const,
    iconDone: 'document-text-outline' as const,
    color: PALETTE.functional.memo,
    label: '메모',
    emoji: '📝',
  },
  diary: {
    icon: 'book-outline' as const,
    iconDone: 'book-outline' as const,
    color: PALETTE.functional.diary,
    label: '일기',
    emoji: '📖',
  },
};

export function EntryCard({ entry, index = 0 }: EntryCardProps) {
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
      router.push(`/diary/${entry.data.date}`);
    }
  }, [entry, router]);

  // 할일 카드
  if (entry.type === 'todo') {
    const task = entry.data;
    const isCompleted = task.completed;

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 50).duration(300)}
        layout={Layout.springify()}
        style={styles.container}
      >
        {/* 시간 + 타입 표시 */}
        <View style={styles.timeRow}>
          <Text style={styles.time}>{entry.time}</Text>
          <View style={[styles.typeBadge, { backgroundColor: withOpacity(config.color, 0.12) }]}>
            <Text style={styles.typeEmoji}>{config.emoji}</Text>
            <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        {/* 카드 */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            SHADOW.sm,
            isCompleted && styles.cardCompleted,
            pressed && styles.cardPressed,
          ]}
          onPress={handlePress}
        >
          {/* 왼쪽 악센트 바 */}
          <View style={[styles.cardAccent, { backgroundColor: config.color }]} />

          {/* 체크박스 - 인장 스타일 */}
          <Pressable
            style={[
              styles.checkbox,
              {
                borderColor: isCompleted ? config.color : PALETTE.paper.aged,
                backgroundColor: isCompleted ? config.color : PALETTE.paper.cream,
              },
            ]}
            onPress={handleToggleTodo}
            hitSlop={12}
          >
            {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </Pressable>

          <View style={styles.content}>
            <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={2}>
              {task.title}
            </Text>
            {task.subtasks && task.subtasks.length > 0 && (
              <Text style={styles.subtitle}>
                서브태스크 {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </Text>
            )}
          </View>

          <View style={styles.chevronWrapper}>
            <Ionicons name="chevron-forward" size={18} color={PALETTE.ink.light} />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // 메모/일기 카드
  const diaryEntry = entry.data;
  const isDiaryType = entry.type === 'diary';
  const moodConfig = diaryEntry.mood ? MOOD_CONFIG[diaryEntry.mood] : null;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      style={styles.container}
    >
      {/* 시간 + 타입 표시 */}
      <View style={styles.timeRow}>
        <Text style={styles.time}>{entry.time}</Text>
        <View style={[styles.typeBadge, { backgroundColor: withOpacity(config.color, 0.12) }]}>
          <Text style={styles.typeEmoji}>{config.emoji}</Text>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        {moodConfig && (
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
          </View>
        )}
      </View>

      {/* 카드 */}
      <Pressable
        style={({ pressed }) => [styles.card, SHADOW.sm, pressed && styles.cardPressed]}
        onPress={handlePress}
      >
        {/* 왼쪽 악센트 바 */}
        <View style={[styles.cardAccent, { backgroundColor: config.color }]} />

        <View style={styles.contentFull}>
          {isDiaryType && diaryEntry.title !== '오늘의 일기' && (
            <Text style={styles.diaryTitle} numberOfLines={1}>
              {diaryEntry.title}
            </Text>
          )}
          <Text style={styles.contentText} numberOfLines={3}>
            {diaryEntry.content}
          </Text>

          {diaryEntry.photos && diaryEntry.photos.length > 0 && (
            <Text style={styles.photoMeta}>📷 사진 {diaryEntry.photos.length}장</Text>
          )}

          {/* 태그 */}
          {diaryEntry.tags && diaryEntry.tags.length > 0 && (
            <View style={styles.tags}>
              {diaryEntry.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.chevronWrapper}>
          <Ionicons name="chevron-forward" size={18} color={PALETTE.ink.light} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACE.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    marginBottom: SPACE.xs,
    paddingHorizontal: SPACE.xs,
  },
  time: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.light,
    letterSpacing: 0.5,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  typeEmoji: {
    fontSize: 11,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  moodBadge: {
    marginLeft: 'auto',
  },
  moodEmoji: {
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACE.md,
    gap: SPACE.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.paper.aged,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACE.xs,
  },
  content: {
    flex: 1,
  },
  contentFull: {
    flex: 1,
    paddingLeft: SPACE.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.black,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: PALETTE.ink.light,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.xs,
    color: PALETTE.ink.light,
    marginTop: 2,
  },
  diaryTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: PALETTE.ink.black,
    marginBottom: SPACE.xxs,
  },
  contentText: {
    fontSize: TYPOGRAPHY.size.md,
    lineHeight: 22,
    color: PALETTE.ink.dark,
  },
  photoMeta: {
    color: PALETTE.ink.light,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACE.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE.xs,
    marginTop: SPACE.sm,
  },
  tag: {
    backgroundColor: PALETTE.paper.cream,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: PALETTE.paper.aged,
  },
  tagText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: PALETTE.ink.medium,
  },
  chevronWrapper: {
    width: 24,
    alignItems: 'center',
  },
});

export default EntryCard;
