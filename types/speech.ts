/**
 * Speech Service Types
 * Types for pronunciation checking and audio recording
 */

// Pronunciation analysis result
export interface PronunciationResult {
  overallScore: number; // 0-100
  transcribedText: string; // Text recognized from audio
  wordAnalysis: WordAnalysis[];
  suggestions: string[];
  duration: number; // Recording duration in seconds
}

// Individual word analysis
export interface WordAnalysis {
  word: string; // The word analyzed
  expected: string; // Expected pronunciation
  score: number; // 0-100 accuracy score
  issue?: 'missing' | 'wrong' | 'extra'; // Type of issue if any
  phonemeDetails?: PhonemeDetail[]; // Detailed phoneme analysis
}

// Phoneme-level detail (for advanced feedback)
export interface PhonemeDetail {
  phoneme: string;
  expected: string;
  score: number;
  position: 'start' | 'middle' | 'end';
}

// Recording state
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // Current duration in seconds
  audioLevel: number; // 0-1 audio level for visualization
}

// Speech practice item
export interface SpeechPracticeItem {
  id: string;
  text: string; // Text to pronounce
  translation: string; // Korean translation
  audioUrl?: string; // Reference audio URL (TTS)
  tips?: PronunciationTip[];
}

// Pronunciation tip
export interface PronunciationTip {
  word: string;
  tip: string;
  stress?: string; // Stress pattern
  linking?: string; // Linking with adjacent words
  intonation?: 'rising' | 'falling' | 'flat';
}

// Speech service configuration
export interface SpeechServiceConfig {
  maxRecordingDuration: number; // Max duration in seconds
  sampleRate: number;
  channels: number;
  bitRate: number;
  language: string; // 'en' for English
}

// API Response types
export interface WhisperTranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: WhisperSegment[];
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence?: number;
}
