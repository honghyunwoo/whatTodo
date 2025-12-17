/**
 * Activity Detail Screen - Phase 0.5 Enhanced
 * 학습 활동 상세 화면 with SessionCompleteModal
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
  SessionCompleteModal,
} from '@/components/learn';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { useStreakStore } from '@/store/streakStore';
import { notificationService } from '@/services/notificationService';
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
  loadWeekActivities,
  preloadLevel,
} from '@/utils/activityLoader';

// Activity types for navigation
const ACTIVITY_TYPES: ActivityType[] = [
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
  const streak = useStreakStore((state) => state.currentStreak);
  const updateStreak = useStreakStore((state) => state.updateStreak);

  // Session complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

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

  // Get next activity type for "one more" feature
  const getNextActivity = useCallback(() => {
    if (!type || !weekId) return null;

    const currentIndex = ACTIVITY_TYPES.indexOf(type as ActivityType);
    if (currentIndex === -1) return null;

    // Try next activity in same week
    for (let i = currentIndex + 1; i < ACTIVITY_TYPES.length; i++) {
      const nextType = ACTIVITY_TYPES[i];
      const nextActivity = loadActivity(currentLevel, nextType, weekId);
      if (nextActivity) {
        return { type: nextType, weekId };
      }
    }

    // Try first activity in next week
    const weekNum = parseInt(weekId.replace('week-', ''), 10);
    if (weekNum < 8) {
      const nextWeekId = `week-${weekNum + 1}`;
      const nextWeekActivities = loadWeekActivities(currentLevel, nextWeekId);
      if (nextWeekActivities.length > 0) {
        return { type: nextWeekActivities[0].type, weekId: nextWeekId };
      }
    }

    return null;
  }, [type, weekId, currentLevel]);

  const handleComplete = useCallback(
    async (score: number, xpEarned?: number) => {
      if (activity && weekId && type) {
        markActivityComplete(activity.id, weekId, type as ActivityType, score);
        updateStreak(); // Update streak on completion
      }

      // Handle notification updates
      await notificationService.onLearningComplete(streak + 1);

      // Show completion modal
      setSessionScore(score);
      setSessionXP(xpEarned || Math.round(score / 10) * 10); // Fallback XP calculation
      setShowCompleteModal(true);
    },
    [activity, weekId, type, markActivityComplete, updateStreak, streak]
  );

  const handleOneMore = useCallback(() => {
    setShowCompleteModal(false);

    const nextActivity = getNextActivity();
    if (nextActivity) {
      // Navigate to next activity
      router.replace({
        pathname: '/learn/[type]',
        params: { type: nextActivity.type, weekId: nextActivity.weekId },
      });
    } else {
      // No more activities, go back to learn screen
      router.back();
    }
  }, [getNextActivity]);

  const handleGoHome = useCallback(() => {
    setShowCompleteModal(false);
    router.back();
  }, []);

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

      {/* Session Complete Modal */}
      <SessionCompleteModal
        visible={showCompleteModal}
        score={sessionScore}
        xpEarned={sessionXP}
        streak={streak}
        perfectScore={sessionScore === 100}
        activityType={type as string}
        onOneMore={handleOneMore}
        onGoHome={handleGoHome}
      />
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
