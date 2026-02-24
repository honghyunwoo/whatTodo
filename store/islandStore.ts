import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';

export type IslandFocusType = 'plan' | 'reflect' | 'learn';
export type IslandResourceType = 'seed' | 'water' | 'sunlight' | 'coin';
export type IslandBuildingType = 'greenhouse' | 'well' | 'library';

type IslandResources = Record<IslandResourceType, number>;
type IslandBuildings = Record<IslandBuildingType, number>;

export interface SettlementResult {
  elapsedSeconds: number;
  effectiveSeconds: number;
  focusType: IslandFocusType | null;
  returnBonusWater: number;
  gains: IslandResources;
}

interface IslandState {
  schemaVersion: number;
  lastClaimAt: string;
  resources: IslandResources;
  buildings: IslandBuildings;
  focus: {
    date: string;
    type: IslandFocusType | null;
  };
  metrics: {
    settlementCompletedAt?: string;
    next1StartedAt?: string;
  };
}

interface IslandActions {
  getSettlementPreview: () => SettlementResult;
  claimSettlement: () => SettlementResult;
  chooseDailyFocus: (type: IslandFocusType) => boolean;
  getUpgradeCost: (building: IslandBuildingType) => number;
  upgradeBuilding: (building: IslandBuildingType) => boolean;
  markNext1Started: () => void;
}

const ONE_HOUR_SECONDS = 3600;
const ONE_DAY_SECONDS = 24 * ONE_HOUR_SECONDS;

const INITIAL_RESOURCES: IslandResources = {
  seed: 24,
  water: 24,
  sunlight: 24,
  coin: 80,
};

const INITIAL_BUILDINGS: IslandBuildings = {
  greenhouse: 1,
  well: 1,
  library: 1,
};

const defaultState: IslandState = {
  schemaVersion: 1,
  lastClaimAt: new Date().toISOString(),
  resources: INITIAL_RESOURCES,
  buildings: INITIAL_BUILDINGS,
  focus: {
    date: '',
    type: null,
  },
  metrics: {},
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getFocusMultiplier = (
  focusType: IslandFocusType | null,
  resource: Exclude<IslandResourceType, 'coin'>
) => {
  if (!focusType) return 1;
  if (focusType === 'plan' && resource === 'seed') return 1.2;
  if (focusType === 'reflect' && resource === 'water') return 1.2;
  if (focusType === 'learn' && resource === 'sunlight') return 1.2;
  return 1;
};

const getEffectiveSecondsWithSoftCap = (elapsedSeconds: number) => {
  const segments = [
    { durationSeconds: 12 * ONE_HOUR_SECONDS, multiplier: 1 },
    { durationSeconds: 36 * ONE_HOUR_SECONDS, multiplier: 0.6 },
    { durationSeconds: 72 * ONE_HOUR_SECONDS, multiplier: 0.25 },
  ];

  let remaining = Math.max(0, elapsedSeconds);
  let total = 0;

  for (const segment of segments) {
    if (remaining <= 0) break;
    const applied = Math.min(segment.durationSeconds, remaining);
    total += applied * segment.multiplier;
    remaining -= applied;
  }

  return total;
};

const computeProductionRates = (buildings: IslandBuildings) => ({
  coin: 12 + buildings.greenhouse * 2 + buildings.well * 2 + buildings.library * 2,
  seed: 2 + buildings.greenhouse * 1.2,
  water: 2 + buildings.well * 1.2,
  sunlight: 2 + buildings.library * 1.2,
});

const buildSettlementResult = (state: IslandState, nowMs: number): SettlementResult => {
  const nowIso = new Date(nowMs).toISOString();
  const lastClaimMs = Date.parse(state.lastClaimAt);
  const elapsedSeconds = Number.isFinite(lastClaimMs)
    ? Math.max(0, Math.floor((nowMs - lastClaimMs) / 1000))
    : 0;
  const effectiveSeconds = getEffectiveSecondsWithSoftCap(elapsedSeconds);
  const today = nowIso.slice(0, 10);
  const focusType = state.focus.date === today ? state.focus.type : null;
  const rates = computeProductionRates(state.buildings);

  const gains: IslandResources = {
    coin: Math.floor((rates.coin * effectiveSeconds) / ONE_HOUR_SECONDS),
    seed: Math.floor(
      ((rates.seed * effectiveSeconds) / ONE_HOUR_SECONDS) * getFocusMultiplier(focusType, 'seed')
    ),
    water: Math.floor(
      ((rates.water * effectiveSeconds) / ONE_HOUR_SECONDS) * getFocusMultiplier(focusType, 'water')
    ),
    sunlight: Math.floor(
      ((rates.sunlight * effectiveSeconds) / ONE_HOUR_SECONDS) *
        getFocusMultiplier(focusType, 'sunlight')
    ),
  };

  const returnBonusWater =
    elapsedSeconds > 5 * ONE_DAY_SECONDS
      ? Math.min(36, 12 + Math.floor((elapsedSeconds - 5 * ONE_DAY_SECONDS) / ONE_DAY_SECONDS) * 2)
      : 0;
  gains.water += returnBonusWater;

  return {
    elapsedSeconds,
    effectiveSeconds,
    focusType,
    returnBonusWater,
    gains,
  };
};

const getUpgradeCostFromLevel = (level: number) => 40 * (level + 1) * (level + 1);

export const useIslandStore = create<IslandState & IslandActions>()(
  persist(
    (set, get) => ({
      ...defaultState,
      getSettlementPreview: () => buildSettlementResult(get(), Date.now()),
      claimSettlement: () => {
        const now = Date.now();
        const preview = buildSettlementResult(get(), now);
        const nowIso = new Date(now).toISOString();

        set((state) => ({
          lastClaimAt: nowIso,
          resources: {
            coin: state.resources.coin + preview.gains.coin,
            seed: state.resources.seed + preview.gains.seed,
            water: state.resources.water + preview.gains.water,
            sunlight: state.resources.sunlight + preview.gains.sunlight,
          },
          metrics: {
            ...state.metrics,
            settlementCompletedAt: nowIso,
          },
        }));

        return preview;
      },
      chooseDailyFocus: (type) => {
        const today = getTodayKey();
        const current = get().focus;

        if (current.date === today && current.type) {
          return false;
        }

        set({
          focus: {
            date: today,
            type,
          },
        });

        return true;
      },
      getUpgradeCost: (building) => {
        const level = get().buildings[building];
        return getUpgradeCostFromLevel(level);
      },
      upgradeBuilding: (building) => {
        const level = get().buildings[building];
        const cost = getUpgradeCostFromLevel(level);

        if (get().resources.coin < cost) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,
            coin: state.resources.coin - cost,
          },
          buildings: {
            ...state.buildings,
            [building]: state.buildings[building] + 1,
          },
        }));

        return true;
      },
      markNext1Started: () => {
        set((state) => ({
          metrics: {
            ...state.metrics,
            next1StartedAt: new Date().toISOString(),
          },
        }));
      },
    }),
    {
      name: STORAGE_KEYS.ISLAND,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[IslandStore] rehydration failed:', error);
        } else if (__DEV__) {
          // Debug: rehydration complete
        }
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<IslandState>) ?? {};
        return {
          ...currentState,
          ...persisted,
          resources: { ...currentState.resources, ...(persisted.resources ?? {}) },
          buildings: { ...currentState.buildings, ...(persisted.buildings ?? {}) },
          focus: { ...currentState.focus, ...(persisted.focus ?? {}) },
          metrics: { ...currentState.metrics, ...(persisted.metrics ?? {}) },
        };
      },
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        lastClaimAt: state.lastClaimAt,
        resources: state.resources,
        buildings: state.buildings,
        focus: state.focus,
        metrics: state.metrics,
      }),
    }
  )
);
