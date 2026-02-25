import { formatDateDot, getDayDifferenceFromToday, getDdayLabel } from '@/utils/dday';

describe('D-day utilities', () => {
  it('returns D-day when target is today', () => {
    const base = new Date(2026, 1, 25, 10, 30);
    expect(getDdayLabel('2026-02-25', base)).toBe('D-day');
  });

  it('returns D-N for future dates', () => {
    const base = new Date(2026, 1, 25, 23, 59);
    expect(getDdayLabel('2026-03-01', base)).toBe('D-4');
  });

  it('returns D+N for past dates', () => {
    const base = new Date(2026, 1, 25, 0, 1);
    expect(getDdayLabel('2026-02-20', base)).toBe('D+5');
  });

  it('normalizes to local midnight', () => {
    const base = new Date(2026, 1, 25, 23, 50);
    expect(getDayDifferenceFromToday('2026-02-26', base)).toBe(1);
  });

  it('formats date as YYYY.MM.DD', () => {
    expect(formatDateDot('2026-12-09')).toBe('2026.12.09');
  });
});
