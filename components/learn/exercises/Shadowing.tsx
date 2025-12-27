/**
 * Shadowing Exercise Component
 * 원어민 음성 따라 읽기 훈련
 *
 * TTS로 문장을 들려주고 사용자가 따라 읽도록 유도
 * 발음 녹음 및 비교 기능 (expo-av 사용)
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface ShadowingSentence {
  id: string;
  text: string; // English sentence
  translation: string; // Korean translation
  pronunciation?: string; // IPA or phonetic guide
  tips?: string; // Pronunciation tips in Korean
  speed: number; // Default speaking speed (0.6-1.2)
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ShadowingResult {
  sentenceId: string;
  completed: boolean;
  practiceCount: number;
  recordingUri?: string;
  timeSpent: number;
  selfRating?: 1 | 2 | 3 | 4 | 5; // User's self assessment
}

interface ShadowingProps {
  sentences: ShadowingSentence[];
  onComplete: (results: ShadowingResult[]) => void;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const SPEEDS = [0.6, 0.8, 1.0, 1.2];
const SPEED_LABELS: Record<number, string> = {
  0.6: '매우 느리게',
  0.8: '느리게',
  1.0: '보통',
  1.2: '빠르게',
};

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function Shadowing({ sentences, onComplete }: ShadowingProps) {
  const { colors, isDark } = useTheme();
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ShadowingResult[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [practiceCount, setPracticeCount] = useState(0);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1.0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // UI state
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selfRating, setSelfRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const currentSentence = sentences[currentIndex];
  const isLastSentence = currentIndex === sentences.length - 1;
  const progress = ((currentIndex + 1) / sentences.length) * 100;

  // Request audio permissions
  useEffect(() => {
    async function requestPermissions() {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        setPermissionGranted(granted);
        if (granted) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        }
      } catch {
        setPermissionGranted(false);
      }
    }
    requestPermissions();
  }, []);

  // Set initial speed from sentence
  useEffect(() => {
    if (currentSentence.speed) {
      const closestSpeed = SPEEDS.reduce((prev, curr) =>
        Math.abs(curr - currentSentence.speed) < Math.abs(prev - currentSentence.speed)
          ? curr
          : prev
      );
      setCurrentSpeed(closestSpeed);
    }
  }, [currentSentence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  // Play the sentence
  const playSentence = useCallback(async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPracticeCount((prev) => prev + 1);

    try {
      await Speech.speak(currentSentence.text, {
        language: 'en-US',
        rate: currentSpeed,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, currentSentence.text, currentSpeed]);

  // Stop playing
  const stopPlaying = useCallback(() => {
    Speech.stop();
    setIsPlaying(false);
  }, []);

  // Change playback speed
  const changeSpeed = useCallback(() => {
    const currentIdx = SPEEDS.indexOf(currentSpeed);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    setCurrentSpeed(SPEEDS[nextIdx]);
    learnHaptics.selection();
  }, [currentSpeed]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!permissionGranted) return;

    try {
      // Stop any playing audio first
      Speech.stop();
      if (sound.current) {
        await sound.current.stopAsync();
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingUri(null);
      learnHaptics.selection();
    } catch {
      console.warn('Failed to start recording');
    }
  }, [permissionGranted]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!recording.current) return;

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      setIsRecording(false);
      if (uri) {
        setRecordingUri(uri);
      }
      learnHaptics.selection();
    } catch {
      setIsRecording(false);
    }
  }, []);

  // Play recorded audio
  const playRecording = useCallback(async () => {
    if (!recordingUri || isPlayingRecording) return;

    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      sound.current = newSound;
      setIsPlayingRecording(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingRecording(false);
        }
      });
    } catch {
      setIsPlayingRecording(false);
    }
  }, [recordingUri, isPlayingRecording]);

  // Handle self rating
  const handleRating = useCallback((rating: 1 | 2 | 3 | 4 | 5) => {
    setSelfRating(rating);
    learnHaptics.selection();
  }, []);

  // Handle next
  const handleNext = useCallback(async () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const result: ShadowingResult = {
      sentenceId: currentSentence.id,
      completed: true,
      practiceCount,
      recordingUri: recordingUri || undefined,
      timeSpent,
      selfRating: selfRating || undefined,
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (isLastSentence) {
      onComplete(newResults);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setPracticeCount(0);
      setRecordingUri(null);
      setShowTranslation(false);
      setShowTips(false);
      setSelfRating(null);
      setStartTime(Date.now());
    }
  }, [
    currentSentence.id,
    practiceCount,
    recordingUri,
    selfRating,
    results,
    isLastSentence,
    onComplete,
    startTime,
  ]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return COLORS.textSecondary;
    }
  };

  // Rating stars
  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
          내 발음은 어땠나요?
        </Text>
        <View style={styles.stars}>
          {([1, 2, 3, 4, 5] as const).map((star) => (
            <Pressable key={star} onPress={() => handleRating(star)} style={styles.starButton}>
              <MaterialCommunityIcons
                name={selfRating && selfRating >= star ? 'star' : 'star-outline'}
                size={32}
                color={selfRating && selfRating >= star ? '#f59e0b' : colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
        {selfRating && (
          <Text style={[styles.ratingFeedback, { color: colors.textSecondary }]}>
            {selfRating === 1
              ? '더 연습해봐요!'
              : selfRating === 2
                ? '조금 더 노력해봐요'
                : selfRating === 3
                  ? '괜찮아요!'
                  : selfRating === 4
                    ? '잘했어요!'
                    : '완벽해요!'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Progress Bar */}
      <View
        style={[styles.progressContainer, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
      >
        <View
          style={[styles.progressBar, { backgroundColor: COLORS.primary, width: `${progress}%` }]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {currentIndex + 1} / {sentences.length}
      </Text>

      {/* Sentence Card */}
      <Animated.View key={currentIndex} entering={FadeInUp.duration(300)}>
        <Card
          style={[styles.sentenceCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <Card.Content>
            {/* Difficulty Badge */}
            <View style={styles.difficultyBadge}>
              <View
                style={[
                  styles.difficultyDot,
                  { backgroundColor: getDifficultyColor(currentSentence.difficulty) },
                ]}
              />
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(currentSentence.difficulty) },
                ]}
              >
                {currentSentence.difficulty === 'easy'
                  ? '쉬움'
                  : currentSentence.difficulty === 'medium'
                    ? '보통'
                    : '어려움'}
              </Text>
            </View>

            {/* English Sentence */}
            <Text style={[styles.sentenceText, { color: colors.text }]}>
              {currentSentence.text}
            </Text>

            {/* Pronunciation Guide */}
            {currentSentence.pronunciation && (
              <Text style={[styles.pronunciationText, { color: colors.textSecondary }]}>
                {currentSentence.pronunciation}
              </Text>
            )}

            {/* Toggle Buttons */}
            <View style={styles.toggleButtons}>
              <Pressable
                style={[styles.toggleButton, showTranslation && styles.toggleButtonActive]}
                onPress={() => setShowTranslation(!showTranslation)}
              >
                <MaterialCommunityIcons
                  name="translate"
                  size={16}
                  color={showTranslation ? '#fff' : COLORS.primary}
                />
                <Text
                  style={[
                    styles.toggleButtonText,
                    showTranslation && styles.toggleButtonTextActive,
                  ]}
                >
                  번역
                </Text>
              </Pressable>

              {currentSentence.tips && (
                <Pressable
                  style={[styles.toggleButton, showTips && styles.toggleButtonActive]}
                  onPress={() => setShowTips(!showTips)}
                >
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={16}
                    color={showTips ? '#fff' : COLORS.primary}
                  />
                  <Text
                    style={[styles.toggleButtonText, showTips && styles.toggleButtonTextActive]}
                  >
                    팁
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Translation */}
            {showTranslation && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <Text style={[styles.translationText, { color: colors.textSecondary }]}>
                  {currentSentence.translation}
                </Text>
              </Animated.View>
            )}

            {/* Tips */}
            {showTips && currentSentence.tips && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <View style={styles.tipsContainer}>
                  <MaterialCommunityIcons name="lightbulb-on" size={18} color="#f59e0b" />
                  <Text style={[styles.tipsText, { color: colors.text }]}>
                    {currentSentence.tips}
                  </Text>
                </View>
              </Animated.View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Audio Controls */}
      <Animated.View entering={FadeInUp.duration(300).delay(100)}>
        <View style={styles.audioControls}>
          {/* Play/Stop Button */}
          <Pressable
            style={[styles.playButton, { backgroundColor: isPlaying ? '#ef4444' : COLORS.primary }]}
            onPress={isPlaying ? stopPlaying : playSentence}
          >
            <MaterialCommunityIcons name={isPlaying ? 'stop' : 'play'} size={36} color="#fff" />
          </Pressable>

          {/* Speed Control */}
          <Pressable
            style={[styles.speedButton, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
            onPress={changeSpeed}
          >
            <MaterialCommunityIcons name="speedometer" size={20} color={colors.text} />
            <Text style={[styles.speedText, { color: colors.text }]}>
              {SPEED_LABELS[currentSpeed]}
            </Text>
          </Pressable>

          {/* Practice Counter */}
          <View style={styles.practiceCounter}>
            <MaterialCommunityIcons name="replay" size={18} color={colors.textSecondary} />
            <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
              {practiceCount}회 연습
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Recording Section */}
      {permissionGranted && (
        <Animated.View entering={FadeInUp.duration(300).delay(200)}>
          <Card
            style={[styles.recordingCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <Card.Content>
              <Text style={[styles.recordingTitle, { color: colors.text }]}>내 발음 녹음하기</Text>
              <Text style={[styles.recordingSubtitle, { color: colors.textSecondary }]}>
                원어민 발음을 듣고 따라해보세요
              </Text>

              <View style={styles.recordingControls}>
                {/* Record Button */}
                <Pressable
                  style={[
                    styles.recordButton,
                    { backgroundColor: isRecording ? '#ef4444' : '#22c55e' },
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <MaterialCommunityIcons
                    name={isRecording ? 'stop' : 'microphone'}
                    size={28}
                    color="#fff"
                  />
                </Pressable>

                {/* Play Recording Button */}
                {recordingUri && (
                  <Pressable
                    style={[
                      styles.playRecordingButton,
                      { backgroundColor: isDark ? '#38383A' : COLORS.border },
                    ]}
                    onPress={playRecording}
                    disabled={isPlayingRecording}
                  >
                    <MaterialCommunityIcons
                      name={isPlayingRecording ? 'volume-high' : 'play'}
                      size={24}
                      color={colors.text}
                    />
                    <Text style={[styles.playRecordingText, { color: colors.text }]}>
                      {isPlayingRecording ? '재생 중...' : '내 녹음 듣기'}
                    </Text>
                  </Pressable>
                )}
              </View>

              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>녹음 중...</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Self Rating */}
      <Animated.View entering={FadeInUp.duration(300).delay(300)}>
        {renderRatingStars()}
      </Animated.View>

      {/* Next Button */}
      <Animated.View entering={ZoomIn.duration(300)}>
        <Pressable
          style={[
            styles.nextButton,
            {
              backgroundColor: practiceCount > 0 ? COLORS.primary : COLORS.border,
            },
          ]}
          onPress={handleNext}
          disabled={practiceCount === 0}
        >
          <Text
            style={[
              styles.nextButtonText,
              { color: practiceCount > 0 ? '#fff' : colors.textSecondary },
            ]}
          >
            {isLastSentence ? '완료' : '다음 문장'}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={practiceCount > 0 ? '#fff' : colors.textSecondary}
          />
        </Pressable>
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
  progressContainer: {
    height: 8,
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: SIZES.borderRadius.full,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
    marginBottom: SIZES.spacing.md,
  },
  sentenceCard: {
    marginBottom: SIZES.spacing.lg,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SIZES.spacing.md,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
  },
  sentenceText: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: SIZES.spacing.sm,
  },
  pronunciationText: {
    fontSize: SIZES.fontSize.md,
    fontFamily: 'monospace',
    marginBottom: SIZES.spacing.md,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: SIZES.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  translationText: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
  },
  tipsText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 22,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  speedText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  practiceCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  practiceText: {
    fontSize: SIZES.fontSize.sm,
  },
  recordingCard: {
    marginBottom: SIZES.spacing.lg,
  },
  recordingTitle: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  recordingSubtitle: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.md,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playRecordingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  playRecordingText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#ef4444',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  ratingLabel: {
    fontSize: SIZES.fontSize.md,
    marginBottom: SIZES.spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
  starButton: {
    padding: SIZES.spacing.xs,
  },
  ratingFeedback: {
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.sm,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  nextButtonText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default Shadowing;
