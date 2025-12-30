/**
 * Home Screen - 시나리오 기반 학습 홈
 *
 * PRD 핵심:
 * - 시나리오 카드 기반 (Week 구조 없음)
 * - 30초/1분/5분 빠른 세션
 * - 카테고리 필터
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { QuickSession, CategoryFilter, ScenarioCard } from '@/components/scenario';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSessionStore } from '@/store/sessionStore';
import { useStreakStore } from '@/store/streakStore';
import { useRewardStore } from '@/store/rewardStore';
import { Scenario, ScenarioCategory, SessionType } from '@/types/scenario';
import { getScenarioCountByCategory } from '@/data/scenarios';

// ─────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Store 구독
  const {
    scenarios,
    isLoading,
    loadScenarios,
    progress,
    selectedCategory,
    setCategory,
    getFilteredScenarios,
    getRecommendedScenarios,
  } = useScenarioStore();

  const { todaySessionCount } = useSessionStore();
  const { currentStreak } = useStreakStore();
  const { stars } = useRewardStore();

  // 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);

  // 시나리오 로드
  useEffect(() => {
    if (scenarios.length === 0) {
      loadScenarios();
    }
  }, [scenarios.length, loadScenarios]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScenarios();
    setRefreshing(false);
  }, [loadScenarios]);

  // 카테고리별 시나리오 개수
  const categoryCounts = useMemo(() => {
    return getScenarioCountByCategory();
  }, []);

  // 필터링된 시나리오
  const filteredScenarios = useMemo(() => {
    return getFilteredScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilteredScenarios, selectedCategory, scenarios.length]);

  // 추천 시나리오
  const recommendedScenarios = useMemo(() => {
    return getRecommendedScenarios().slice(0, 3);
  }, [getRecommendedScenarios]);

  // 세션 시작
  const handleStartSession = useCallback(
    (type: SessionType) => {
      // 추천 시나리오 중 첫 번째 선택 또는 랜덤
      const targetScenario = recommendedScenarios[0] || filteredScenarios[0];
      if (targetScenario) {
        router.push({
          pathname: '/session/[type]',
          params: { type, scenarioId: targetScenario.id },
        });
      } else {
        // 시나리오가 없으면 학습 탭으로
        router.push('/learn');
      }
    },
    [router, recommendedScenarios, filteredScenarios]
  );

  // 시나리오 선택
  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      router.push({
        pathname: '/scenario/[id]',
        params: { id: scenario.id },
      });
    },
    [router]
  );

  // 카테고리 선택
  const handleSelectCategory = useCallback(
    (category: ScenarioCategory | null) => {
      setCategory(category);
    },
    [setCategory]
  );

  // 설정 열기
  const handleOpenSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>영어 학습</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            오늘도 조금씩 성장해요
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.starBadge}>
            <Text style={styles.starEmoji}>⭐</Text>
            <Text style={[styles.starCount, { color: colors.text }]}>{stars}</Text>
          </View>
          <IconButton
            icon={() => <Ionicons name="settings-outline" size={24} color={colors.text} />}
            onPress={handleOpenSettings}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* 빠른 세션 시작 */}
        <QuickSession
          onSelectSession={handleStartSession}
          todaySessionCount={todaySessionCount}
          currentStreak={currentStreak}
        />

        {/* 카테고리 필터 */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          counts={categoryCounts}
        />

        {/* 추천 시나리오 섹션 */}
        {recommendedScenarios.length > 0 && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📌 추천 시나리오</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                진행 중인 학습을 이어가세요
              </Text>
            </View>
            {recommendedScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                progress={progress[scenario.id]}
                onPress={handleSelectScenario}
                compact
              />
            ))}
          </View>
        )}

        {/* 시나리오 목록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCategory
                ? `📚 ${
                    selectedCategory === 'travel'
                      ? '여행'
                      : selectedCategory === 'business'
                        ? '비즈니스'
                        : selectedCategory === 'daily'
                          ? '일상'
                          : selectedCategory === 'social'
                            ? '소셜'
                            : '긴급상황'
                  } 시나리오`
                : '📚 모든 시나리오'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {filteredScenarios.length}개 시나리오
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                시나리오 불러오는 중...
              </Text>
            </View>
          ) : filteredScenarios.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                아직 시나리오가 없어요
              </Text>
            </View>
          ) : (
            filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                progress={progress[scenario.id]}
                onPress={handleSelectScenario}
              />
            ))
          )}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────
// 스타일
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
    gap: 4,
  },
  starEmoji: {
    fontSize: 14,
  },
  starCount: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  sectionHeader: {
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  loadingText: {
    fontSize: SIZES.fontSize.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl * 2,
    gap: SIZES.spacing.md,
  },
  emptyText: {
    fontSize: SIZES.fontSize.md,
  },
  bottomSpacer: {
    height: SIZES.spacing.xl * 2,
  },
});
