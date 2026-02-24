/**
 * Today Screen - 오늘 탭
 *
 * 통합 입력 + 타임라인 방식:
 * - 메모/할일/일기를 한 곳에서 작성
 * - 시간순으로 오늘의 기록 표시
 * - 퀵 학습 시작 카드
 * - SRS 복습 위젯
 */

import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TodayEntry } from '@/components/today/TodayEntry';
import { TodayTimeline } from '@/components/today/TodayTimeline';
import { QuickStartCard } from '@/components/home/QuickStartCard';
import { RoutineIslandCard } from '@/components/home/RoutineIslandCard';
import { SrsWidget } from '@/components/home/SrsWidget';
import { PackRecommendation } from '@/components/home/PackRecommendation';

export default function TodayScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* 헤더: 날짜 + 스트릭 + 설정 */}
      <TodayHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 통합 입력창: 메모/할일/일기 */}
        <TodayEntry />

        {/* 루틴 섬 정산: 실행 복귀용 빠른 진입 */}
        <RoutineIslandCard />

        {/* 퀵 학습 시작 카드 */}
        <QuickStartCard />

        {/* SRS 복습 위젯 */}
        <SrsWidget />

        {/* Todo 기반 팩 추천 */}
        <PackRecommendation />

        {/* 타임라인: 오늘의 기록 */}
        <TodayTimeline />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
