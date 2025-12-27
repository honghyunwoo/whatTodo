/**
 * SpeechRecorder Component
 * Audio recording + TTS playback for pronunciation practice
 * API-FREE: Uses expo-speech for TTS, expo-av for recording/playback
 * Self-check mode: User compares their recording with TTS model
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import speechService from '@/services/speechService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

type RecorderPhase =
  | 'ready' // Initial state - ready to play model
  | 'recording' // Recording user voice
  | 'recorded' // Recording complete, ready for playback
  | 'self-check'; // Showing self-check options

interface SpeechRecorderProps {
  expectedText: string;
  onComplete: (satisfied: boolean) => void;
  onSkip?: () => void;
  disabled?: boolean;
  maxDuration?: number;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const DEFAULT_MAX_DURATION = 30;
const AUDIO_LEVEL_BARS = 5;

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function SpeechRecorder({
  expectedText,
  onComplete,
  onSkip,
  disabled = false,
  maxDuration = DEFAULT_MAX_DURATION,
}: SpeechRecorderProps) {
  const { colors, isDark } = useTheme();

  // Phase management
  const [phase, setPhase] = useState<RecorderPhase>('ready');

  // Recording state
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(AUDIO_LEVEL_BARS).fill(0));
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  // TTS state
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<'slow' | 'normal'>('normal');

  // Playback state
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(0);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const recordingIndicatorStyle = useAnimatedStyle(() => ({
    opacity: recordingOpacity.value,
  }));

  // Pulse animation when recording
  useEffect(() => {
    if (phase === 'recording') {
      pulseScale.value = withRepeat(withSpring(1.2, { damping: 2, stiffness: 80 }), -1, true);
      recordingOpacity.value = withTiming(1, { duration: 200 });
    } else {
      pulseScale.value = withSpring(1);
      recordingOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [phase, pulseScale, recordingOpacity]);

  // Audio level visualization
  useEffect(() => {
    if (phase === 'recording') {
      audioLevelTimerRef.current = setInterval(() => {
        setAudioLevels(
          Array(AUDIO_LEVEL_BARS)
            .fill(0)
            .map(() => Math.random() * 0.8 + 0.2)
        );
      }, 100);
    } else {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
      setAudioLevels(Array(AUDIO_LEVEL_BARS).fill(0));
    }

    return () => {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    };
  }, [phase]);

  // Duration timer
  useEffect(() => {
    if (phase === 'recording') {
      setDuration(0);
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            handleStopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [phase, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechService.stopTTS();
      speechService.stopPlayback();
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────
  // TTS Handlers
  // ─────────────────────────────────────

  const handlePlayModel = useCallback(
    async (speed: 'slow' | 'normal') => {
      if (disabled || isTTSPlaying) return;

      try {
        await learnHaptics.selection();
        setIsTTSPlaying(true);
        setTtsSpeed(speed);

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
    [disabled, isTTSPlaying, expectedText]
  );

  const handleStopTTS = useCallback(async () => {
    await speechService.stopTTS();
    setIsTTSPlaying(false);
  }, []);

  // ─────────────────────────────────────
  // Recording Handlers
  // ─────────────────────────────────────

  const handleStartRecording = useCallback(async () => {
    if (disabled || phase === 'recording') return;

    try {
      await learnHaptics.impact();
      setRecordedUri(null);
      setPhase('recording');
      await speechService.startRecording();
    } catch (error) {
      setPhase('ready');
      console.error('Failed to start recording:', error);
    }
  }, [disabled, phase]);

  const handleStopRecording = useCallback(async () => {
    if (phase !== 'recording') return;

    try {
      await learnHaptics.impact();
      const result = await speechService.stopAndAnalyze(expectedText);

      if (result.audioUri) {
        setRecordedUri(result.audioUri);
        setPhase('recorded');
      } else {
        setPhase('ready');
      }
    } catch (error) {
      setPhase('ready');
      console.error('Failed to stop recording:', error);
    }
  }, [phase, expectedText]);

  const handleCancelRecording = useCallback(async () => {
    await speechService.cancelRecording();
    setPhase('ready');
    setRecordedUri(null);
  }, []);

  // ─────────────────────────────────────
  // Playback Handlers
  // ─────────────────────────────────────

  const handlePlayRecording = useCallback(async () => {
    if (!recordedUri || isPlayingRecording) return;

    try {
      await learnHaptics.selection();
      setIsPlayingRecording(true);
      await speechService.playAudio(recordedUri);
    } catch (error) {
      console.error('Failed to play recording:', error);
    } finally {
      // Note: This will fire immediately since playAudio doesn't wait for completion
      // In a real implementation, we'd want to track the sound playback status
      playbackTimerRef.current = setTimeout(() => setIsPlayingRecording(false), 3000);
    }
  }, [recordedUri, isPlayingRecording]);

  const handleStopPlayback = useCallback(async () => {
    await speechService.stopPlayback();
    setIsPlayingRecording(false);
  }, []);

  // ─────────────────────────────────────
  // Self-Check Handlers
  // ─────────────────────────────────────

  const handleShowSelfCheck = useCallback(() => {
    setPhase('self-check');
    learnHaptics.selection();
  }, []);

  const handleSelfCheck = useCallback(
    (satisfied: boolean) => {
      learnHaptics.impact();
      onComplete(satisfied);

      // Reset state for next attempt if not satisfied
      if (!satisfied) {
        setPhase('ready');
        setRecordedUri(null);
      }
    },
    [onComplete]
  );

  const handleRetry = useCallback(() => {
    setPhase('ready');
    setRecordedUri(null);
    learnHaptics.selection();
  }, []);

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Expected Text Display */}
      <View style={[styles.textCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
        <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.textSecondary} />
        <Text style={[styles.expectedText, { color: colors.text }]}>{expectedText}</Text>
        <MaterialCommunityIcons name="format-quote-close" size={16} color={colors.textSecondary} />
      </View>

      {/* TTS Model Pronunciation Buttons */}
      <View style={styles.ttsButtonsContainer}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Model Pronunciation
        </Text>
        <View style={styles.ttsButtons}>
          <Pressable
            style={[
              styles.ttsButton,
              {
                backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
                borderColor: isTTSPlaying && ttsSpeed === 'slow' ? COLORS.primary : 'transparent',
                borderWidth: 2,
              },
            ]}
            onPress={() => (isTTSPlaying ? handleStopTTS() : handlePlayModel('slow'))}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name={isTTSPlaying && ttsSpeed === 'slow' ? 'stop' : 'play-speed'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={[styles.ttsButtonText, { color: colors.text }]}>Slow</Text>
          </Pressable>

          <Pressable
            style={[
              styles.ttsButton,
              {
                backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
                borderColor: isTTSPlaying && ttsSpeed === 'normal' ? COLORS.primary : 'transparent',
                borderWidth: 2,
              },
            ]}
            onPress={() => (isTTSPlaying ? handleStopTTS() : handlePlayModel('normal'))}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name={isTTSPlaying && ttsSpeed === 'normal' ? 'stop' : 'volume-high'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={[styles.ttsButtonText, { color: colors.text }]}>Normal</Text>
          </Pressable>
        </View>
      </View>

      {/* Audio Level Visualization */}
      <View style={styles.levelsContainer}>
        {audioLevels.map((level, index) => (
          <View
            key={index}
            style={[
              styles.levelBar,
              {
                height: level * 40 + 8,
                backgroundColor: phase === 'recording' ? '#ef4444' : COLORS.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Recording Button */}
      {(phase === 'ready' || phase === 'recording') && (
        <View style={styles.buttonContainer}>
          {/* Pulse Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle,
              recordingIndicatorStyle,
              { borderColor: '#ef4444' },
            ]}
          />

          <Pressable
            style={[
              styles.recordButton,
              {
                backgroundColor: phase === 'recording' ? '#ef4444' : COLORS.primary,
              },
            ]}
            onPress={phase === 'recording' ? handleStopRecording : handleStartRecording}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name={phase === 'recording' ? 'stop' : 'microphone'}
              size={32}
              color="#fff"
            />
          </Pressable>
        </View>
      )}

      {/* Duration Display */}
      {phase === 'recording' && (
        <Animated.View entering={FadeInUp.duration(200)} style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          <Text style={[styles.maxDurationText, { color: colors.textSecondary }]}>
            / {formatDuration(maxDuration)}
          </Text>
        </Animated.View>
      )}

      {/* Status Text */}
      {(phase === 'ready' || phase === 'recording') && (
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {phase === 'recording' ? 'Tap to stop' : 'Tap to record your voice'}
        </Text>
      )}

      {/* Recorded Phase - Playback and Self-Check */}
      {phase === 'recorded' && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.recordedContainer}>
          <View
            style={[styles.recordedCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
          >
            <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />
            <Text style={[styles.recordedText, { color: colors.text }]}>Recording complete!</Text>
          </View>

          {/* Playback Button */}
          <Pressable
            style={[
              styles.playbackButton,
              {
                backgroundColor: isPlayingRecording ? '#f59e0b' : COLORS.primary,
              },
            ]}
            onPress={isPlayingRecording ? handleStopPlayback : handlePlayRecording}
          >
            <MaterialCommunityIcons
              name={isPlayingRecording ? 'stop' : 'play'}
              size={24}
              color="#fff"
            />
            <Text style={styles.playbackButtonText}>
              {isPlayingRecording ? 'Stop' : 'Play My Recording'}
            </Text>
          </Pressable>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.retryButton, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
              onPress={handleRetry}
            >
              <MaterialCommunityIcons name="replay" size={20} color={colors.text} />
              <Text style={[styles.retryButtonText, { color: colors.text }]}>Record Again</Text>
            </Pressable>

            <Pressable
              style={[styles.checkButton, { backgroundColor: '#22c55e' }]}
              onPress={handleShowSelfCheck}
            >
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.checkButtonText}>Compare & Rate</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Self-Check Phase */}
      {phase === 'self-check' && (
        <Animated.View entering={ZoomIn.duration(300)} style={styles.selfCheckContainer}>
          <View
            style={[
              styles.selfCheckCard,
              { backgroundColor: isDark ? '#1C1C1E' : COLORS.background },
            ]}
          >
            <MaterialCommunityIcons name="head-question" size={32} color={COLORS.primary} />
            <Text style={[styles.selfCheckTitle, { color: colors.text }]}>
              How was your pronunciation?
            </Text>
            <Text style={[styles.selfCheckHint, { color: colors.textSecondary }]}>
              Compare your recording with the model pronunciation
            </Text>

            {/* Quick playback buttons */}
            <View style={styles.quickPlayButtons}>
              <Pressable
                style={[
                  styles.quickPlayButton,
                  { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                ]}
                onPress={() => handlePlayModel('normal')}
              >
                <MaterialCommunityIcons name="account-voice" size={16} color={COLORS.primary} />
                <Text style={[styles.quickPlayText, { color: colors.text }]}>Model</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.quickPlayButton,
                  { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                ]}
                onPress={handlePlayRecording}
              >
                <MaterialCommunityIcons name="microphone" size={16} color="#f59e0b" />
                <Text style={[styles.quickPlayText, { color: colors.text }]}>Mine</Text>
              </Pressable>
            </View>

            {/* Self-Check Buttons */}
            <View style={styles.selfCheckButtons}>
              <Pressable
                style={[styles.satisfiedButton, { backgroundColor: '#22c55e' }]}
                onPress={() => handleSelfCheck(true)}
              >
                <MaterialCommunityIcons name="thumb-up" size={24} color="#fff" />
                <Text style={styles.selfCheckButtonText}>Good enough!</Text>
              </Pressable>

              <Pressable
                style={[styles.unsatisfiedButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleSelfCheck(false)}
              >
                <MaterialCommunityIcons name="replay" size={24} color="#fff" />
                <Text style={styles.selfCheckButtonText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Instructions */}
      {phase === 'ready' && (
        <View
          style={[styles.instructionBox, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}
        >
          <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#f59e0b" />
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Listen to the model first, then record yourself
          </Text>
        </View>
      )}

      {/* Skip Button */}
      {onSkip && phase === 'ready' && (
        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
            Skip this exercise
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.md,
  },
  textCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.xs,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.lg,
    width: '100%',
  },
  expectedText: {
    flex: 1,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '500',
    lineHeight: 28,
    textAlign: 'center',
  },
  ttsButtonsContainer: {
    width: '100%',
    marginBottom: SIZES.spacing.lg,
  },
  sectionLabel: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  ttsButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.spacing.md,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  ttsButtonText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
    height: 50,
    marginBottom: SIZES.spacing.lg,
  },
  levelBar: {
    width: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  durationText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    color: '#ef4444',
  },
  maxDurationText: {
    fontSize: SIZES.fontSize.md,
  },
  statusText: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.md,
  },
  recordedContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  recordedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    width: '100%',
  },
  recordedText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.xl,
    borderRadius: SIZES.borderRadius.md,
    width: '100%',
  },
  playbackButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    width: '100%',
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
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  checkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  selfCheckContainer: {
    width: '100%',
  },
  selfCheckCard: {
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    gap: SIZES.spacing.md,
  },
  selfCheckTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  selfCheckHint: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'center',
  },
  quickPlayButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginVertical: SIZES.spacing.sm,
  },
  quickPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.full,
  },
  quickPlayText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  selfCheckButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    width: '100%',
    marginTop: SIZES.spacing.sm,
  },
  satisfiedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  unsatisfiedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  selfCheckButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.md,
  },
  instructionText: {
    fontSize: SIZES.fontSize.sm,
  },
  skipButton: {
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
  },
  skipButtonText: {
    fontSize: SIZES.fontSize.sm,
  },
});

export default SpeechRecorder;
