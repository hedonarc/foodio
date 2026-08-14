import type { OpeningHours } from '@/utils/openingHours';

export type Window = { opensAt: string; closesAt: string };
/** Keyed by `Date#getDay()`, so 0 is Sunday — the same as the contract. */
export type Week = Record<number, Window[]>;

/** Monday first: a Mon–Fri block should read as one run, not wrap around Sunday. */
export const DAYS = [1, 2, 3, 4, 5, 6, 0] as const;

/**
 * The server allows three windows a day. Two is what t7 chose: lunch and
 * dinner is the real case, and the third is unexplained capacity.
 */
export const MAX_SHIFTS = 2;

/** Half-hour granularity — 48 choices is a scrollable list, 96 is a chore. */
export const TIMES: readonly string[] = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  return `${String(hour).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`;
});

export const ALL_DAY: Window = { opensAt: '11:00', closesAt: '23:00' };
const LUNCH: Window = { opensAt: '12:00', closesAt: '15:00' };
const DINNER: Window = { opensAt: '19:00', closesAt: '23:30' };

export const emptyWeek = (): Week => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

/** A window closing no later than it opens runs past midnight. */
export const isOvernight = (window: Window): boolean => window.closesAt <= window.opensAt;

export function fromOpeningHours(hours: readonly OpeningHours[]): Week {
  const week = emptyWeek();

  for (const period of hours) {
    const day = week[period.dayOfWeek];
    if (day) day.push({ opensAt: period.opensAt, closesAt: period.closesAt });
  }

  // `HH:mm` sorts correctly as text, and an overnight window opens last anyway.
  for (const day of DAYS) week[day]?.sort((a, b) => a.opensAt.localeCompare(b.opensAt));

  return week;
}

export const toOpeningHours = (week: Week): OpeningHours[] =>
  DAYS.flatMap((day) => (week[day] ?? []).map((window) => ({ dayOfWeek: day, ...window })));

/**
 * Which times a control may offer, penned in by the windows either side.
 *
 * Every bound is read off a value the week already satisfies, so the list always
 * contains what the control is showing and can never dead-end. A shift with
 * another after it also cannot run past midnight — only a day's last window
 * closes unbounded, which is the only place overnight means anything.
 *
 * Constrained rather than clamped on purpose: expanding one shift must never
 * silently drag another, because in a per-day editor the moved row may be off
 * screen.
 */
export function optionsFor(
  shifts: readonly Window[],
  index: number,
  field: 'opensAt' | 'closesAt',
): readonly string[] {
  const shift = shifts[index];
  if (!shift) return TIMES;

  const previous = shifts[index - 1];
  const next = shifts[index + 1];

  const after = field === 'opensAt' ? previous?.closesAt : next && shift.opensAt;
  const before = field === 'opensAt' ? next && shift.closesAt : next?.opensAt;

  return TIMES.filter(
    (time) => (after === undefined || time > after) && (before === undefined || time < before),
  );
}

/**
 * The grid is half-hourly, but stored data need not be — a restaurant already
 * closing at 23:59 is real, and a picker that could not show its own current
 * value would look broken. Keeps the list sorted so every comparison above
 * still holds.
 */
export function withCurrent(options: readonly string[], value: string): readonly string[] {
  if (value === '' || options.includes(value)) return options;
  return [...options, value].sort();
}

/**
 * Adding a second shift means a break in the middle of the day, so the first
 * gives way — appending dinner to an all-day window would only overlap it. A
 * first shift already starting in the evening leaves nothing to clip, so the
 * day becomes a plain lunch-and-dinner pair instead.
 */
export function withExtraShift(shifts: readonly Window[]): Window[] {
  if (shifts.length >= MAX_SHIFTS) return [...shifts];

  const first = shifts[0];
  const room = first !== undefined && first.opensAt < LUNCH.closesAt;

  return [room ? { ...first, closesAt: LUNCH.closesAt } : { ...LUNCH }, { ...DINNER }];
}

/**
 * Mirrors the server's `assertOpeningHours`.
 *
 * Kept even though the controls above make an overlap unreachable: the point of
 * the mirror is to catch what the affordances miss, and deleting it because the
 * UI got tighter is how the next gap goes unnoticed.
 */
export function problemsWith(week: Week, dayName: (day: number) => string): string[] {
  const problems: string[] = [];

  for (const day of DAYS) {
    const windows = week[day] ?? [];

    for (const window of windows) {
      if (window.opensAt === window.closesAt) {
        problems.push(`${dayName(day)}: a window cannot open and close at the same time.`);
      }
    }

    const sorted = [...windows].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      if (previous && current && !isOvernight(previous) && current.opensAt < previous.closesAt) {
        problems.push(`${dayName(day)}: two windows overlap. Merge them into one.`);
      }
    }
  }

  return problems;
}
