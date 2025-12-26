/**
 * Onboarding Utilities
 * 온보딩 플로우 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';

/**
 * 온보딩 완료 여부 확인
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch (error) {
    console.error('온보딩 상태 확인 실패:', error);
    return false;
  }
}

/**
 * 온보딩 완료 표시
 */
export async function markOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('온보딩 완료 표시 실패:', error);
  }
}

/**
 * 온보딩 재설정 (테스트/개발용)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  } catch (error) {
    console.error('온보딩 재설정 실패:', error);
  }
}
