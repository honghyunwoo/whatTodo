/**
 * Speech Service
 * Audio recording + TTS playback for pronunciation practice
 * NO API REQUIRED - uses expo-speech for TTS, expo-av for recording/playback
 * NO EMOJI - uses icons only
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

import type {
  RecordingState,
  SpeechServiceConfig,
} from '@/types/speech';

// ─────────────────────────────────────
// Configuration
// ─────────────────────────────────────

const DEFAULT_CONFIG: SpeechServiceConfig = {
  maxRecordingDuration: 30, // 30 seconds max
  sampleRate: 44100,
  channels: 1,
  bitRate: 128000,
  language: 'en',
};

// Recording quality presets
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// ─────────────────────────────────────
// Speech Service Class
// ─────────────────────────────────────

class SpeechService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private config: SpeechServiceConfig;
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
  };

  // Callbacks for state updates
  private onStateChange?: (state: RecordingState) => void;
  private meteringInterval?: NodeJS.Timeout;

  constructor(config: Partial<SpeechServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ─────────────────────────────────────
  // Recording Methods
  // ─────────────────────────────────────

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(onStateChange?: (state: RecordingState) => void): Promise<boolean> {
    try {
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Set up audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and prepare recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await this.recording.startAsync();

      // Update state
      this.onStateChange = onStateChange;
      this.recordingState = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioLevel: 0,
      };

      // Start metering for audio level visualization
      this.startMetering();

      // Notify state change
      this.notifyStateChange();

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.cleanup();
      return false;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        return null;
      }

      // Stop metering
      this.stopMetering();

      // Stop and unload recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Update state
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        duration: this.recordingState.duration,
        audioLevel: 0,
      };
      this.notifyStateChange();

      // Cleanup
      this.recording = null;

      return uri || null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.cleanup();
      return null;
    }
  }

  /**
   * Cancel recording and discard audio
   */
  async cancelRecording(): Promise<void> {
    this.stopMetering();
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // Ignore errors during cancellation
      }
    }
    this.cleanup();
  }

  // ─────────────────────────────────────
  // Playback Methods
  // ─────────────────────────────────────

  /**
   * Play recorded audio
   */
  async playAudio(uri: string): Promise<void> {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  /**
   * Stop audio playback
   */
  async stopPlayback(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {
        // Ignore errors
      }
      this.sound = null;
    }
  }

  // ─────────────────────────────────────
  // TTS (Text-to-Speech) Methods
  // ─────────────────────────────────────

  /**
   * Play model pronunciation using TTS (no API required)
   */
  async playModelPronunciation(
    text: string,
    options?: {
      rate?: number; // 0.5 - 2.0, default 0.9
      pitch?: number; // 0.5 - 2.0, default 1.0
      language?: string; // default 'en-US'
    }
  ): Promise<void> {
    try {
      // Stop any ongoing speech
      await this.stopTTS();

      const speechOptions: Speech.SpeechOptions = {
        language: options?.language || 'en-US',
        rate: options?.rate ?? 0.9, // Slightly slower for learning
        pitch: options?.pitch ?? 1.0,
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('TTS playback failed:', error);
      throw error;
    }
  }

  /**
   * Play model pronunciation with slower speed for practice
   */
  async playSlowPronunciation(text: string): Promise<void> {
    return this.playModelPronunciation(text, { rate: 0.6 });
  }

  /**
   * Play model pronunciation at normal speed
   */
  async playNormalPronunciation(text: string): Promise<void> {
    return this.playModelPronunciation(text, { rate: 1.0 });
  }

  /**
   * Stop TTS playback
   */
  async stopTTS(): Promise<void> {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
    } catch (error) {
      console.error('Failed to stop TTS:', error);
    }
  }

  /**
   * Check if TTS is available
   */
  async isTTSAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get available TTS voices for English
   */
  async getEnglishVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.filter(
        (v) => v.language.startsWith('en') && v.quality === Speech.VoiceQuality.Enhanced
      );
    } catch {
      return [];
    }
  }

  // ─────────────────────────────────────
  // Combined Recording + Playback Flow
  // ─────────────────────────────────────

  /**
   * Stop recording and return result for self-check
   * (No API analysis - user compares their recording with TTS)
   */
  async stopAndAnalyze(expectedText: string): Promise<{
    transcribedText: string;
    overallScore: number;
    wordAnalysis: Array<{
      word: string;
      expected: string;
      score: number;
      issue?: 'missing' | 'wrong' | 'extra';
    }>;
    audioUri: string | null;
  }> {
    const audioUri = await this.stopRecording();

    // Return placeholder result for self-check mode
    // User will compare their recording with TTS manually
    const words = expectedText.trim().split(/\s+/);
    const wordAnalysis = words.map((word) => ({
      word,
      expected: word,
      score: 0, // Will be self-evaluated
    }));

    return {
      transcribedText: '', // Not available without API
      overallScore: 0, // Will be self-evaluated
      wordAnalysis,
      audioUri,
    };
  }

  // ─────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────

  /**
   * Start audio level metering for visualization
   */
  private startMetering(): void {
    this.meteringInterval = setInterval(async () => {
      if (this.recording) {
        try {
          const status = await this.recording.getStatusAsync();
          if (status.isRecording) {
            // Convert dB to 0-1 scale
            const metering = status.metering || -160;
            const normalized = Math.max(0, (metering + 60) / 60);

            this.recordingState = {
              ...this.recordingState,
              duration: Math.floor(status.durationMillis / 1000),
              audioLevel: normalized,
            };
            this.notifyStateChange();

            // Auto-stop at max duration
            if (this.recordingState.duration >= this.config.maxRecordingDuration) {
              this.stopRecording();
            }
          }
        } catch {
          // Ignore metering errors
        }
      }
    }, 100);
  }

  /**
   * Stop metering
   */
  private stopMetering(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = undefined;
    }
  }

  /**
   * Notify state change callback
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.recordingState });
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopMetering();
    this.recording = null;
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
    };
    this.notifyStateChange();
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return { ...this.recordingState };
  }
}

// ─────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────

const speechService = new SpeechService();

export default speechService;
export { SpeechService };
