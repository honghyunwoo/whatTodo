/**
 * PronunciationFeedback Component
 * Self-evaluation UI for pronunciation practice
 * API-FREE: No automatic scoring - user self-evaluates
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import speechService from '@/services/speechService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface SelfCheckCriterion {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface PronunciationFeedbackProps {
  expectedText: string;
  recordedAudioUri: string | null;
  onRetry: () => void;
  onContinue: () => void;
  onSelfEvaluate?: (rating: 'excellent' | 'good' | 'needs_practice') => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const SELF_CHECK_CRITERIA: SelfCheckCriterion[] = [
  {
    id: 'clarity',
    label: 'Clarity',
    description: 'Did I speak clearly without mumbling?',
    icon: 'volume-high',
  },
  {
    id: 'rhythm',
    label: 'Rhythm',
    description: 'Did I maintain natural rhythm and pace?',
    icon: 'metronome',
  },
  {
    id: 'stress',
    label: 'Word Stress',
    description: 'Did I stress the right syllables?',
    icon: 'format-bold',
  },
  {
    id: 'intonation',
    label: 'Intonation',
    description: 'Did my voice go up and down naturally?',
    icon: 'chart-line-variant',
  },
];

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function PronunciationFeedback({
  expectedText,
  recordedAudioUri,
  onRetry,
  onContinue,
  onSelfEvaluate,
}: PronunciationFeedbackProps) {
  const { colors, isDark } = useTheme();

  // State
  const [checkedCriteria, setCheckedCriteria] = useState<Set<string>>(new Set());
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [selectedRating, setSelectedRating] = useState<
    'excellent' | 'good' | 'needs_practice' | null
  >(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  // Calculate self-evaluation score
  const checkedCount = checkedCriteria.size;
  const totalCriteria = SELF_CHECK_CRITERIA.length;

  // ─────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────

  const handleToggleCriterion = useCallback((id: string) => {
    setCheckedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    learnHaptics.selection();
  }, []);

  const handlePlayModel = useCallback(
    async (speed: 'slow' | 'normal') => {
      if (isTTSPlaying) {
        await speechService.stopTTS();
        setIsTTSPlaying(false);
        return;
      }

      try {
        setIsTTSPlaying(true);
        learnHaptics.selection();

        if (speed === 'slow') {
          await speechService.playSlowPronunciation(expectedText);
        } else {
          await speechService.playNormalPronunciation(expectedText);
        }
      } catch (error) {
        console.error('TTS playback failed:', error);
      } finally {
        setIsTTSPlaying(false);
      }
    },
    [isTTSPlaying, expectedText]
  );

  const handlePlayRecording = useCallback(async () => {
    if (!recordedAudioUri) return;

    if (isPlayingRecording) {
      await speechService.stopPlayback();
      setIsPlayingRecording(false);
      return;
    }

    try {
      setIsPlayingRecording(true);
      learnHaptics.selection();
      await speechService.playAudio(recordedAudioUri);
    } catch (error) {
      console.error('Playback failed:', error);
    } finally {
      playbackTimerRef.current = setTimeout(() => setIsPlayingRecording(false), 3000);
    }
  }, [recordedAudioUri, isPlayingRecording]);

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
    onRetry();
  }, [onRetry]);

  const handleContinue = useCallback(() => {
    learnHaptics.impact();
    onContinue();
  }, [onContinue]);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Expected Text Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <Card style={[styles.textCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
            <Card.Content>
              <View style={styles.textHeader}>
                <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
                <Text style={[styles.textLabel, { color: colors.textSecondary }]}>
                  Practice Text
                </Text>
              </View>
              <Text style={[styles.expectedText, { color: colors.text }]}>
                &ldquo;{expectedText}&rdquo;
              </Text>
            </Card.Content>
          </Card>
        </MotiView>

        {/* Playback Comparison Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 100 }}
        >
          <Card
            style={[
              styles.comparisonCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Compare Your Pronunciation
              </Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                Listen to both and compare the differences
              </Text>

              <View style={styles.playbackButtons}>
                {/* Model Pronunciation */}
                <View style={styles.playbackColumn}>
                  <Text style={[styles.playbackLabel, { color: colors.textSecondary }]}>Model</Text>
                  <View style={styles.modelButtons}>
                    <Pressable
                      style={[
                        styles.playButton,
                        { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                      ]}
                      onPress={() => handlePlayModel('slow')}
                    >
                      <MaterialCommunityIcons
                        name={isTTSPlaying ? 'stop' : 'play-speed'}
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.playButtonText, { color: colors.text }]}>Slow</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.playButton,
                        { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                      ]}
                      onPress={() => handlePlayModel('normal')}
                    >
                      <MaterialCommunityIcons
                        name={isTTSPlaying ? 'stop' : 'volume-high'}
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.playButtonText, { color: colors.text }]}>Normal</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.textSecondary }]} />

                {/* My Recording */}
                <View style={styles.playbackColumn}>
                  <Text style={[styles.playbackLabel, { color: colors.textSecondary }]}>
                    My Recording
                  </Text>
                  <Pressable
                    style={[
                      styles.myRecordingButton,
                      {
                        backgroundColor: recordedAudioUri
                          ? isPlayingRecording
                            ? '#f59e0b'
                            : '#22c55e'
                          : COLORS.border,
                      },
                    ]}
                    onPress={handlePlayRecording}
                    disabled={!recordedAudioUri}
                  >
                    <MaterialCommunityIcons
                      name={isPlayingRecording ? 'stop' : 'play'}
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.myRecordingButtonText}>
                      {isPlayingRecording ? 'Stop' : 'Play'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Card.Content>
          </Card>
        </MotiView>

        {/* Self-Check Criteria */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 200 }}
        >
          <Card
            style={[styles.criteriaCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <View style={styles.criteriaHeader}>
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Self-Check</Text>
                <Text style={[styles.criteriaCount, { color: colors.textSecondary }]}>
                  {checkedCount}/{totalCriteria}
                </Text>
              </View>

              <View style={styles.criteriaList}>
                {SELF_CHECK_CRITERIA.map((criterion) => {
                  const isChecked = checkedCriteria.has(criterion.id);
                  return (
                    <Pressable
                      key={criterion.id}
                      style={[
                        styles.criterionItem,
                        {
                          backgroundColor: isChecked
                            ? 'rgba(34, 197, 94, 0.1)'
                            : isDark
                              ? '#1C1C1E'
                              : COLORS.background,
                          borderColor: isChecked ? '#22c55e' : 'transparent',
                        },
                      ]}
                      onPress={() => handleToggleCriterion(criterion.id)}
                    >
                      <MaterialCommunityIcons
                        name={
                          isChecked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'
                        }
                        size={24}
                        color={isChecked ? '#22c55e' : colors.textSecondary}
                      />
                      <View style={styles.criterionContent}>
                        <View style={styles.criterionTitleRow}>
                          <MaterialCommunityIcons
                            name={criterion.icon as any}
                            size={16}
                            color={isChecked ? '#22c55e' : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.criterionLabel,
                              { color: isChecked ? '#22c55e' : colors.text },
                            ]}
                          >
                            {criterion.label}
                          </Text>
                        </View>
                        <Text
                          style={[styles.criterionDescription, { color: colors.textSecondary }]}
                        >
                          {criterion.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        </MotiView>

        {/* Self-Rating Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 300 }}
        >
          <Card
            style={[styles.ratingCard, { backgroundColor: isDark ? '#1C1C1E' : COLORS.background }]}
          >
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                How would you rate your attempt?
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
                            ? '#2C2C2E'
                            : COLORS.surface,
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
                        selectedRating === 'good' ? '#3b82f6' : isDark ? '#2C2C2E' : COLORS.surface,
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
                            ? '#2C2C2E'
                            : COLORS.surface,
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
                    Practice More
                  </Text>
                </Pressable>
              </View>
            </Card.Content>
          </Card>
        </MotiView>

        {/* Tips Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 400 }}
        >
          <View style={[styles.tipsContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#f59e0b" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Tips for improvement:</Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                {checkedCount < 2
                  ? 'Try speaking slower and focus on each word. Listen to the model multiple times.'
                  : checkedCount < totalCriteria
                    ? 'Good progress! Pay attention to the unchecked areas for improvement.'
                    : 'Great job! Keep practicing to maintain your pronunciation skills.'}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 500 }}
          style={styles.actionsContainer}
        >
          <Pressable
            style={[styles.retryButton, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
            onPress={handleRetry}
          >
            <MaterialCommunityIcons name="replay" size={20} color={COLORS.primary} />
            <Text style={[styles.retryButtonText, { color: COLORS.primary }]}>Try Again</Text>
          </Pressable>

          <Pressable
            style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </MotiView>
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
  textCard: {
    marginBottom: SIZES.spacing.md,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  textLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  expectedText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'center',
  },
  comparisonCard: {
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  sectionHint: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.md,
  },
  playbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playbackColumn: {
    flex: 1,
    alignItems: 'center',
  },
  playbackLabel: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: SIZES.spacing.sm,
  },
  modelButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  playButtonText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 60,
    marginHorizontal: SIZES.spacing.md,
    opacity: 0.3,
  },
  myRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  myRecordingButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  criteriaCard: {
    marginBottom: SIZES.spacing.md,
  },
  criteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  criteriaCount: {
    marginLeft: 'auto',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  criteriaList: {
    gap: SIZES.spacing.sm,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
  },
  criterionContent: {
    flex: 1,
  },
  criterionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  criterionLabel: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  criterionDescription: {
    fontSize: SIZES.fontSize.sm,
  },
  ratingCard: {
    marginBottom: SIZES.spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
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
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: SIZES.spacing.xs,
  },
  tipsText: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
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

export default PronunciationFeedback;
