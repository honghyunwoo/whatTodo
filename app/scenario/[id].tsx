/**
 * Scenario Detail Page
 * 시나리오 상세 화면 - 표현 목록 + 학습 시작
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useScenarioStore } from '@/store/scenarioStore';
import {
  Expression,
  SessionType,
  SESSION_CONFIG,
  SCENARIO_CATEGORIES,
  DIFFICULTY_LABELS,
} from '@/types/scenario';

// ─────────────────────────────────────
// 카테고리별 그라디언트
// ─────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  travel: ['#4CAF50', '#81C784'],
  business: ['#2196F3', '#64B5F6'],
  daily: ['#FF9800', '#FFB74D'],
  social: ['#E91E63', '#F06292'],
  emergency: ['#F44336', '#E57373'],
};

// ─────────────────────────────────────
// 표현 카드 컴포넌트
// ─────────────────────────────────────

interface ExpressionItemProps {
  expression: Expression;
  index: number;
  isCompleted: boolean;
  onPress: () => void;
}

function ExpressionItem({ expression, index, isCompleted, onPress }: ExpressionItemProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.expressionCard,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark && SHADOWS.sm,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.expressionIndex}>
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        ) : (
          <Text style={[styles.indexNumber, { color: colors.textSecondary }]}>{index + 1}</Text>
        )}
      </View>
      <View style={styles.expressionContent}>
        <Text style={[styles.koreanText, { color: colors.text }]}>{expression.korean}</Text>
        <Text style={[styles.englishText, { color: colors.textSecondary }]}>
          {expression.english}
        </Text>
        {expression.tips && (
          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={14} color="#FF9800" />
            <Text style={styles.tipText}>{expression.tips}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

// ─────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────

export default function ScenarioDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const { getScenario, selectScenario, progress, clearCurrentScenario } = useScenarioStore();

  const scenario = useMemo(() => getScenario(id), [getScenario, id]);
  const scenarioProgress = progress[id];

  useEffect(() => {
    if (id) {
      selectScenario(id);
    }
    return () => {
      clearCurrentScenario();
    };
  }, [id, selectScenario, clearCurrentScenario]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleStartSession = useCallback(
    (type: SessionType) => {
      router.push({
        pathname: '/session/[type]',
        params: { type, scenarioId: id },
      });
    },
    [router, id]
  );

  const handleExpressionPress = useCallback((_expression: Expression) => {
    // TODO: 표현 상세 모달 또는 바로 학습 시작
  }, []);

  if (!scenario) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            시나리오를 찾을 수 없습니다
          </Text>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const categoryMeta = SCENARIO_CATEGORIES[scenario.category];
  const difficultyMeta = DIFFICULTY_LABELS[scenario.difficulty];
  const gradientColors = CATEGORY_GRADIENTS[scenario.category];
  const progressPercent = scenarioProgress?.progress || 0;
  const completedExpressions = scenarioProgress?.completedExpressions || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* 헤더 그라디언트 */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <IconButton
            icon={() => <Ionicons name="arrow-back" size={24} color="#FFFFFF" />}
            onPress={handleBack}
          />
          <View style={styles.headerBadges}>
            <View style={styles.levelBadge}>
              <Text style={styles.badgeText}>{scenario.level}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.badgeText}>{difficultyMeta.labelKo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={categoryMeta.icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.scenarioTitle}>{scenario.nameKo}</Text>
          <Text style={styles.scenarioSubtitle}>{scenario.name}</Text>
          <Text style={styles.scenarioDescription}>{scenario.descriptionKo}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{scenario.expressions.length}개 표현</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>~{scenario.estimatedTime}분</Text>
            </View>
            {progressPercent > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{progressPercent}% 완료</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 세션 시작 버튼 */}
        <View style={styles.sessionButtons}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>학습 시작</Text>
          <View style={styles.sessionButtonRow}>
            {(['30s', '1m', '5m'] as SessionType[]).map((type) => {
              const config = SESSION_CONFIG[type];
              return (
                <Pressable
                  key={type}
                  style={({ pressed }) => [
                    styles.sessionButton,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                    !isDark && SHADOWS.sm,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleStartSession(type)}
                >
                  <Text style={[styles.sessionTime, { color: gradientColors[0] }]}>
                    {config.label}
                  </Text>
                  <Text style={[styles.sessionCount, { color: colors.textSecondary }]}>
                    {config.expressionCount}개
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 표현 목록 */}
        <View style={styles.expressionSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            표현 목록 ({scenario.expressions.length}개)
          </Text>
          {scenario.expressions.map((expression, index) => (
            <ExpressionItem
              key={expression.id}
              expression={expression}
              index={index}
              isCompleted={completedExpressions.includes(expression.id)}
              onPress={() => handleExpressionPress(expression)}
            />
          ))}
        </View>

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
  headerGradient: {
    paddingBottom: SIZES.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SIZES.spacing.md,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  scenarioTitle: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scenarioSubtitle: {
    fontSize: SIZES.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  scenarioDescription: {
    fontSize: SIZES.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
    marginTop: SIZES.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: SIZES.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  sessionButtons: {
    padding: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
    marginBottom: SIZES.spacing.md,
  },
  sessionButtonRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  sessionButton: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  pressed: {
    opacity: 0.8,
  },
  sessionTime: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '800',
  },
  sessionCount: {
    fontSize: SIZES.fontSize.xs,
    marginTop: 2,
  },
  expressionSection: {
    padding: SIZES.spacing.md,
  },
  expressionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.sm,
  },
  expressionIndex: {
    width: 32,
    alignItems: 'center',
  },
  indexNumber: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  expressionContent: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
  },
  koreanText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  englishText: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.spacing.xs,
  },
  tipText: {
    fontSize: SIZES.fontSize.xs,
    color: '#FF9800',
  },
  bottomSpacer: {
    height: SIZES.spacing.xl * 2,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  notFoundText: {
    fontSize: SIZES.fontSize.md,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});
