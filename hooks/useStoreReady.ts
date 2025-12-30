/**
 * useStoreReady Hook
 *
 * Zustand store rehydration 완료를 감지하고
 * 모든 store가 준비될 때까지 대기하는 hook
 *
 * 해결 문제:
 * - Rehydration 전 컴포넌트 렌더링 → UI 깜빡임
 * - Cross-store race condition
 *
 * 방식: onFinishHydration 콜백 사용 (rehydrate() 대신)
 * - Zustand persist는 자동으로 hydration 시작
 * - 수동 rehydrate() 호출은 충돌 발생 가능
 */

import { useEffect, useState } from 'react';

// Store imports
import { useUserStore } from '@/store/userStore';
import { useStreakStore } from '@/store/streakStore';
import { useRewardStore } from '@/store/rewardStore';
import { useLearnStore } from '@/store/learnStore';
import { useLessonStore } from '@/store/lessonStore';
import { useTaskStore } from '@/store/taskStore';
import { useDiaryStore } from '@/store/diaryStore';
import { useJournalStore } from '@/store/journalStore';
import { useSrsStore } from '@/store/srsStore';
import { useTestStore } from '@/store/testStore';
import { useGameStore } from '@/store/gameStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSessionStore } from '@/store/sessionStore';
import { useSkillStore } from '@/store/skillStore';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface StoreReadyState {
  isReady: boolean;
  progress: number; // 0-100
  phase: 'loading' | 'complete';
  error: Error | null;
}

type StoreWithPersist = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

// ─────────────────────────────────────
// Store List
// ─────────────────────────────────────

const ALL_STORES: { name: string; store: StoreWithPersist }[] = [
  { name: 'user', store: useUserStore as unknown as StoreWithPersist },
  { name: 'streak', store: useStreakStore as unknown as StoreWithPersist },
  { name: 'reward', store: useRewardStore as unknown as StoreWithPersist },
  { name: 'learn', store: useLearnStore as unknown as StoreWithPersist },
  { name: 'lesson', store: useLessonStore as unknown as StoreWithPersist },
  { name: 'task', store: useTaskStore as unknown as StoreWithPersist },
  { name: 'diary', store: useDiaryStore as unknown as StoreWithPersist },
  { name: 'journal', store: useJournalStore as unknown as StoreWithPersist },
  { name: 'srs', store: useSrsStore as unknown as StoreWithPersist },
  { name: 'test', store: useTestStore as unknown as StoreWithPersist },
  { name: 'game', store: useGameStore as unknown as StoreWithPersist },
  { name: 'scenario', store: useScenarioStore as unknown as StoreWithPersist },
  { name: 'session', store: useSessionStore as unknown as StoreWithPersist },
  { name: 'skill', store: useSkillStore as unknown as StoreWithPersist },
];

const TOTAL_STORES = ALL_STORES.length;

// 타임아웃 설정 (ms) - hydration이 오래 걸릴 경우 강제 완료
const HYDRATION_TIMEOUT = 5000;

// Hydrated stores tracking (module level for cross-store checks)
const hydratedStores = new Set<string>();

// ─────────────────────────────────────
// Main Hook
// ─────────────────────────────────────

export function useStoreReady(): StoreReadyState {
  // 🔧 디버깅 완료: 정상 hydration 모드로 복원
  const [debugSkipHydration] = useState(false); // false = 정상 모드

  const [state, setState] = useState<StoreReadyState>(() => {
    // 디버깅 모드: 즉시 ready 반환
    if (debugSkipHydration) {
      console.log('[StoreReady] DEBUG MODE: Skipping hydration check');
      return {
        isReady: true,
        progress: 100,
        phase: 'complete',
        error: null,
      };
    }

    // 초기 상태: 이미 모두 hydrated 되었는지 확인
    const alreadyHydrated = ALL_STORES.every(({ name, store }) => {
      try {
        const hydrated = store.persist?.hasHydrated?.() ?? false;
        if (hydrated) {
          hydratedStores.add(name);
        }
        return hydrated;
      } catch {
        return false;
      }
    });

    if (alreadyHydrated) {
      return {
        isReady: true,
        progress: 100,
        phase: 'complete',
        error: null,
      };
    }

    return {
      isReady: false,
      progress: 0,
      phase: 'loading',
      error: null,
    };
  });

  useEffect(() => {
    // 이미 완료되었으면 스킵
    if (state.isReady) return;

    const unsubscribes: (() => void)[] = [];
    let completedCount = hydratedStores.size; // 이미 hydrated된 store 수
    let isTimedOut = false;

    // 타임아웃: 5초 후에도 완료되지 않으면 강제 완료
    const timeoutId = setTimeout(() => {
      if (!state.isReady && !isTimedOut) {
        isTimedOut = true;
        const pendingStores = ALL_STORES.filter((s) => !hydratedStores.has(s.name));

        console.warn(
          '[StoreReady] Timeout after ' + HYDRATION_TIMEOUT + 'ms! Pending stores:',
          pendingStores.map((s) => s.name)
        );

        // 강제로 완료 처리
        setState({
          isReady: true,
          progress: 100,
          phase: 'complete',
          error: new Error('Hydration timeout - some stores may be unavailable'),
        });
      }
    }, HYDRATION_TIMEOUT);

    // 초기 progress 업데이트
    if (completedCount > 0) {
      setState((prev) => ({
        ...prev,
        progress: Math.round((completedCount / TOTAL_STORES) * 100),
      }));
    }

    const checkComplete = () => {
      if (isTimedOut) return; // 이미 타임아웃되었으면 무시
      if (completedCount >= TOTAL_STORES) {
        setState({
          isReady: true,
          progress: 100,
          phase: 'complete',
          error: null,
        });

        if (__DEV__) {
          console.log('[StoreReady] All stores hydrated');
        }
      }
    };

    ALL_STORES.forEach(({ name, store }) => {
      // 이미 hydrated 된 store는 스킵
      if (hydratedStores.has(name)) {
        return;
      }

      try {
        // 현재 상태 다시 확인
        if (store.persist?.hasHydrated?.()) {
          completedCount++;
          hydratedStores.add(name);

          if (__DEV__) {
            console.log('[StoreReady] ' + name + ' already hydrated');
          }

          setState((prev) => ({
            ...prev,
            progress: Math.round((completedCount / TOTAL_STORES) * 100),
          }));

          checkComplete();
          return;
        }

        // hydration 완료 리스너 등록
        const unsub = store.persist.onFinishHydration(() => {
          completedCount++;
          hydratedStores.add(name);

          if (__DEV__) {
            console.log('[StoreReady] ' + name + ' hydrated');
          }

          setState((prev) => ({
            ...prev,
            progress: Math.round((completedCount / TOTAL_STORES) * 100),
          }));

          checkComplete();
        });

        unsubscribes.push(unsub);
      } catch (error) {
        console.error('[StoreReady] Error setting up ' + name + ':', error);
        // 에러가 나도 완료로 처리 (앱 실행은 계속)
        completedCount++;
        hydratedStores.add(name);
        setState((prev) => ({
          ...prev,
          progress: Math.round((completedCount / TOTAL_STORES) * 100),
        }));
        checkComplete();
      }
    });

    // 초기 체크 (모든 스토어가 이미 hydrated일 수 있음)
    checkComplete();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      unsubscribes.forEach((unsub) => unsub?.());
    };
  }, [state.isReady]);

  return state;
}

// ─────────────────────────────────────
// Utility: Check if specific store is ready
// ─────────────────────────────────────

export function isStoreHydrated(
  storeName:
    | 'user'
    | 'streak'
    | 'reward'
    | 'learn'
    | 'lesson'
    | 'task'
    | 'diary'
    | 'journal'
    | 'srs'
    | 'test'
    | 'game'
    | 'scenario'
    | 'session'
    | 'skill'
): boolean {
  // 먼저 캐시된 상태 확인 (빠름)
  if (hydratedStores.has(storeName)) {
    return true;
  }

  // 실제 store 상태 확인
  const storeEntry = ALL_STORES.find((s) => s.name === storeName);
  if (!storeEntry) return false;

  try {
    const isHydrated = storeEntry.store.persist?.hasHydrated?.() ?? false;
    if (isHydrated) {
      hydratedStores.add(storeName);
    }
    return isHydrated;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────
// Utility: Safe cross-store call
// ─────────────────────────────────────

export function safeStoreCall<T>(
  storeName: Parameters<typeof isStoreHydrated>[0],
  callback: () => T,
  fallback: T
): T {
  if (isStoreHydrated(storeName)) {
    return callback();
  }

  if (__DEV__) {
    console.warn('[StoreReady] ' + storeName + ' not hydrated, using fallback');
  }

  return fallback;
}

export default useStoreReady;
