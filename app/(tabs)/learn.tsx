/**
 * Learn Screen - Phase 0.5 Enhanced
 * 학습 화면 with DailyGoalProgress & StreakWarning
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Modal, Portal, Text } from 'react-native-paper';

import { ActivityCard, StatsView, WeekSelector } from '@/components/learn';
import { BadgeShowcase } from '@/components/reward';
import { DailyGoalProgress, StreakWarning } from '@/components/common';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useStreakStore } from '@/store/streakStore';
import { useUserStore } from '@/store/userStore';
import { useRewardStore } from '@/store/rewardStore';
import { ActivityType } from '@/types/activity';
import { isLevelLoaded, loadWeekActivities, preloadLevel } from '@/utils/activityLoader';

const ACTIVITY_TYPES: ActivityType[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'speaking',
  'writing',
];

export default function LearnScreen() {
  const currentWeek = useLearnStore((state) => state.currentWeek);
  const setCurrentWeek = useLearnStore((state) => state.setCurrentWeek);
  const progress = useLearnStore((state) => state.progress);
  const storeWeekProgress = useLearnStore((state) => state.weekProgress);
  const currentLevel = useLearnStore((state) => state.currentLevel);

  // Streak store
  const streak = useStreakStore((state) => state.currentStreak);
  const checkStreak = useStreakStore((state) => state.checkStreak);
  const shouldShowWarning = useStreakStore((state) => state.shouldShowWarning);

  // User store
  const dailyGoal = useUserStore((state) => state.dailyGoal);

  // Reward store for XP
  const stars = useRewardStore((state) => state.stars);

  // SRS 복습 대기 수
  const getWordsForReview = useSrsStore((state) => state.getWordsForReview);
  const dueCount = useMemo(() => getWordsForReview().length, [getWordsForReview]);

  // 모달 상태
  const [showStats, setShowStats] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showStreakWarning, setShowStreakWarning] = useState(false);

  // Check streak on mount
  useEffect(() => {
    checkStreak();
    // Check if we should show streak warning
    if (shouldShowWarning()) {
      setShowStreakWarning(true);
    }
  }, [checkStreak, shouldShowWarning]);

  // Calculate lessons completed today (simplified - count activities completed today)
  const lessonsToday = useMemo(() => {
    const today = new Date().toDateString();
    return progress.filter((p) => {
      if (!p.lastAttempt) return false;
      return new Date(p.lastAttempt).toDateString() === today && p.completed;
    }).length;
  }, [progress]);

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

  // 현재 주차의 활동 로드
  const weekActivities = useMemo(() => {
    if (isLoading) return [];
    return loadWeekActivities(currentLevel, currentWeek);
  }, [currentLevel, currentWeek, isLoading]);

  // 주차별 진행률 계산 (store 함수 대신 직접 계산하여 무한 루프 방지)
  const weekProgress = useMemo(() => {
    const progressMap: Record<string, number> = {};
    for (let i = 1; i <= 8; i++) {
      const weekId = `week-${i}`;
      const week = storeWeekProgress.find((w) => w.weekId === weekId);
      progressMap[weekId] = week ? Math.round((week.activitiesCompleted.length / 6) * 100) : 0;
    }
    return progressMap;
  }, [storeWeekProgress]);

  // 활동별 진행 상태 확인
  const getActivityProgress = useCallback(
    (type: ActivityType) => {
      const activity = weekActivities.find((a) => a.type === type);
      if (!activity) return { completed: false, score: 0 };

      const activityProgress = progress.find(
        (p) => p.activityId === activity.id && p.weekId === currentWeek
      );
      return {
        completed: activityProgress?.completed || false,
        score: activityProgress?.score || 0,
      };
    },
    [weekActivities, progress, currentWeek]
  );

  const handleActivityPress = useCallback(
    (type: ActivityType) => {
      router.push({
        pathname: '/learn/[type]',
        params: { type, weekId: currentWeek },
      });
    },
    [currentWeek]
  );

  const handleLevelTest = useCallback(() => {
    router.push('/level-test');
  }, []);

  const handleReview = useCallback(() => {
    router.push('/review');
  }, []);

  const handleStartLearning = useCallback(() => {
    setShowStreakWarning(false);
    // Navigate to first incomplete activity
    for (const type of ACTIVITY_TYPES) {
      const { completed } = getActivityProgress(type);
      if (!completed) {
        handleActivityPress(type);
        return;
      }
    }
    // All complete, go to first activity
    handleActivityPress(ACTIVITY_TYPES[0]);
  }, [getActivityProgress, handleActivityPress]);

  const currentProgress = weekProgress[currentWeek] || 0;

  return (
    <View style={styles.container}>
      {/* Daily Goal Progress - New Feature */}
      <DailyGoalProgress
        lessonsCompleted={lessonsToday}
        dailyGoal={dailyGoal}
        xpToday={stars}
        streak={streak}
        onPress={() => setShowStats(true)}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>오늘의 영어 한 조각</Text>
            <Text style={styles.subtitle}>
              {currentProgress === 0 ? '이번 주 기록 없음' : '천천히 쌓인 기록을 이어가요'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="chart-bar"
              iconColor={COLORS.text}
              size={24}
              onPress={() => setShowStats(true)}
              style={styles.headerButton}
            />
            <IconButton
              icon="medal"
              iconColor={COLORS.text}
              size={24}
              onPress={() => setShowBadges(true)}
              style={styles.headerButton}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLevelTest}>
            <IconButton
              icon="clipboard-check-outline"
              iconColor={COLORS.surface}
              size={20}
              style={styles.actionIcon}
            />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>레벨 체크</Text>
              <Text style={styles.actionSubtitle}>
                {currentLevel ? `지금: ${currentLevel.toUpperCase()}` : '현재 감각 살펴보기'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={handleReview}
          >
            <IconButton
              icon="cards-outline"
              iconColor={COLORS.surface}
              size={20}
              style={styles.actionIcon}
            />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>짧은 복습</Text>
              <Text style={styles.actionSubtitle}>
                {dueCount > 0 ? `${dueCount}개 준비됨` : '오늘은 가볍게 쉬어도 좋아요'}
              </Text>
            </View>
            {dueCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dueCount > 99 ? '99+' : dueCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <WeekSelector
        selectedWeek={currentWeek}
        onSelectWeek={setCurrentWeek}
        weekProgress={weekProgress}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>{currentWeek.replace('week-', '')}주차 기록 흐름</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${currentProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentProgress === 0
              ? '이번 주엔 아직 기록이 없어요.'
              : `${currentProgress}%만큼 기록이 쌓였어요.`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>학습 콘텐츠 로딩 중...</Text>
          </View>
        ) : (
          <View style={styles.activitiesGrid}>
            {ACTIVITY_TYPES.map((type) => {
              const activity = weekActivities.find((a) => a.type === type);
              const { completed } = getActivityProgress(type);

              if (!activity) return null;

              return (
                <ActivityCard
                  key={type}
                  type={type}
                  progress={completed ? 100 : 0}
                  completed={completed}
                  onPress={() => handleActivityPress(type)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Stats Modal */}
      <Portal>
        <Modal
          visible={showStats}
          onDismiss={() => setShowStats(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <StatsView onClose={() => setShowStats(false)} />
        </Modal>
      </Portal>

      {/* Badges Modal */}
      <Portal>
        <Modal
          visible={showBadges}
          onDismiss={() => setShowBadges(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BadgeShowcase onClose={() => setShowBadges(false)} />
        </Modal>
      </Portal>

      {/* Streak Warning Modal */}
      <StreakWarning
        visible={showStreakWarning}
        onDismiss={() => setShowStreakWarning(false)}
        onStartLearning={handleStartLearning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.lg,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
  },
  actionIcon: {
    margin: 0,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: SIZES.fontSize.xs,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.borderRadius.full,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xl,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    margin: 0,
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
    margin: 0,
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
  },
  progressBarContainer: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 8,
    marginVertical: SIZES.spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  progressLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
  },
  progressText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  reviewButton: {
    backgroundColor: COLORS.secondary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
  },
});
