/**
 * PROTOTYPE — throwaway. Answers Wayfinder ticket t7, the opening-hours editor.
 *
 * `PUT /restaurants/:id/opening-hours` replaces the whole week at once, so
 * there is no per-day save and the editor holds the week in memory until the
 * owner commits it. The backend allows up to 21 windows (three a day) and
 * rejects only overlaps and zero-length windows — so **split shifts are legal**
 * and the editor has to be able to make them.
 */
import type { OpeningHours } from '@/utils/openingHours';

export type Window = { opensAt: string; closesAt: string };
export type Week = Record<number, Window[]>;

export const DAYS = [1, 2, 3, 4, 5, 6, 0] as const;
export const MAX_PER_DAY = 3;

export const emptyWeek = (): Week => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

export const typicalWeek = (): Week => {
  const week = emptyWeek();
  for (const day of DAYS) week[day] = [{ opensAt: '11:00', closesAt: '23:00' }];
  return week;
};

/** Lunch, shut through the afternoon, then dinner. Normal in Lahore. */
export const splitWeek = (): Week => {
  const week = emptyWeek();
  for (const day of DAYS) {
    week[day] = [
      { opensAt: '12:00', closesAt: '15:00' },
      { opensAt: '19:00', closesAt: '23:30' },
    ];
  }
  return week;
};

export const toOpeningHours = (week: Week): OpeningHours[] =>
  DAYS.flatMap((day) => (week[day] ?? []).map((w) => ({ dayOfWeek: day, ...w })));

export const isOvernight = (w: Window): boolean => w.closesAt < w.opensAt;

/** Mirrors the server's `assertOpeningHours`, so the editor can warn before saving. */
export function problemsWith(week: Week): string[] {
  const problems: string[] = [];

  for (const day of DAYS) {
    const windows = week[day] ?? [];

    for (const w of windows) {
      if (w.opensAt === w.closesAt) {
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

const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const dayName = (day: number): string => NAMES[day] ?? '';
export const shortDay = (day: number): string => (NAMES[day] ?? '').slice(0, 3);

export const countWindows = (week: Week): number =>
  DAYS.reduce<number>((total, day) => total + (week[day]?.length ?? 0), 0);
