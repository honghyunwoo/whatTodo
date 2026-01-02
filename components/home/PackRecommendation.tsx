/**
 * PackRecommendation - Todo 기반 학습 팩 추천
 *
 * 사용자의 오늘 할 일에서 키워드를 추출하여
 * 관련 학습 팩을 추천하는 컴포넌트
 */

import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useTaskStore } from '@/store/taskStore';
import { useUserStore } from '@/store/userStore';
import { packLoader } from '@/services/packLoader';
import type { ContentPack } from '@/types/contentPack';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface PackCardProps {
  pack: ContentPack;
  index: number;
  onPress: (packId: string) => void;
}

// ─────────────────────────────────────
// Sub Components
// ─────────────────────────────────────

const PackCard = React.memo(function PackCard({ pack, index, onPress }: PackCardProps) {
  const { colors, isDark } = useTheme();

  const getTopicIcon = (topic: string): keyof typeof Ionicons.glyphMap => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('greet') || topicLower.includes('intro')) return 'hand-left';
    if (topicLower.includes('number') || topicLower.includes('count')) return 'calculator';
    if (topicLower.includes('daily') || topicLower.includes('routine')) return 'sunny';
    if (topicLower.includes('hospital') || topicLower.includes('health')) return 'medkit';
    if (topicLower.includes('coffee') || topicLower.includes('cafe')) return 'cafe';
    if (topicLower.includes('shop') || topicLower.includes('store')) return 'cart';
    if (topicLower.includes('travel') || topicLower.includes('trip')) return 'airplane';
    return 'book';
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <Pressable onPress={() => onPress(pack.id)}>
        <Card style={[styles.packCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
          <Card.Content style={styles.packContent}>
            <View style={[styles.iconBg, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name={getTopicIcon(pack.topic)} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.packInfo}>
              <Text style={[styles.packTopic, { color: colors.text }]} numberOfLines={1}>
                {pack.topic}
              </Text>
              <Text style={[styles.packMeta, { color: colors.textSecondary }]}>
                {pack.level} · {pack.estimatedMinutes}분
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Card.Content>
        </Card>
      </Pressable>
    </Animated.View>
  );
});

// ─────────────────────────────────────
// Main Component
// ─────────────────────────────────────

export function PackRecommendation() {
  const router = useRouter();
  const { colors } = useTheme();

  // Store
  const tasks = useTaskStore((state) => state.tasks);
  const userLevel = useUserStore((state) => state.preferredLevel);

  // 오늘 할 일 필터링
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === today && !task.completed;
    });
  }, [tasks]);

  // 팩 추천 (Todo 기반)
  const recommendedPacks = useMemo(() => {
    if (todayTasks.length === 0) {
      // Todo가 없으면 레벨별 기본 팩 추천
      const levelPacks = packLoader.getPacksByLevel(userLevel);
      return packLoader.loadPacks(levelPacks.slice(0, 3));
    }

    // Todo 기반 추천
    return packLoader.recommendPacksFromTodos(todayTasks, userLevel);
  }, [todayTasks, userLevel]);

  // 팩 선택 핸들러
  const handlePackPress = useCallback(
    (packId: string) => {
      // TODO: 팩 기반 학습 화면으로 이동
      // 현재는 학습 탭으로 이동
      router.push('/(tabs)/learn');
    },
    [router]
  );

  // 추천 팩이 없으면 표시하지 않음
  if (recommendedPacks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={18} color={COLORS.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {todayTasks.length > 0 ? '오늘 할 일 맞춤 학습' : '추천 학습'}
          </Text>
        </View>
        {todayTasks.length > 0 && (
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {todayTasks.length}개 할 일 기반
          </Text>
        )}
      </View>

      {/* 팩 리스트 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.packList}
      >
        {recommendedPacks.map((pack, index) => (
          <PackCard key={pack.id} pack={pack} index={index} onPress={handlePackPress} />
        ))}
      </ScrollView>

      {/* 설명 */}
      {todayTasks.length > 0 && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          할 일에서 &quot;병원&quot;, &quot;카페&quot; 등의 키워드를 감지해 관련 영어 학습을
          추천해요
        </Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: SIZES.fontSize.sm,
  },
  packList: {
    paddingHorizontal: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  packCard: {
    width: 200,
    borderRadius: SIZES.borderRadius.md,
  },
  packContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.sm,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
  },
  packTopic: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  packMeta: {
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  hint: {
    fontSize: SIZES.fontSize.xs,
    paddingHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
    fontStyle: 'italic',
  },
});

export default PackRecommendation;
