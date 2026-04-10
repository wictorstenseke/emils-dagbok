import { describe, it, expect, vi, afterEach } from 'vitest';
import { today, toKey, addDays, formatDisplay, mondayOf, weekDays, shortDay, dayNumber, getSeason } from './date';

describe('toKey', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toKey(new Date(2026, 11, 25))).toBe('2026-12-25');
  });

  it('pads single-digit month and day', () => {
    expect(toKey(new Date(2026, 2, 3))).toBe('2026-03-03');
  });
});

describe('today', () => {
  afterEach(() => vi.useRealTimers());

  it('returns current date as YYYY-MM-DD', () => {
    vi.useFakeTimers({ now: new Date(2026, 3, 10) });
    expect(today()).toBe('2026-04-10');
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2026-04-10', 3)).toBe('2026-04-13');
  });

  it('subtracts days', () => {
    expect(addDays('2026-04-10', -5)).toBe('2026-04-05');
  });

  it('crosses month boundary', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });

  it('crosses year boundary', () => {
    expect(addDays('2025-12-30', 5)).toBe('2026-01-04');
  });
});

describe('mondayOf', () => {
  it('returns the Monday of the same week', () => {
    // 2026-04-10 is a Friday
    expect(mondayOf('2026-04-10')).toBe('2026-04-06');
  });

  it('returns the same date if already Monday', () => {
    expect(mondayOf('2026-04-06')).toBe('2026-04-06');
  });

  it('handles Sunday (goes back to previous Monday)', () => {
    // 2026-04-12 is a Sunday
    expect(mondayOf('2026-04-12')).toBe('2026-04-06');
  });
});

describe('weekDays', () => {
  it('returns 7 consecutive days starting from Monday', () => {
    const days = weekDays('2026-04-06');
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-04-06'); // Monday
    expect(days[6]).toBe('2026-04-12'); // Sunday
  });
});

describe('shortDay', () => {
  it('returns a Swedish short day name', () => {
    const result = shortDay('2026-04-06'); // Monday
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('dayNumber', () => {
  it('extracts the day-of-month', () => {
    expect(dayNumber('2026-04-10')).toBe(10);
    expect(dayNumber('2026-01-01')).toBe(1);
  });
});

describe('formatDisplay', () => {
  it('returns a Swedish locale formatted date string', () => {
    const result = formatDisplay('2026-04-10');
    // Should contain day number and month name in Swedish
    expect(result).toContain('10');
    expect(result).toContain('april');
  });
});

describe('getSeason', () => {
  it('returns Vår for spring months (3-5)', () => {
    expect(getSeason('2026-03-15').name).toBe('Vår');
    expect(getSeason('2026-04-10').name).toBe('Vår');
    expect(getSeason('2026-05-20').name).toBe('Vår');
  });

  it('returns Sommar for summer months (6-8)', () => {
    expect(getSeason('2026-06-01').name).toBe('Sommar');
    expect(getSeason('2026-08-31').name).toBe('Sommar');
  });

  it('returns Höst for autumn months (9-11)', () => {
    expect(getSeason('2026-09-01').name).toBe('Höst');
    expect(getSeason('2026-11-30').name).toBe('Höst');
  });

  it('returns Vinter for winter months (12, 1, 2)', () => {
    expect(getSeason('2026-12-01').name).toBe('Vinter');
    expect(getSeason('2026-01-15').name).toBe('Vinter');
    expect(getSeason('2026-02-28').name).toBe('Vinter');
  });

  it('includes an emoji', () => {
    expect(getSeason('2026-04-10').emoji).toBeTruthy();
  });
});
