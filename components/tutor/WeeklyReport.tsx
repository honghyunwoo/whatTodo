/**
 * WeeklyReport - 주간 리포트 컴포넌트
 *
 * 한 주간의 학습 활동을 요약하여 표시
 * - 학습 시간 및 활동 수
 * - 스트릭 정보
 * - 성취 하이라이트
 * - 텍스트 요약
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { COLORS } from '@/constants/colors';
import { learningAnalyzer } from '@/services/learningAnalyzer';
import { useStreakStore } from '@/store/streakStore';
import { useLearnStore } from '@/store/learnStore';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface WeeklyReportProps {
  onClose?: () => void;
  onViewDetails?: () => void;
}

export function WeeklyReport({ onClose, onViewDetails }: WeeklyReportProps) {
  const { currentStreak, longestStreak } = useStreakStore();
  const weekProgress = useLearnStore((state) => state.weekProgress);

  const weeklyInsight = useMemo(() => learningAnalyzer.getWeeklyInsight(), []);
  const recentStats = useMemo(() => learningAnalyzer.getRecentStats(), []);

  // 이번 주 통계 계산
  const thisWeekStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // 일요일 시작
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekData = recentStats.filter((stat) => {
      const statDate = new Date(stat.date);
      return statDate >= weekStart;
    });

    const totalActivities = thisWeekData.reduce((sum, day) => sum + day.activitiesCompleted, 0);
    const activeDays = thisWeekData.filter((day) => day.activitiesCompleted > 0).length;
    // totalScore를 기반으로 평균 정확도 계산 (totalScore는 0-100 사이 값)
    const totalScoreSum = thisWeekData.reduce((sum, day) => sum + day.totalScore, 0);
    const accuracy = thisWeekData.length > 0 ? totalScoreSum / thisWeekData.length : 0;

    return {
      totalActivities,
      activeDays,
      accuracy: Math.round(accuracy),
    };
  }, [recentStats]);

  // 현재 진행 중인 주차
  const currentWeekNumber = weekProgress.length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <AnimatedCard entering={FadeInDown.delay(100).springify()} style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>주간 리포트</Text>
              <Text style={styles.headerSubtitle}>Week {currentWeekNumber}</Text>
            </View>
            {onClose && (
              <Button mode="text" onPress={onClose} compact>
                닫기
              </Button>
            )}
          </View>

          {/* 주간 요약 텍스트 */}
          <View style={styles.summaryBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
            <Text style={styles.summaryText}>{weeklyInsight.summary}</Text>
          </View>
        </Card.Content>
      </AnimatedCard>

      {/* 통계 카드들 */}
      <View style={styles.statsRow}>
        <AnimatedCard entering={FadeInRight.delay(200).springify()} style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{thisWeekStats.totalActivities}</Text>
            <Text style={styles.statLabel}>완료 활동</Text>
          </Card.Content>
        </AnimatedCard>

        <AnimatedCard entering={FadeInRight.delay(300).springify()} style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="calendar" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{thisWeekStats.activeDays}일</Text>
            <Text style={styles.statLabel}>학습 일수</Text>
          </Card.Content>
        </AnimatedCard>

        <AnimatedCard entering={FadeInRight.delay(400).springify()} style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="flame" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>{currentStreak}일</Text>
            <Text style={styles.statLabel}>연속 학습</Text>
          </Card.Content>
        </AnimatedCard>
      </View>

      {/* 정확도 카드 */}
      <AnimatedCard entering={FadeInDown.delay(500).springify()} style={styles.accuracyCard}>
        <Card.Content>
          <View style={styles.accuracyHeader}>
            <Text style={styles.accuracyTitle}>이번 주 정확도</Text>
            <Text
              style={[styles.accuracyValue, { color: getAccuracyColor(thisWeekStats.accuracy) }]}
            >
              {thisWeekStats.accuracy}%
            </Text>
          </View>
          <View style={styles.accuracyBar}>
            <View style={[styles.accuracyFill, { width: `${thisWeekStats.accuracy}%` }]} />
          </View>
          <Text style={styles.accuracyHint}>{getAccuracyMessage(thisWeekStats.accuracy)}</Text>
        </Card.Content>
      </AnimatedCard>

      {/* 스트릭 정보 */}
      <AnimatedCard entering={FadeInDown.delay(600).springify()} style={styles.streakCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>스트릭 현황</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Ionicons name="flame" size={32} color="#FF9800" />
              <Text style={styles.streakValue}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>현재 스트릭</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.streakValue}>{longestStreak}</Text>
              <Text style={styles.streakLabel}>최장 스트릭</Text>
            </View>
          </View>
        </Card.Content>
      </AnimatedCard>

      {/* 추천 사항 */}
      {weeklyInsight.recommendations.length > 0 && (
        <AnimatedCard entering={FadeInDown.delay(700).springify()} style={styles.recommendCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>이번 주 추천</Text>
            {weeklyInsight.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendItem}>
                <View style={styles.recommendNumber}>
                  <Text style={styles.recommendNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendText}>{rec}</Text>
              </View>
            ))}
          </Card.Content>
        </AnimatedCard>
      )}

      {/* 상세 보기 버튼 */}
      {onViewDetails && (
        <Button
          mode="contained"
          onPress={onViewDetails}
          style={styles.detailsButton}
          icon="chart-line"
        >
          상세 기록 보기
        </Button>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return '#4CAF50';
  if (accuracy >= 60) return '#FF9800';
  return '#F44336';
}

function getAccuracyMessage(accuracy: number): string {
  if (accuracy >= 90) return '훌륭해요! 완벽에 가까운 정확도입니다.';
  if (accuracy >= 80) return '잘 하고 있어요! 조금만 더 정확하게!';
  if (accuracy >= 70) return '괜찮아요! 복습을 통해 더 높일 수 있어요.';
  if (accuracy >= 60) return '열심히 하고 있어요! 틀린 문제를 복습해보세요.';
  return '더 노력해봐요! 기초부터 차근차근 다져가요.';
}

const styles = StyleSheet.create({
  accuracyBar: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    height: 8,
    marginVertical: SIZES.spacing.sm,
    overflow: 'hidden',
  },
  accuracyCard: {
    marginBottom: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  accuracyFill: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: '100%',
  },
  accuracyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accuracyHint: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
  },
  accuracyTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  accuracyValue: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: SIZES.spacing.xl,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  detailsButton: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  headerCard: {
    margin: SIZES.spacing.md,
    ...SHADOWS.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  recommendCard: {
    marginBottom: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  recommendItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  recommendNumber: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.borderRadius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  recommendNumberText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '700',
  },
  recommendText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.md,
  },
  statCard: {
    flex: 1,
    ...SHADOWS.sm,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 48,
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xs,
    width: 48,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  streakCard: {
    marginBottom: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  streakDivider: {
    backgroundColor: COLORS.border,
    height: 60,
    width: 1,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
    marginTop: 4,
  },
  streakRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakValue: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    marginTop: SIZES.spacing.xs,
  },
  summaryBox: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  summaryText: {
    color: COLORS.text,
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 22,
  },
});
