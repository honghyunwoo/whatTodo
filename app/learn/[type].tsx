/**
 * Activity Detail Screen
 * 학습 활동 상세 화면
 */

import { Stack, useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import {
  GrammarView,
  ListeningView,
  ReadingView,
  SpeakingView,
  VocabularyView,
  WritingView,
} from '@/components/learn';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { useStreakStore } from '@/store/streakStore';
import {
  ActivityType,
  GrammarActivity,
  ListeningActivity,
  ReadingActivity,
  SpeakingActivity,
  VocabularyActivity,
  WritingActivity,
} from '@/types/activity';
import {
  getActivityLabel,
  isLevelLoaded,
  loadActivity,
  preloadLevel,
} from '@/utils/activityLoader';

// Activity types for navigation (reserved for future use)
const _ACTIVITY_TYPES: ActivityType[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'speaking',
  'writing',
];

export default function ActivityDetailScreen() {
  const { type, weekId } = useLocalSearchParams<{ type: ActivityType; weekId: string }>();
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const markActivityComplete = useLearnStore((state) => state.markActivityComplete);
  const updateStreak = useStreakStore((state) => state.updateStreak);

  // 레벨 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(!isLevelLoaded(currentLevel));

  // 레벨 변경 시 데이터 프리로드
  useEffect(() => {
    if (!isLevelLoaded(currentLevel)) {
      setIsLoading(true);
      preloadLevel(currentLevel).then(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [currentLevel]);

  const activity = useMemo(() => {
    if (!type || !weekId || isLoading) return null;
    return loadActivity(currentLevel, type as ActivityType, weekId);
  }, [currentLevel, type, weekId, isLoading]);

  // Note: getNextActivity reserved for future "one more" feature
  // See git history for implementation

  const handleComplete = useCallback(
    (score: number, xpEarned?: number) => {
      if (activity && weekId && type) {
        markActivityComplete(activity.id, weekId, type as ActivityType, score);
        updateStreak(); // Update streak on completion
      }

      // Navigate back to learn screen
      router.back();
    },
    [activity, weekId, type, markActivityComplete, updateStreak]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>학습 콘텐츠 로딩 중...</Text>
      </View>
    );
  }

  if (!activity || !type) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>활동을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const title = `${weekId?.replace('week-', 'Week ')} - ${getActivityLabel(type as ActivityType)}`;

  const renderActivityView = () => {
    switch (activity.type) {
      case 'vocabulary':
        return (
          <VocabularyView activity={activity as VocabularyActivity} onComplete={handleComplete} />
        );
      case 'grammar':
        return <GrammarView activity={activity as GrammarActivity} onComplete={handleComplete} />;
      case 'listening':
        return (
          <ListeningView
            activity={activity as ListeningActivity}
            onComplete={(score) => handleComplete(score)}
          />
        );
      case 'reading':
        return (
          <ReadingView
            activity={activity as ReadingActivity}
            onComplete={(score) => handleComplete(score)}
          />
        );
      case 'speaking':
        return (
          <SpeakingView
            activity={activity as SpeakingActivity}
            onComplete={(score) => handleComplete(score)}
          />
        );
      case 'writing':
        return (
          <WritingView
            activity={activity as WritingActivity}
            onComplete={(score) => handleComplete(score)}
          />
        );
      default:
        return <Text>지원하지 않는 활동 유형입니다.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title,
          headerLeft: () => (
            <IconButton icon="arrow-left" onPress={handleBack} iconColor={COLORS.text} />
          ),
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text, fontSize: SIZES.fontSize.lg },
        }}
      />
      {renderActivityView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
  },
});
