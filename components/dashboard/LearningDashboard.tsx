/**
 * LearningDashboard Component
 * 학습 통계를 한눈에 보여주는 대시보드
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatsCard } from './StatsCard';
import { WeeklyChart } from './WeeklyChart';
import {
  formatLearningTime,
  formatProgress,
  getLearningStats,
  getStatsSummary,
} from '@/utils/statistics';

export function LearningDashboard() {
  const stats = useMemo(() => getLearningStats(), []);
  const summary = useMemo(() => getStatsSummary(stats), [stats]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 요약 */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      {/* 주요 통계 */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <StatsCard
              icon="🔥"
              label="현재 연속 학습"
              value={`${stats.currentStreak}일`}
              subtitle={`최장: ${stats.longestStreak}일`}
              color="#FF5722"
            />
          </View>
          <View style={styles.statsCol}>
            <StatsCard
              icon="⏱️"
              label="총 학습 시간"
              value={formatLearningTime(stats.totalLearningTime)}
              subtitle={`${stats.totalLearningDays}일 학습`}
              color="#2196F3"
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <StatsCard
              icon="✅"
              label="완료한 활동"
              value={stats.totalActivitiesCompleted}
              subtitle={`${formatProgress(stats.currentWeekProgress)} 진행 중`}
              color="#4CAF50"
            />
          </View>
          <View style={styles.statsCol}>
            <StatsCard
              icon="📚"
              label="학습한 단어"
              value={stats.totalWordsLearned}
              subtitle={`${stats.masteredWords}개 마스터`}
              color="#9C27B0"
            />
          </View>
        </View>
      </View>

      {/* 주간 활동 차트 */}
      <WeeklyChart />

      {/* SRS 복습 정보 */}
      <View style={styles.reviewBox}>
        <Text style={styles.reviewTitle}>📝 복습 현황</Text>
        <View style={styles.reviewStats}>
          <View style={styles.reviewStat}>
            <Text style={styles.reviewLabel}>오늘 복습</Text>
            <Text style={styles.reviewValue}>
              {stats.todayReviewProgress.done} / {stats.todayReviewProgress.goal}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewStat}>
            <Text style={styles.reviewLabel}>복습 필요</Text>
            <Text style={styles.reviewValue}>{stats.dueWords}개</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewStat}>
            <Text style={styles.reviewLabel}>총 복습 횟수</Text>
            <Text style={styles.reviewValue}>{stats.totalReviews}회</Text>
          </View>
        </View>
      </View>

      {/* 최근 활동 */}
      <View style={styles.activityBox}>
        <Text style={styles.activityTitle}>🎯 최근 7일 활동</Text>
        <View style={styles.activityStats}>
          <View style={styles.activityStat}>
            <Text style={styles.activityValue}>{stats.recentDaysActive}일</Text>
            <Text style={styles.activityLabel}>활동한 일수</Text>
          </View>
          <View style={styles.activityStat}>
            <Text style={styles.activityValue}>{stats.averageDailyTime}분</Text>
            <Text style={styles.activityLabel}>평균 학습 시간</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  summaryBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  summaryText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
    lineHeight: 20,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCol: {
    flex: 1,
  },
  reviewBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  reviewStat: {
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  activityBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityStat: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 13,
    color: '#666',
  },
});
