/**
 * WritingFeedback Component
 * Displays rule-based writing evaluation with self-check
 * API-FREE: Uses rule-based scoring + self-evaluation
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import type { WritingEvaluation, WritingPrompt } from '@/types/writing';
import type { SelfCheckItem } from '@/services/writingService';
import writingService from '@/services/writingService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface WritingFeedbackProps {
  evaluation: WritingEvaluation;
  originalText: string;
  prompt: WritingPrompt;
  sampleAnswer?: string;
  onRetry?: () => void;
  onContinue?: () => void;
  onSelfEvaluate?: (rating: 'excellent' | 'good' | 'needs_practice') => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  content: 'file-document-outline',
  grammar: 'alphabetical-variant',
  vocabulary: 'book-open-variant',
  organization: 'format-list-bulleted',
};

const CATEGORY_COLORS: Record<string, string> = {
  content: '#3b82f6',
  grammar: '#ef4444',
  vocabulary: '#8b5cf6',
  organization: '#22c55e',
};

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Keep Trying';
}

function getScoreIcon(score: number): string {
  if (score >= 80) return 'check-circle';
  if (score >= 60) return 'alert-circle';
  return 'close-circle';
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function WritingFeedback({
  evaluation,
  originalText,
  prompt,
  sampleAnswer,
  onRetry,
  onContinue,
  onSelfEvaluate,
}: WritingFeedbackProps) {
  const { colors, isDark } = useTheme();

  // State
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [selfCheckItems, setSelfCheckItems] = useState<Map<string, boolean>>(new Map());
  const [selectedRating, setSelectedRating] = useState<
    'excellent' | 'good' | 'needs_practice' | null
  >(null);

  // Get self-check items from service
  const checklistItems = useMemo(() => writingService.getSelfCheckItems(), []);

  // Group checklist by category
  const checklistByCategory = useMemo(() => {
    const grouped: Record<string, SelfCheckItem[]> = {
      content: [],
      grammar: [],
      vocabulary: [],
      organization: [],
    };
    checklistItems.forEach((item) => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });
    return grouped;
  }, [checklistItems]);

  // Calculate checked count
  const checkedCount = selfCheckItems.size;
  const totalCheckItems = checklistItems.length;

  const scoreColor = getScoreColor(evaluation.overallScore);

  // ─────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────

  const handleToggleCheck = useCallback((id: string) => {
    setSelfCheckItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, true);
      }
      return next;
    });
    learnHaptics.selection();
  }, []);

  const handleSelectRating = useCallback(
    (rating: 'excellent' | 'good' | 'needs_practice') => {
      setSelectedRating(rating);
      learnHaptics.selection();
      onSelfEvaluate?.(rating);
    },
    [onSelfEvaluate]
  );

  const handleRetry = useCallback(() => {
    learnHaptics.impact();
    onRetry?.();
  }, [onRetry]);

  const handleContinue = useCallback(() => {
    learnHaptics.impact();
    onContinue?.();
  }, [onContinue]);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overall Score Card */}
        <Animated.View entering={FadeInUp.duration(300)}>
          <Card
            style={[styles.scoreCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content style={styles.scoreCardContent}>
              {/* Score Circle */}
              <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {evaluation.overallScore}
                </Text>
                <Text style={[styles.scorePercent, { color: colors.textSecondary }]}>/100</Text>
              </View>

              {/* Score Label */}
              <View style={styles.scoreLabelContainer}>
                <MaterialCommunityIcons
                  name={getScoreIcon(evaluation.overallScore) as any}
                  size={24}
                  color={scoreColor}
                />
                <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                  {getScoreLabel(evaluation.overallScore)}
                </Text>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="file-word-box"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {evaluation.ruleBasedScore?.wordCount || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>words</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.textSecondary }]} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="format-line-spacing"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {evaluation.ruleBasedScore?.sentenceCount || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>sentences</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Category Scores */}
        <Animated.View entering={FadeInUp.duration(300).delay(100)}>
          <Card
            style={[
              styles.categoriesCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Scores</Text>

              <View style={styles.categoriesGrid}>
                {Object.entries(evaluation.categories).map(([key, category]) => (
                  <View
                    key={key}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                    ]}
                  >
                    <View style={styles.categoryHeader}>
                      <MaterialCommunityIcons
                        name={(CATEGORY_ICONS[key] || 'help-circle') as any}
                        size={18}
                        color={CATEGORY_COLORS[key] || colors.textSecondary}
                      />
                      <Text style={[styles.categoryName, { color: colors.text }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </View>

                    {/* Score Bar */}
                    <View style={styles.categoryScoreBar}>
                      <View
                        style={[
                          styles.categoryScoreFill,
                          {
                            width: `${category.score}%`,
                            backgroundColor: getScoreColor(category.score),
                          },
                        ]}
                      />
                    </View>

                    <Text style={[styles.categoryScore, { color: getScoreColor(category.score) }]}>
                      {category.score}%
                    </Text>

                    {/* Feedback */}
                    <Text
                      style={[styles.categoryFeedback, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {category.feedback}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Rule-Based Analysis */}
        {evaluation.ruleBasedScore && (
          <Animated.View entering={FadeInUp.duration(300).delay(150)}>
            <Card
              style={[
                styles.analysisCard,
                { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
              ]}
            >
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Writing Analysis</Text>

                {/* Word Count Check */}
                <View style={styles.analysisItem}>
                  <MaterialCommunityIcons
                    name={
                      evaluation.ruleBasedScore.isWordCountValid ? 'check-circle' : 'alert-circle'
                    }
                    size={20}
                    color={evaluation.ruleBasedScore.isWordCountValid ? '#22c55e' : '#f59e0b'}
                  />
                  <View style={styles.analysisContent}>
                    <Text style={[styles.analysisLabel, { color: colors.text }]}>Word Count</Text>
                    <Text style={[styles.analysisValue, { color: colors.textSecondary }]}>
                      {evaluation.ruleBasedScore.wordCount} words (target: {prompt.wordCount.min}-
                      {prompt.wordCount.max})
                    </Text>
                  </View>
                </View>

                {/* Keywords Check */}
                <View style={styles.analysisItem}>
                  <MaterialCommunityIcons
                    name={
                      evaluation.ruleBasedScore.keywordsFound.length > 0
                        ? 'check-circle'
                        : 'alert-circle'
                    }
                    size={20}
                    color={
                      evaluation.ruleBasedScore.keywordsFound.length > 0 ? '#22c55e' : '#f59e0b'
                    }
                  />
                  <View style={styles.analysisContent}>
                    <Text style={[styles.analysisLabel, { color: colors.text }]}>Key Topics</Text>
                    {evaluation.ruleBasedScore.keywordsFound.length > 0 ? (
                      <View style={styles.keywordTags}>
                        {evaluation.ruleBasedScore.keywordsFound.map((keyword, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.keywordTag,
                              { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
                            ]}
                          >
                            <Text style={[styles.keywordText, { color: '#22c55e' }]}>
                              {keyword}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.analysisValue, { color: colors.textSecondary }]}>
                        Try to include more key topics
                      </Text>
                    )}
                  </View>
                </View>

                {/* Structure Check */}
                <View style={styles.analysisItem}>
                  <MaterialCommunityIcons
                    name={evaluation.ruleBasedScore.hasOpening ? 'check-circle' : 'alert-circle'}
                    size={20}
                    color={evaluation.ruleBasedScore.hasOpening ? '#22c55e' : '#f59e0b'}
                  />
                  <View style={styles.analysisContent}>
                    <Text style={[styles.analysisLabel, { color: colors.text }]}>
                      Opening Phrase
                    </Text>
                    <Text style={[styles.analysisValue, { color: colors.textSecondary }]}>
                      {evaluation.ruleBasedScore.hasOpening
                        ? 'Good opening detected'
                        : 'Consider adding an opening phrase'}
                    </Text>
                  </View>
                </View>

                <View style={styles.analysisItem}>
                  <MaterialCommunityIcons
                    name={evaluation.ruleBasedScore.hasClosing ? 'check-circle' : 'alert-circle'}
                    size={20}
                    color={evaluation.ruleBasedScore.hasClosing ? '#22c55e' : '#f59e0b'}
                  />
                  <View style={styles.analysisContent}>
                    <Text style={[styles.analysisLabel, { color: colors.text }]}>
                      Closing Phrase
                    </Text>
                    <Text style={[styles.analysisValue, { color: colors.textSecondary }]}>
                      {evaluation.ruleBasedScore.hasClosing
                        ? 'Good closing detected'
                        : 'Consider adding a closing phrase'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}

        {/* Self-Check Criteria */}
        <Animated.View entering={FadeInUp.duration(300).delay(200)}>
          <Card
            style={[
              styles.selfCheckCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <View style={styles.selfCheckHeader}>
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                  Self-Check
                </Text>
                <Text style={[styles.checkCount, { color: colors.textSecondary }]}>
                  {checkedCount}/{totalCheckItems}
                </Text>
              </View>
              <Text style={[styles.selfCheckHint, { color: colors.textSecondary }]}>
                Review your writing and check what you did well
              </Text>

              {Object.entries(checklistByCategory).map(([category, items]) => {
                if (items.length === 0) return null;
                return (
                  <View key={category} style={styles.checkCategory}>
                    <View style={styles.checkCategoryHeader}>
                      <MaterialCommunityIcons
                        name={(CATEGORY_ICONS[category] || 'help-circle') as any}
                        size={14}
                        color={CATEGORY_COLORS[category] || colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.checkCategoryTitle,
                          { color: CATEGORY_COLORS[category] || colors.text },
                        ]}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </View>
                    {items.map((item) => {
                      const isChecked = selfCheckItems.has(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          style={[
                            styles.checkItem,
                            {
                              backgroundColor: isChecked
                                ? 'rgba(34, 197, 94, 0.1)'
                                : isDark
                                  ? '#2C2C2E'
                                  : COLORS.surface,
                            },
                          ]}
                          onPress={() => handleToggleCheck(item.id)}
                        >
                          <MaterialCommunityIcons
                            name={
                              isChecked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'
                            }
                            size={20}
                            color={isChecked ? '#22c55e' : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.checkItemText,
                              { color: isChecked ? '#22c55e' : colors.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Your Writing / Sample Answer Toggle */}
        <Animated.View entering={FadeInUp.duration(300).delay(250)}>
          <View style={styles.textToggles}>
            <Pressable
              style={[
                styles.textToggle,
                {
                  backgroundColor: showOriginalText
                    ? COLORS.primary
                    : isDark
                      ? '#2C2C2E'
                      : COLORS.surface,
                },
              ]}
              onPress={() => {
                setShowOriginalText(!showOriginalText);
                setShowSampleAnswer(false);
                learnHaptics.selection();
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={showOriginalText ? '#fff' : colors.text}
              />
              <Text
                style={[styles.textToggleText, { color: showOriginalText ? '#fff' : colors.text }]}
              >
                My Writing
              </Text>
            </Pressable>

            {sampleAnswer && (
              <Pressable
                style={[
                  styles.textToggle,
                  {
                    backgroundColor: showSampleAnswer
                      ? COLORS.primary
                      : isDark
                        ? '#2C2C2E'
                        : COLORS.surface,
                  },
                ]}
                onPress={() => {
                  setShowSampleAnswer(!showSampleAnswer);
                  setShowOriginalText(false);
                  learnHaptics.selection();
                }}
              >
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={18}
                  color={showSampleAnswer ? '#fff' : colors.text}
                />
                <Text
                  style={[
                    styles.textToggleText,
                    { color: showSampleAnswer ? '#fff' : colors.text },
                  ]}
                >
                  Sample Answer
                </Text>
              </Pressable>
            )}
          </View>

          {showOriginalText && (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Card
                style={[styles.textCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
              >
                <Card.Content>
                  <Text style={[styles.textContent, { color: colors.text }]}>{originalText}</Text>
                </Card.Content>
              </Card>
            </Animated.View>
          )}

          {showSampleAnswer && sampleAnswer && (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Card style={[styles.textCard, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Card.Content>
                  <View style={styles.sampleHeader}>
                    <MaterialCommunityIcons name="star" size={16} color="#22c55e" />
                    <Text style={[styles.sampleLabel, { color: '#22c55e' }]}>Sample Answer</Text>
                  </View>
                  <Text style={[styles.textContent, { color: colors.text }]}>{sampleAnswer}</Text>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
        </Animated.View>

        {/* Strengths & Improvements */}
        <Animated.View entering={FadeInUp.duration(300).delay(300)}>
          <View style={styles.feedbackGrid}>
            {/* Strengths */}
            {evaluation.strengths.length > 0 && (
              <Card style={[styles.feedbackCard, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Card.Content>
                  <View style={styles.feedbackHeader}>
                    <MaterialCommunityIcons name="thumb-up" size={18} color="#22c55e" />
                    <Text style={[styles.feedbackTitle, { color: '#22c55e' }]}>Strengths</Text>
                  </View>
                  {evaluation.strengths.map((strength, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <MaterialCommunityIcons name="check" size={14} color="#22c55e" />
                      <Text style={[styles.feedbackItemText, { color: colors.text }]}>
                        {strength}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Improvements */}
            {evaluation.improvements.length > 0 && (
              <Card style={[styles.feedbackCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Card.Content>
                  <View style={styles.feedbackHeader}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#f59e0b" />
                    <Text style={[styles.feedbackTitle, { color: '#f59e0b' }]}>To Improve</Text>
                  </View>
                  {evaluation.improvements.map((improvement, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <MaterialCommunityIcons name="arrow-right" size={14} color="#f59e0b" />
                      <Text style={[styles.feedbackItemText, { color: colors.text }]}>
                        {improvement}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </View>
        </Animated.View>

        {/* Self-Rating */}
        <Animated.View entering={FadeInUp.duration(300).delay(350)}>
          <Card
            style={[styles.ratingCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                How would you rate your writing?
              </Text>

              <View style={styles.ratingButtons}>
                <Pressable
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor:
                        selectedRating === 'excellent'
                          ? '#22c55e'
                          : isDark
                            ? '#1C1C1E'
                            : COLORS.background,
                      borderColor: selectedRating === 'excellent' ? '#22c55e' : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectRating('excellent')}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={24}
                    color={selectedRating === 'excellent' ? '#fff' : '#22c55e'}
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: selectedRating === 'excellent' ? '#fff' : colors.text },
                    ]}
                  >
                    Excellent
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor:
                        selectedRating === 'good'
                          ? '#3b82f6'
                          : isDark
                            ? '#1C1C1E'
                            : COLORS.background,
                      borderColor: selectedRating === 'good' ? '#3b82f6' : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectRating('good')}
                >
                  <MaterialCommunityIcons
                    name="thumb-up"
                    size={24}
                    color={selectedRating === 'good' ? '#fff' : '#3b82f6'}
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: selectedRating === 'good' ? '#fff' : colors.text },
                    ]}
                  >
                    Good
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor:
                        selectedRating === 'needs_practice'
                          ? '#f59e0b'
                          : isDark
                            ? '#1C1C1E'
                            : COLORS.background,
                      borderColor: selectedRating === 'needs_practice' ? '#f59e0b' : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectRating('needs_practice')}
                >
                  <MaterialCommunityIcons
                    name="reload"
                    size={24}
                    color={selectedRating === 'needs_practice' ? '#fff' : '#f59e0b'}
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: selectedRating === 'needs_practice' ? '#fff' : colors.text },
                    ]}
                  >
                    Practice
                  </Text>
                </Pressable>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.duration(300).delay(400)} style={styles.actionsContainer}>
          {onRetry && (
            <Pressable
              style={[styles.retryButton, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
              onPress={handleRetry}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
              <Text style={[styles.retryButtonText, { color: COLORS.primary }]}>Revise</Text>
            </Pressable>
          )}

          {onContinue && (
            <Pressable
              style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  scoreCard: {
    marginBottom: SIZES.spacing.md,
  },
  scoreCardContent: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  scorePercent: {
    fontSize: 14,
    position: 'absolute',
    bottom: 20,
    right: 15,
  },
  scoreLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.md,
  },
  scoreLabel: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  statValue: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  statDivider: {
    width: 1,
    height: 20,
    opacity: 0.3,
  },
  categoriesCard: {
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  categoryItem: {
    width: '48%',
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  categoryName: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryScoreBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: SIZES.spacing.xs,
  },
  categoryScoreFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryScore: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  categoryFeedback: {
    fontSize: SIZES.fontSize.xs,
    lineHeight: 16,
  },
  analysisCard: {
    marginBottom: SIZES.spacing.md,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  analysisContent: {
    flex: 1,
  },
  analysisLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
    marginBottom: SIZES.spacing.xs,
  },
  analysisValue: {
    fontSize: SIZES.fontSize.sm,
  },
  keywordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  keywordTag: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
  },
  keywordText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  selfCheckCard: {
    marginBottom: SIZES.spacing.md,
  },
  selfCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
  },
  checkCount: {
    marginLeft: 'auto',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  selfCheckHint: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.md,
  },
  checkCategory: {
    marginBottom: SIZES.spacing.md,
  },
  checkCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  checkCategoryTitle: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.xs,
  },
  checkItemText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
  },
  textToggles: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  textToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  textToggleText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  textCard: {
    marginBottom: SIZES.spacing.md,
  },
  textContent: {
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  sampleLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  feedbackGrid: {
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  feedbackCard: {
    borderRadius: SIZES.borderRadius.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  feedbackTitle: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  feedbackItemText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  ratingCard: {
    marginBottom: SIZES.spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    gap: SIZES.spacing.xs,
  },
  ratingButtonText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xl,
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
  retryButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default WritingFeedback;
