/**
 * UserStore Tests - Weight Tracker
 */

import { useUserStore } from '@/store/userStore';

describe('userStore weight tracker', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
  });

  it('목표 체중을 설정할 수 있어야 함', () => {
    const store = useUserStore.getState();
    store.setWeightGoalKg(67.26);

    expect(useUserStore.getState().weightGoalKg).toBe(67.3);
  });

  it('범위를 벗어난 목표 체중은 저장하지 않아야 함', () => {
    const store = useUserStore.getState();
    store.setWeightGoalKg(19);

    expect(useUserStore.getState().weightGoalKg).toBeNull();
  });

  it('체중 로그를 추가할 수 있어야 함', () => {
    const store = useUserStore.getState();
    store.upsertWeightLog('2026-02-25', 74.31);

    const logs = useUserStore.getState().weightLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].date).toBe('2026-02-25');
    expect(logs[0].weightKg).toBe(74.3);
  });

  it('같은 날짜 체중 로그는 업데이트되어야 함', () => {
    const store = useUserStore.getState();
    store.upsertWeightLog('2026-02-25', 74.3);
    store.upsertWeightLog('2026-02-25', 73.8);

    const logs = useUserStore.getState().weightLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].weightKg).toBe(73.8);
  });

  it('체중 로그를 삭제할 수 있어야 함', () => {
    const store = useUserStore.getState();
    store.upsertWeightLog('2026-02-25', 74.3);
    store.removeWeightLog('2026-02-25');

    expect(useUserStore.getState().weightLogs).toHaveLength(0);
  });

  it('migrate v1 -> v2에서 weight 필드 기본값을 채워야 함', async () => {
    const migrate = useUserStore.persist.getOptions().migrate;
    expect(migrate).toBeDefined();

    const migrated = await migrate?.(
      {
        name: 'test',
        isOnboarded: true,
      },
      1
    );

    expect((migrated as any).weightGoalKg).toBeNull();
    expect((migrated as any).weightLogs).toEqual([]);
  });
});
