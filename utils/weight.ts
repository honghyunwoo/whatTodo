export interface WeightLogLike {
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export function normalizeWeightValue(weightKg: number): number | null {
  if (!Number.isFinite(weightKg)) return null;
  if (weightKg < 20 || weightKg > 300) return null;
  return Math.round(weightKg * 10) / 10;
}

export function parseWeightInput(value: string): number | null {
  const normalizedValue = value.replace(',', '.').trim();
  if (!normalizedValue) return null;

  const parsed = Number(normalizedValue);
  return normalizeWeightValue(parsed);
}

export function formatWeightDelta(delta: number | null): string {
  if (delta === null) return '-';
  if (delta === 0) return '0.0kg';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}kg`;
}

export function sortWeightLogs<T extends WeightLogLike>(logs: T[]): T[] {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeightLogByDate<T extends WeightLogLike>(
  logs: T[],
  date: string
): T | undefined {
  return logs.find((log) => log.date === date);
}

export function getPreviousWeightLog<T extends WeightLogLike>(
  logs: T[],
  date: string
): T | undefined {
  const sorted = sortWeightLogs(logs);
  const before = sorted.filter((log) => log.date < date);
  return before.length > 0 ? before[before.length - 1] : undefined;
}

export function calculateWeightDelta(
  currentWeightKg: number | null | undefined,
  baselineWeightKg: number | null | undefined
): number | null {
  if (currentWeightKg == null || baselineWeightKg == null) return null;
  return Math.round((currentWeightKg - baselineWeightKg) * 10) / 10;
}

export function getRecentWeightLogs<T extends WeightLogLike>(logs: T[], count: number = 7): T[] {
  return sortWeightLogs(logs).slice(-count);
}

export function calculateRecentWeightDelta<T extends WeightLogLike>(
  logs: T[],
  count: number = 7
): number | null {
  const recent = getRecentWeightLogs(logs, count);
  if (recent.length < 2) return null;

  const first = recent[0];
  const latest = recent[recent.length - 1];
  return calculateWeightDelta(latest.weightKg, first.weightKg);
}
