/**
 * Learn Screen
 * 학습 화면 - 레슨 기반 UI (레거시 Week 모드 병행)
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Modal, Portal, SegmentedButtons, Text } from 'react-native-paper';

import { ActivityCard, LessonSelector, UnitSelector, WeekSelector } from '@/components/learn';
import { LearningDashboard } from '@/components/dashboard/LearningDashboard';
import { BadgeShowcase } from '@/components/reward';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useLearnStore } from '@/store/learnStore';
import { useLessonStore } from '@/store/lessonStore';
import { useSrsStore } from '@/store/srsStore';
import type { ActivityType } from '@/types/activity';
import type { LessonCardData, UnitCardData } from '@/types/lesson';
import { isLevelLoaded, loadWeekActivities, preloadLevel } from '@/utils/activityLoader';
import {
  getLessonCardData,
  getLevelMeta,
  getUnitCardData,
  loadLevelMeta,
  isLevelMetaLoaded,
} from '@/utils/lessonLoader';

const ACTIVITY_TYPES: ActivityType[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'speaking',
  'writing',
];

type ViewMode = 'lesson' | 'week';

export default function LearnScreen() {
  // Legacy week-based state
  const currentWeek = useLearnStore((state) => state.currentWeek);
  const setCurrentWeek = useLearnStore((state) => state.setCurrentWeek);
  const progress = useLearnStore((state) => state.progress);
  const storeWeekProgress = useLearnStore((state) => state.weekProgress);
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const streak = useLearnStore((state) => state.streak);

  // Lesson-based state
  const lessonProgress = useLessonStore((state) => state.lessonProgress);
  const getLessonProgress = useLessonStore((state) => state.getLessonProgress);
  const isLessonUnlocked = useLessonStore((state) => state.isLessonUnlocked);

  const getWordsForReview = useSrsStore((state) => state.getWordsForReview);
  const dueCount = useMemo(() => getWordsForReview().length, [getWordsForReview]);

  const [showStats, setShowStats] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLevelLoaded(currentLevel));

  // New lesson-based UI state
  const [viewMode, setViewMode] = useState<ViewMode>('lesson');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Load activity data (legacy)
      if (!isLevelLoaded(currentLevel)) {
        await preloadLevel(currentLevel);
      }

      // Load lesson metadata (new)
      if (!isLevelMetaLoaded(currentLevel)) {
        await loadLevelMeta(currentLevel);
      }

      // Set default selected unit
      const levelMeta = getLevelMeta(currentLevel);
      if (levelMeta && levelMeta.units.length > 0 && !selectedUnitId) {
        setSelectedUnitId(levelMeta.units[0].id);
      }

      setIsLoading(false);
    };

    loadData();
  }, [currentLevel]); // selectedUnitId 제거 - 무한 루프 방지

  const weekActivities = useMemo(() => {
    if (isLoading) return [];
    return loadWeekActivities(currentLevel, currentWeek);
  }, [currentLevel, currentWeek, isLoading]);

  const weekProgress = useMemo(() => {
    const progressMap: Record<string, number> = {};
    for (let i = 1; i <= 8; i++) {
      const weekId = `week-${i}`;
      const week = storeWeekProgress.find((w) => w.weekId === weekId);
      progressMap[weekId] = week ? Math.round((week.activitiesCompleted.length / 6) * 100) : 0;
    }
    return progressMap;
  }, [storeWeekProgress]);

  // Lesson-based data
  const unitCards = useMemo((): UnitCardData[] => {
    const levelMeta = getLevelMeta(currentLevel);
    if (!levelMeta) return [];

    return levelMeta.units
      .map((unit, index) => {
        const lessonsCompleted = lessonProgress
          .filter((p) => p.completed && unit.lessons?.some((l) => l.id === p.lessonId))
          .map((p) => ({ lessonId: p.lessonId, completed: true }));

        return getUnitCardData(currentLevel, index + 1, lessonsCompleted) as UnitCardData;
      })
      .filter(Boolean) as UnitCardData[];
  }, [currentLevel, lessonProgress]);

  const lessonCards = useMemo((): LessonCardData[] => {
    if (!selectedUnitId) return [];

    const levelMeta = getLevelMeta(currentLevel);
    if (!levelMeta) return [];

    const unit = levelMeta.units.find((u) => u.id === selectedUnitId);
    if (!unit) return [];

    return unit.lessons
      .map((lesson) => {
        const progress = getLessonProgress(lesson.id);
        const unlocked = isLessonUnlocked(lesson.id);

        return getLessonCardData(
          lesson.id,
          progress
            ? {
                completed: progress.completed,
                score: progress.score,
                activitiesCompleted: progress.activitiesCompleted,
              }
            : null,
          unlocked
        );
      })
      .filter(Boolean) as LessonCardData[];
  }, [currentLevel, selectedUnitId, lessonProgress, getLessonProgress, isLessonUnlocked]);

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

  const handleLessonPress = useCallback(
    (lessonId: string) => {
      setSelectedLessonId(lessonId);
      // Navigate to lesson detail (using legacy week route for now)
      // TODO: Create dedicated lesson route
      const lessonMeta = lessonCards.find((l) => l.id === lessonId);
      if (lessonMeta) {
        // For now, navigate to first activity type
        router.push({
          pathname: '/learn/[type]',
          params: { type: 'vocabulary', weekId: `week-${lessonMeta.lessonNumber}` },
        });
      }
    },
    [lessonCards]
  );

  const handleTakeTest = useCallback((lessonId: string) => {
    router.push({
      pathname: '/test/[testId]',
      params: { testId: `test-${lessonId}` },
    });
  }, []);

  const currentProgress = weekProgress[currentWeek] || 0;
  const completedToday = ACTIVITY_TYPES.filter(
    (type) => getActivityProgress(type).completed
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greeting}>오늘도 영어와 함께!</Text>
                <Text style={styles.levelBadge}>{currentLevel.toUpperCase()} 레벨</Text>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon="chart-bar"
                  iconColor={COLORS.text}
                  size={22}
                  onPress={() => setShowStats(true)}
                  style={styles.headerButton}
                />
                <IconButton
                  icon="medal"
                  iconColor={COLORS.text}
                  size={22}
                  onPress={() => setShowBadges(true)}
                  style={styles.headerButton}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>연속 학습</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.streakEmoji}>📚</Text>
                <Text style={styles.statValue}>{completedToday}/6</Text>
                <Text style={styles.statLabel}>오늘 완료</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.streakEmoji}>📈</Text>
                <Text style={styles.statValue}>{currentProgress}%</Text>
                <Text style={styles.statLabel}>주간 진행</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <TouchableOpacity style={styles.actionCard} onPress={handleLevelTest}>
            <View
              style={[styles.actionIconBg, { backgroundColor: COLORS.activity.vocabulary.light }]}
            >
              <Text style={styles.actionEmoji}>📋</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>레벨 테스트</Text>
              <Text style={styles.actionSubtitle}>나의 실력 확인하기</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleReview}>
            <View style={[styles.actionIconBg, { backgroundColor: COLORS.activity.grammar.light }]}>
              <Text style={styles.actionEmoji}>🔄</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>복습하기</Text>
              <Text style={styles.actionSubtitle}>
                {dueCount > 0 ? `${dueCount}개 복습 대기 중` : '모두 복습 완료!'}
              </Text>
            </View>
            {dueCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dueCount > 99 ? '99+' : dueCount}</Text>
              </View>
            )}
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            buttons={[
              { value: 'lesson', label: '레슨 모드', icon: 'book-open-variant' },
              { value: 'week', label: '주차 모드', icon: 'calendar-week' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {viewMode === 'lesson' ? (
          <>
            {/* Unit Selector */}
            <View style={styles.unitSelectorContainer}>
              <Text style={styles.sectionTitle}>유닛 선택</Text>
              {unitCards.length > 0 ? (
                <UnitSelector
                  units={unitCards}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={setSelectedUnitId}
                />
              ) : (
                <Text style={styles.emptyText}>레슨 데이터를 불러오는 중...</Text>
              )}
            </View>

            {/* Lesson List */}
            <View style={styles.lessonSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {unitCards.find((u) => u.id === selectedUnitId)?.title || '레슨'}
                </Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>레슨 로딩 중...</Text>
                </View>
              ) : lessonCards.length > 0 ? (
                <LessonSelector
                  lessons={lessonCards}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={handleLessonPress}
                  onTakeTest={handleTakeTest}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📚</Text>
                  <Text style={styles.emptyText}>유닛을 선택해주세요</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Legacy Week Mode */}
            <View style={styles.weekSelectorContainer}>
              <Text style={styles.sectionTitle}>학습 주차 선택</Text>
              <WeekSelector
                selectedWeek={currentWeek}
                onSelectWeek={setCurrentWeek}
                weekProgress={weekProgress}
              />
            </View>

            <View style={styles.activitiesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{currentWeek.replace('week-', '')}주차 학습</Text>
                <View style={styles.progressPill}>
                  <View style={[styles.progressPillFill, { width: `${currentProgress}%` }]} />
                  <Text style={styles.progressPillText}>{currentProgress}%</Text>
                </View>
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
            </View>
          </>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showStats}
          onDismiss={() => setShowStats(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 학습 통계</Text>
            <IconButton icon="close" size={24} onPress={() => setShowStats(false)} />
          </View>
          <LearningDashboard />
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showBadges}
          onDismiss={() => setShowBadges(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BadgeShowcase onClose={() => setShowBadges(false)} />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionArrow: {
    color: COLORS.textSecondary,
    fontSize: 24,
    fontWeight: '300',
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.xl,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionIconBg: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    height: 48,
    justifyContent: 'center',
    marginRight: SIZES.spacing.md,
    width: 48,
  },
  actionInfo: {
    flex: 1,
  },
  actionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
    justifyContent: 'space-between',
  },
  activitiesSection: {
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.lg,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.borderRadius.full,
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
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
  greeting: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  greetingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    margin: 0,
  },
  heroContent: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.lg,
  },
  heroSection: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.borderRadius.xxl,
    borderBottomRightRadius: SIZES.borderRadius.xxl,
    marginBottom: SIZES.spacing.md,
  },
  levelBadge: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginTop: SIZES.spacing.xs,
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
  modalContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
    margin: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressPill: {
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius.full,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  progressPillFill: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.borderRadius.full,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  progressPillText: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: SIZES.spacing.md,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.md,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -SIZES.spacing.xs,
  },
  streakEmoji: {
    fontSize: 20,
    marginBottom: SIZES.spacing.xs,
  },
  weekSelectorContainer: {
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.lg,
  },
  // New lesson-based styles
  modeToggleContainer: {
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
  },
  segmentedButtons: {
    backgroundColor: COLORS.surface,
  },
  unitSelectorContainer: {
    paddingTop: SIZES.spacing.lg,
  },
  lessonSection: {
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SIZES.spacing.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
  },
});
