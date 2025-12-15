import { Stack, useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
import {
  Activity,
  ActivityType,
  GrammarActivity,
  ListeningActivity,
  ReadingActivity,
  SpeakingActivity,
  VocabularyActivity,
  WritingActivity,
} from '@/types/activity';
import { getActivityLabel, loadActivity } from '@/utils/activityLoader';

export default function ActivityDetailScreen() {
  const { type, weekId } = useLocalSearchParams<{ type: ActivityType; weekId: string }>();
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const markActivityComplete = useLearnStore((state) => state.markActivityComplete);

  const activity = useMemo(() => {
    if (!type || !weekId) return null;
    return loadActivity(currentLevel, type as ActivityType, weekId);
  }, [currentLevel, type, weekId]);

  const handleComplete = useCallback(
    (score: number) => {
      if (activity && weekId && type) {
        markActivityComplete(activity.id, weekId, type as ActivityType, score);
      }
    },
    [activity, weekId, type, markActivityComplete]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

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
          <VocabularyView
            activity={activity as VocabularyActivity}
            onComplete={handleComplete}
          />
        );
      case 'grammar':
        return (
          <GrammarView activity={activity as GrammarActivity} onComplete={handleComplete} />
        );
      case 'listening':
        return (
          <ListeningView
            activity={activity as ListeningActivity}
            onComplete={handleComplete}
          />
        );
      case 'reading':
        return (
          <ReadingView activity={activity as ReadingActivity} onComplete={handleComplete} />
        );
      case 'speaking':
        return (
          <SpeakingView
            activity={activity as SpeakingActivity}
            onComplete={handleComplete}
          />
        );
      case 'writing':
        return (
          <WritingView activity={activity as WritingActivity} onComplete={handleComplete} />
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
