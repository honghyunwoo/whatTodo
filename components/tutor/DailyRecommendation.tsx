/**
 * DailyRecommendation - 오늘의 추천 컴포넌트
 *
 * Todo와 학습 상태를 기반으로 맞춤 학습 추천
 * - Todo 키워드 기반 팩 추천
 * - 약점 영역 집중 추천
 * - 복습 필요 항목 알림
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Card, Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { COLORS } from '@/constants/colors';
import { packLoader } from '@/services/packLoader';
import { learningAnalyzer } from '@/services/learningAnalyzer';
import { useLearnStore } from '@/store/learnStore';
import { useTaskStore } from '@/store/taskStore';
import { useSrsStore } from '@/store/srsStore';
import { feedbackService } from '@/services/feedbackService';

interface DailyRecommendationProps {
  maxItems?: number;
}

interface RecommendationItem {
  id: string;
  type: 'pack' | 'review' | 'weakness' | 'streak';
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
  priority: number;
  badge?: string;
}

export function DailyRecommendation({ maxItems = 3 }: DailyRecommendationProps) {
  const router = useRouter();
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const tasks = useTaskStore((state) => state.tasks);
  const dueCount = useSrsStore((state) => state.getDueWordCount());

  const recommendations = useMemo(() => {
    const items: RecommendationItem[] = [];

    // 1. 복습 필요 항목이 있으면 최우선
    if (dueCount > 0) {
      items.push({
        id: 'review-due',
        type: 'review',
        title: '복습 필요!',
        subtitle: `${dueCount}개 항목이 복습을 기다려요`,
        icon: 'refresh-circle',
        color: '#FF9800',
        priority: 1,
        badge: String(dueCount),
        action: () => router.push('/(tabs)/learn'),
      });
    }

    // 2. Todo 기반 추천
    const todayTasks = tasks.filter((task) => {
      if (task.completed) return false;
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate === today;
    });

    if (todayTasks.length > 0) {
      const recommendedPacks = packLoader.recommendPacksFromTodos(todayTasks, currentLevel);
      if (recommendedPacks.length > 0) {
        const pack = recommendedPacks[0];
        items.push({
          id: `pack-${pack.id}`,
          type: 'pack',
          title: pack.topic,
          subtitle: `오늘 할 일과 관련된 표현을 배워요`,
          icon: 'book',
          color: '#4CAF50',
          priority: 2,
          action: () => router.push('/(tabs)/learn'),
        });
      }
    }

    // 3. 약점 영역 추천
    const analysis = learningAnalyzer.analyze();
    if (analysis && analysis.weaknesses.length > 0) {
      const weakSkill = analysis.weaknesses[0];
      items.push({
        id: 'weakness-focus',
        type: 'weakness',
        title: `${weakSkill} 집중 훈련`,
        subtitle: '약점을 보완하면 실력이 쑥쑥!',
        icon: 'fitness',
        color: '#E91E63',
        priority: 3,
        action: () => router.push('/(tabs)/learn'),
      });
    }

    // 4. 레벨별 기본 추천
    const levelPacks = packLoader.getPacksByLevel(currentLevel);
    if (levelPacks.length > 0 && items.length < maxItems) {
      const randomPack = packLoader.loadPack(
        levelPacks[Math.floor(Math.random() * levelPacks.length)]
      );
      if (randomPack) {
        items.push({
          id: `level-pack-${randomPack.id}`,
          type: 'pack',
          title: randomPack.topic,
          subtitle: `${currentLevel} 레벨 추천 팩`,
          icon: 'sparkles',
          color: '#9C27B0',
          priority: 4,
          action: () => router.push('/(tabs)/learn'),
        });
      }
    }

    // 우선순위 정렬 및 개수 제한
    return items.sort((a, b) => a.priority - b.priority).slice(0, maxItems);
  }, [currentLevel, tasks, dueCount, maxItems, router]);

  if (recommendations.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
          <Text style={styles.emptyTitle}>오늘 할 일 완료!</Text>
          <Text style={styles.emptySubtitle}>자유롭게 학습하거나 휴식을 취하세요</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={20} color={COLORS.primary} />
        <Text style={styles.headerTitle}>오늘의 추천</Text>
      </View>

      {recommendations.map((item, index) => (
        <RecommendationCard key={item.id} item={item} index={index} />
      ))}
    </View>
  );
}

interface RecommendationCardProps {
  item: RecommendationItem;
  index: number;
}

function RecommendationCard({ item, index }: RecommendationCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    feedbackService.tap();
    item.action();
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()} style={animatedStyle}>
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
              {item.badge && (
                <Badge size={16} style={[styles.badge, { backgroundColor: item.color }]}>
                  {item.badge}
                </Badge>
              )}
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Card.Content>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
  },
  card: {
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.sm,
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
  },
  emptyCard: {
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
    ...SHADOWS.sm,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 4,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginTop: SIZES.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
});
