/**
 * TutorInsights - 주간 인사이트 카드
 *
 * 학습 패턴 분석 결과를 시각적으로 표시
 * - 강점/약점 분석
 * - 진행 추세
 * - 맞춤 추천
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Chip, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { learningAnalyzer, type SkillScore } from '@/services/learningAnalyzer';
import { COLORS } from '@/constants/colors';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface TutorInsightsProps {
  compact?: boolean;
}

const SKILL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vocabulary: 'book-outline',
  grammar: 'git-branch-outline',
  reading: 'document-text-outline',
  listening: 'headset-outline',
  speaking: 'mic-outline',
  writing: 'create-outline',
};

const SKILL_COLORS: Record<string, string> = {
  vocabulary: '#4CAF50',
  grammar: '#2196F3',
  reading: '#9C27B0',
  listening: '#FF9800',
  speaking: '#E91E63',
  writing: '#00BCD4',
};

const TREND_CONFIG = {
  improving: { icon: 'trending-up' as const, color: '#4CAF50', text: '향상 중' },
  stable: { icon: 'remove' as const, color: '#FF9800', text: '유지 중' },
  declining: { icon: 'trending-down' as const, color: '#F44336', text: '하락 중' },
};

export function TutorInsights({ compact = false }: TutorInsightsProps) {
  const analysis = useMemo(() => learningAnalyzer.analyze(), []);

  if (!analysis) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.emptyText}>학습 데이터가 충분하지 않아요. 더 많이 학습해보세요!</Text>
        </Card.Content>
      </Card>
    );
  }

  const trendConfig = TREND_CONFIG[analysis.progressTrend];

  return (
    <AnimatedCard entering={FadeInUp.delay(100).springify()} style={styles.card}>
      <Card.Content>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
            <Text style={styles.title}>학습 인사이트</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: trendConfig.color + '20' }]}>
            <Ionicons name={trendConfig.icon} size={16} color={trendConfig.color} />
            <Text style={[styles.trendText, { color: trendConfig.color }]}>{trendConfig.text}</Text>
          </View>
        </View>

        {/* 강점/약점 */}
        {!compact && (
          <View style={styles.strengthsSection}>
            <View style={styles.strengthRow}>
              <View style={styles.strengthLabel}>
                <Ionicons name="star" size={16} color="#4CAF50" />
                <Text style={styles.strengthLabelText}>강점</Text>
              </View>
              <View style={styles.chipContainer}>
                {analysis.strengths.map((strength, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={[styles.chip, { borderColor: '#4CAF50' }]}
                    textStyle={{ fontSize: 12, color: '#4CAF50' }}
                  >
                    {strength}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.strengthRow}>
              <View style={styles.strengthLabel}>
                <Ionicons name="flag" size={16} color="#FF9800" />
                <Text style={styles.strengthLabelText}>보완 필요</Text>
              </View>
              <View style={styles.chipContainer}>
                {analysis.weaknesses.map((weakness, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={[styles.chip, { borderColor: '#FF9800' }]}
                    textStyle={{ fontSize: 12, color: '#FF9800' }}
                  >
                    {weakness}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 스킬 점수 */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>스킬 현황</Text>
          <View style={styles.skillsGrid}>
            {analysis.skillScores.map((skillData) => (
              <SkillItem
                key={skillData.skill}
                skill={skillData.skill}
                data={skillData}
                compact={compact}
              />
            ))}
          </View>
        </View>

        {/* 추천 - WeeklyInsight에서 가져옴 */}
        {!compact && analysis.recommendedFocus && (
          <View style={styles.recommendSection}>
            <Text style={styles.sectionTitle}>이번 주 집중</Text>
            <View style={styles.recommendItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.recommendText}>
                {analysis.recommendedFocus} 영역에 집중해보세요!
              </Text>
            </View>
          </View>
        )}
      </Card.Content>
    </AnimatedCard>
  );
}

interface SkillItemProps {
  skill: string;
  data: SkillScore;
  compact?: boolean;
}

function SkillItem({ skill, data, compact }: SkillItemProps) {
  const color = SKILL_COLORS[skill] || COLORS.primary;
  const icon = SKILL_ICONS[skill] || 'help-circle-outline';
  const percentage = Math.round(data.averageScore);
  const progress = data.averageScore / 100;

  const skillNames: Record<string, string> = {
    vocabulary: '어휘',
    grammar: '문법',
    reading: '독해',
    listening: '듣기',
    speaking: '말하기',
    writing: '쓰기',
  };

  return (
    <View style={[styles.skillItem, compact && styles.skillItemCompact]}>
      <View style={styles.skillHeader}>
        <View style={[styles.skillIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={compact ? 14 : 16} color={color} />
        </View>
        {!compact && <Text style={styles.skillName}>{skillNames[skill] || skill}</Text>}
        <Text style={[styles.skillScore, { color }]}>{percentage}%</Text>
      </View>
      <ProgressBar progress={progress} color={color} style={styles.progressBar} />
      {!compact && <Text style={styles.skillStats}>{data.completedCount}회 완료</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    ...SHADOWS.md,
  },
  chip: {
    height: 28,
    marginRight: 4,
  },
  chipContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  progressBar: {
    borderRadius: 4,
    height: 6,
    marginTop: 4,
  },
  recommendItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
  },
  recommendSection: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
  },
  recommendText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  skillHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: 4,
  },
  skillIcon: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  skillItem: {
    marginBottom: SIZES.spacing.sm,
    width: '48%',
  },
  skillItemCompact: {
    marginBottom: SIZES.spacing.xs,
    width: '30%',
  },
  skillName: {
    color: COLORS.text,
    flex: 1,
    fontSize: SIZES.fontSize.sm,
  },
  skillScore: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '700',
  },
  skillStats: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  skillsSection: {
    marginTop: SIZES.spacing.sm,
  },
  strengthLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginRight: SIZES.spacing.sm,
    width: 80,
  },
  strengthLabelText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
  },
  strengthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SIZES.spacing.xs,
  },
  strengthsSection: {
    marginBottom: SIZES.spacing.md,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  trendBadge: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
});
