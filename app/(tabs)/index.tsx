/**
 * Today Screen - 오늘 탭
 *
 * 통합 입력 + 타임라인 방식:
 * - 메모/할일/일기를 한 곳에서 작성
 * - 시간순으로 오늘의 기록 표시
 */

import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TodayEntry } from '@/components/today/TodayEntry';
import { TodayTimeline } from '@/components/today/TodayTimeline';

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
