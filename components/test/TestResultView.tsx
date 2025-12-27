/**
 * TestResultView Component
 * Displays test results with score, feedback, and recommendations
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import { useTestStore } from '@/store/testStore';
import type { ActivityType } from '@/types/activity';

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function TestResultView() {
  const { colors, isDark } = useTheme();
  const lastResult = useTestStore((state) => state.lastResult);

  // Activity type display names
  const activityNames: Record<ActivityType, string> = useMemo(
    () => ({
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      listening: 'Listening',
      reading: 'Reading',
      speaking: 'Speaking',
      writing: 'Writing',
    }),
    []
  );

  // Get grade info based on score
  const getGradeInfo = useCallback((score: number) => {
    if (score >= 90) return { grade: 'A', color: '#22c55e', icon: 'star' as const };
    if (score >= 80) return { grade: 'B', color: '#84cc16', icon: 'star-half-full' as const };
    if (score >= 70) return { grade: 'C', color: '#f59e0b', icon: 'star-outline' as const };
    if (score >= 60) return { grade: 'D', color: '#f97316', icon: 'star-off' as const };
    return { grade: 'F', color: '#ef4444', icon: 'close' as const };
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    learnHaptics.selection();
    router.back();
  }, []);

  // Handle continue
  const handleContinue = useCallback(() => {
    learnHaptics.selection();
    router.replace('/(tabs)/learn');
  }, []);

  if (!lastResult) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No result available</Text>
        <Pressable onPress={() => router.back()} style={styles.retryButton}>
          <Text style={{ color: COLORS.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const gradeInfo = getGradeInfo(lastResult.score);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Result Header */}
      <Animated.View entering={ZoomIn.duration(400)}>
        <View
          style={[
            styles.resultHeader,
            {
              backgroundColor: lastResult.passed
                ? isDark
                  ? '#1a3a1a'
                  : '#dcfce7'
                : isDark
                  ? '#3a1a1a'
                  : '#fee2e2',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={lastResult.passed ? 'check-decagram' : 'close-octagon'}
            size={64}
            color={lastResult.passed ? '#22c55e' : '#ef4444'}
          />
          <Text style={[styles.resultTitle, { color: lastResult.passed ? '#22c55e' : '#ef4444' }]}>
            {lastResult.passed ? 'Congratulations!' : 'Keep Trying!'}
          </Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
            {lastResult.feedback}
          </Text>
        </View>
      </Animated.View>

      {/* Score Card */}
      <Animated.View entering={FadeInUp.duration(300).delay(100)}>
        <Card style={[styles.scoreCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
          <Card.Content>
            <View style={styles.scoreContainer}>
              {/* Grade */}
              <View style={styles.gradeCircle}>
                <View style={[styles.gradeInner, { backgroundColor: gradeInfo.color }]}>
                  <Text style={styles.gradeText}>{gradeInfo.grade}</Text>
                </View>
              </View>

              {/* Score Details */}
              <View style={styles.scoreDetails}>
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>
                    {lastResult.score}%
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Correct</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>
                    {lastResult.correctCount} / {lastResult.totalCount}
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Time</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>
                    {Math.floor(lastResult.timeSpent / 60)}m {lastResult.timeSpent % 60}s
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Activity Scores */}
      {Object.keys(lastResult.activityScores).length > 0 && (
        <Animated.View entering={FadeInUp.duration(300).delay(200)}>
          <Card
            style={[styles.activityCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance by Area</Text>
              <View style={styles.activityList}>
                {Object.entries(lastResult.activityScores).map(([type, score]) => (
                  <View key={type} style={styles.activityRow}>
                    <View style={styles.activityInfo}>
                      <MaterialCommunityIcons
                        name={
                          type === 'vocabulary'
                            ? 'book-alphabet'
                            : type === 'grammar'
                              ? 'format-text'
                              : type === 'listening'
                                ? 'headphones'
                                : type === 'reading'
                                  ? 'book-open-page-variant'
                                  : type === 'speaking'
                                    ? 'microphone'
                                    : 'pencil'
                        }
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.activityName, { color: colors.text }]}>
                        {activityNames[type as ActivityType]}
                      </Text>
                    </View>
                    <View style={styles.activityScore}>
                      <View style={styles.activityBar}>
                        <View
                          style={[
                            styles.activityBarFill,
                            {
                              width: `${score?.percentage ?? 0}%`,
                              backgroundColor:
                                (score?.percentage ?? 0) >= 70
                                  ? '#22c55e'
                                  : (score?.percentage ?? 0) >= 50
                                    ? '#f59e0b'
                                    : '#ef4444',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.activityPercentage, { color: colors.text }]}>
                        {score?.percentage ?? 0}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Recommendations */}
      {lastResult.recommendations.length > 0 && (
        <Animated.View entering={FadeInUp.duration(300).delay(300)}>
          <Card
            style={[styles.recommendCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <View style={styles.recommendHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#f59e0b" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
              </View>
              {lastResult.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendItem}>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.primary} />
                  <Text style={[styles.recommendText, { color: colors.textSecondary }]}>{rec}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View entering={FadeInUp.duration(300).delay(400)}>
        <View style={styles.buttonContainer}>
          {!lastResult.passed && (
            <Pressable
              style={[styles.retryButton, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
              onPress={handleRetry}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
              <Text style={[styles.buttonText, { color: colors.text }]}>Try Again</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {lastResult.passed ? 'Continue Learning' : 'Review Lessons'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xxl,
  },
  resultHeader: {
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.lg,
  },
  resultTitle: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: '700',
    marginTop: SIZES.spacing.md,
  },
  resultSubtitle: {
    fontSize: SIZES.fontSize.md,
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
    lineHeight: 22,
  },
  scoreCard: {
    marginBottom: SIZES.spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.lg,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.border,
    padding: 6,
  },
  gradeInner: {
    flex: 1,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  scoreDetails: {
    flex: 1,
    gap: SIZES.spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  scoreValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  activityCard: {
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.md,
  },
  activityList: {
    gap: SIZES.spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    flex: 1,
  },
  activityName: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  activityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    flex: 1,
  },
  activityBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  activityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityPercentage: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  recommendCard: {
    marginBottom: SIZES.spacing.lg,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  recommendText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  continueButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  buttonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default TestResultView;
