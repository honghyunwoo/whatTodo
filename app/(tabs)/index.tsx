/**
 * Today Screen - 오늘 탭
 *
 * 통합 입력 + 타임라인 방식:
 * - 메모/할일/일기를 한 곳에서 작성
 * - 시간순으로 오늘의 기록 표시
 * - 보조 카드(학습/추천) 단계적 노출
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TodayEntry } from '@/components/today/TodayEntry';
import { TodayExecutionCard } from '@/components/today/TodayExecutionCard';
import { TodayTimeline } from '@/components/today/TodayTimeline';
import { QuickStartCard } from '@/components/home/QuickStartCard';
import { WeightReminderCard } from '@/components/home/WeightReminderCard';
import { SrsWidget } from '@/components/home/SrsWidget';
import { PackRecommendation } from '@/components/home/PackRecommendation';
import { PALETTE, RADIUS, SPACE, TYPOGRAPHY, withOpacity } from '@/constants/design';

const SUPPORT_CARDS_KEY = '@whattodo:todaySupportCardsExpanded';

export default function TodayScreen() {
  const { colors } = useTheme();
  const [showSupportCards, setShowSupportCards] = useState(false);
  const [isSupportCardsHydrated, setIsSupportCardsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreSupportState = async () => {
      try {
        const saved = await AsyncStorage.getItem(SUPPORT_CARDS_KEY);
        if (mounted && (saved === 'true' || saved === 'false')) {
          setShowSupportCards(saved === 'true');
        }
      } catch {
        // ignore restore errors and keep default (collapsed)
      } finally {
        if (mounted) {
          setIsSupportCardsHydrated(true);
        }
      }
    };

    void restoreSupportState();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSupportCardsHydrated) {
      return;
    }
    void AsyncStorage.setItem(SUPPORT_CARDS_KEY, showSupportCards ? 'true' : 'false').catch(
      () => undefined
    );
  }, [showSupportCards, isSupportCardsHydrated]);

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

        {/* 실행 고정 카드: Top3 + Next1 */}
        <TodayExecutionCard />

        {/* 체중 미기록 리마인더 */}
        <WeightReminderCard />

        {/* 보조 카드 접기/펼치기 */}
        <Pressable
          style={({ pressed }) => [
            styles.supportToggleCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.supportToggleCardPressed,
          ]}
          onPress={() => setShowSupportCards((prev) => !prev)}
        >
          <View style={styles.supportToggleLeft}>
            <View style={styles.supportToggleIcon}>
              <Ionicons name="layers-outline" size={16} color={PALETTE.functional.diary} />
            </View>
            <View>
              <Text style={[styles.supportToggleTitle, { color: colors.text }]}>학습 도우미</Text>
              <Text style={[styles.supportToggleSubtitle, { color: colors.textSecondary }]}>
                복습/추천 카드 3개
              </Text>
            </View>
          </View>
          <View style={styles.supportToggleRight}>
            <Text style={[styles.supportToggleAction, { color: colors.textSecondary }]}>
              {showSupportCards ? '접기' : '펼치기'}
            </Text>
            <Ionicons
              name={showSupportCards ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>

        {showSupportCards && (
          <>
            {/* 퀵 학습 시작 카드 */}
            <QuickStartCard />

            {/* SRS 복습 위젯 */}
            <SrsWidget />

            {/* Todo 기반 팩 추천 */}
            <PackRecommendation />
          </>
        )}

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
  supportToggleCard: {
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACE.md,
    marginTop: SPACE.md,
    minHeight: 56,
    paddingHorizontal: SPACE.md,
  },
  supportToggleCardPressed: {
    opacity: 0.86,
  },
  supportToggleLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE.sm,
  },
  supportToggleIcon: {
    alignItems: 'center',
    backgroundColor: withOpacity(PALETTE.functional.diary, 0.12),
    borderRadius: RADIUS.md,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  supportToggleTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  supportToggleSubtitle: {
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
  },
  supportToggleRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  supportToggleAction: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});
