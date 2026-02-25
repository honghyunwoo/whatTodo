import {
  calculateRecentWeightDelta,
  calculateWeightDelta,
  formatWeightDelta,
  getPreviousWeightLog,
  getRecentWeightLogs,
  getWeightLogByDate,
  normalizeWeightValue,
  parseWeightInput,
  sortWeightLogs,
} from '@/utils/weight';

const sampleLogs = [
  { date: '2026-02-20', weightKg: 73.4 },
  { date: '2026-02-22', weightKg: 72.9 },
  { date: '2026-02-25', weightKg: 72.2 },
];

describe('weight utils', () => {
  it('normalizeWeightValue는 20~300kg 범위를 검증한다', () => {
    expect(normalizeWeightValue(72.26)).toBe(72.3);
    expect(normalizeWeightValue(19.9)).toBeNull();
    expect(normalizeWeightValue(301)).toBeNull();
  });

  it('parseWeightInput은 콤마 입력을 허용한다', () => {
    expect(parseWeightInput('72,4')).toBe(72.4);
    expect(parseWeightInput('abc')).toBeNull();
  });

  it('formatWeightDelta는 부호와 단위를 붙인다', () => {
    expect(formatWeightDelta(1.2)).toBe('+1.2kg');
    expect(formatWeightDelta(-0.8)).toBe('-0.8kg');
    expect(formatWeightDelta(0)).toBe('0.0kg');
    expect(formatWeightDelta(null)).toBe('-');
  });

  it('sortWeightLogs는 날짜 오름차순으로 정렬한다', () => {
    const sorted = sortWeightLogs([sampleLogs[2], sampleLogs[0], sampleLogs[1]]);
    expect(sorted.map((v) => v.date)).toEqual(['2026-02-20', '2026-02-22', '2026-02-25']);
  });

  it('특정 날짜/이전 날짜 로그를 찾는다', () => {
    expect(getWeightLogByDate(sampleLogs, '2026-02-22')?.weightKg).toBe(72.9);
    expect(getPreviousWeightLog(sampleLogs, '2026-02-25')?.weightKg).toBe(72.9);
    expect(getPreviousWeightLog(sampleLogs, '2026-02-20')).toBeUndefined();
  });

  it('delta 계산이 소수점 1자리로 동작한다', () => {
    expect(calculateWeightDelta(72.2, 73.4)).toBe(-1.2);
    expect(calculateWeightDelta(null, 73.4)).toBeNull();
  });

  it('최근 N개 로그와 변화량 계산이 동작한다', () => {
    expect(getRecentWeightLogs(sampleLogs, 2).map((v) => v.date)).toEqual([
      '2026-02-22',
      '2026-02-25',
    ]);
    expect(calculateRecentWeightDelta(sampleLogs, 3)).toBe(-1.2);
    expect(calculateRecentWeightDelta(sampleLogs.slice(0, 1), 7)).toBeNull();
  });
});
