/**
 * TTS (Text-to-Speech) Utility
 * 앱 전체에서 사용하는 TTS 기능 중앙화
 */

import * as Speech from 'expo-speech';

import { CEFRLevel } from '@/types/activity';

// CEFR 레벨별 발화 속도 설정
const SPEED_BY_LEVEL: Record<CEFRLevel, number> = {
  A1: 0.6, // 매우 느림 (초급)
  A2: 0.7,
  B1: 0.8,
  B2: 0.9,
  C1: 1.0,
  C2: 1.0, // 정상 속도 (고급)
};

// TTS 설정 타입
export interface TTSOptions {
  rate?: number; // 발화 속도 (0.1 ~ 2.0)
  pitch?: number; // 음높이 (0.5 ~ 2.0)
  language?: string; // 언어 코드
  onDone?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
}

// 기본 설정
const DEFAULT_OPTIONS: TTSOptions = {
  rate: 0.8,
  pitch: 1.0,
  language: 'en-US',
};

// TTS 상태
let isCurrentlySpeaking = false;
let currentUtteranceId: string | null = null;

/**
 * 텍스트를 음성으로 발화
 */
export async function speak(text: string, options?: TTSOptions): Promise<void> {
  if (!text || text.trim().length === 0) {
    return;
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // 이전 발화 중지
  if (isCurrentlySpeaking) {
    await stop();
  }

  isCurrentlySpeaking = true;
  currentUtteranceId = generateUtteranceId();

  try {
    await Speech.speak(text, {
      language: mergedOptions.language,
      rate: mergedOptions.rate,
      pitch: mergedOptions.pitch,
      onStart: () => {
        isCurrentlySpeaking = true;
        mergedOptions.onStart?.();
      },
      onDone: () => {
        isCurrentlySpeaking = false;
        currentUtteranceId = null;
        mergedOptions.onDone?.();
      },
      onError: (error) => {
        isCurrentlySpeaking = false;
        currentUtteranceId = null;
        mergedOptions.onError?.(error as Error);
      },
    });
  } catch (error) {
    isCurrentlySpeaking = false;
    currentUtteranceId = null;
    mergedOptions.onError?.(error as Error);
    throw error;
  }
}

/**
 * CEFR 레벨에 맞는 속도로 발화
 */
export async function speakWithLevel(
  text: string,
  level: CEFRLevel,
  options?: Omit<TTSOptions, 'rate'>
): Promise<void> {
  const rate = SPEED_BY_LEVEL[level];
  return speak(text, { ...options, rate });
}

/**
 * 단어 발음 (느린 속도로)
 */
export async function speakWord(word: string, options?: Omit<TTSOptions, 'rate'>): Promise<void> {
  return speak(word, { ...options, rate: 0.7 });
}

/**
 * 예문 발화 (약간 느린 속도로)
 */
export async function speakSentence(
  sentence: string,
  options?: Omit<TTSOptions, 'rate'>
): Promise<void> {
  return speak(sentence, { ...options, rate: 0.8 });
}

/**
 * 듣기 연습용 (조절 가능한 속도)
 */
export async function speakListening(
  text: string,
  speed: number = 1.0,
  options?: Omit<TTSOptions, 'rate'>
): Promise<void> {
  return speak(text, { ...options, rate: speed });
}

/**
 * 발화 중지
 */
export async function stop(): Promise<void> {
  if (isCurrentlySpeaking) {
    await Speech.stop();
    isCurrentlySpeaking = false;
    currentUtteranceId = null;
  }
}

/**
 * 현재 발화 중인지 확인
 */
export function isSpeaking(): boolean {
  return isCurrentlySpeaking;
}

/**
 * TTS 사용 가능 여부 확인
 */
export async function isAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.length > 0;
  } catch {
    return false;
  }
}

/**
 * 사용 가능한 음성 목록 가져오기
 */
export async function getVoices(): Promise<Speech.Voice[]> {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch {
    return [];
  }
}

/**
 * 영어 음성 목록 가져오기
 */
export async function getEnglishVoices(): Promise<Speech.Voice[]> {
  const voices = await getVoices();
  return voices.filter((voice) => voice.language.startsWith('en'));
}

/**
 * 토글 (재생/중지)
 */
export async function toggle(text: string, options?: TTSOptions): Promise<boolean> {
  if (isCurrentlySpeaking) {
    await stop();
    return false;
  } else {
    await speak(text, options);
    return true;
  }
}

// 유틸리티 함수
function generateUtteranceId(): string {
  return `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Hook 형태로 사용할 수 있도록 상태 반환 함수
export function getTTSState() {
  return {
    isSpeaking: isCurrentlySpeaking,
    currentUtteranceId,
  };
}

// TTS 서비스 객체 (하위 호환성)
export const tts = {
  speak,
  speakWithLevel,
  speakWord,
  speakSentence,
  speakListening,
  stop,
  toggle,
  isSpeaking,
  isAvailable,
  getVoices,
  getEnglishVoices,
  getState: getTTSState,
  SPEED_BY_LEVEL,
};

export default tts;
