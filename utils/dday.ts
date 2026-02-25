/**
 * D-day utilities
 *
 * All calculations are based on local-date midnight
 * to avoid timezone/hour offset issues.
 */

function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDayDifferenceFromToday(targetDate: string, baseDate: Date = new Date()): number {
  const target = toLocalMidnight(parseDateString(targetDate));
  const base = toLocalMidnight(baseDate);
  const diffMs = target.getTime() - base.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDdayLabel(targetDate: string, baseDate: Date = new Date()): string {
  const diff = getDayDifferenceFromToday(targetDate, baseDate);

  if (diff === 0) return 'D-day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function formatDateDot(targetDate: string): string {
  const [year, month, day] = targetDate.split('-');
  return `${year}.${month}.${day}`;
}
