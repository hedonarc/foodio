/** One contiguous open period on one day. `0` is Sunday, matching Date#getDay(). */
export type OpeningHours = {
  dayOfWeek: number;
  /** 24-hour `HH:mm`. */
  opensAt: string;
  closesAt: string;
};

/** Consecutive days that share the same hours, collapsed back into one row. */
export type OpeningHoursGroup = {
  days: number[];
  opensAt: string;
  closesAt: string;
};

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Whether the restaurant is open at `at`, in the device's timezone.
 *
 * A period whose closing time is not after its opening time runs past
 * midnight, so it also covers the small hours of the following day.
 */
export function isOpenAt(hours: readonly OpeningHours[], at: Date): boolean {
  const day = at.getDay();
  const nowMinutes = at.getHours() * 60 + at.getMinutes();

  return hours.some((period) => {
    const opens = toMinutes(period.opensAt);
    const closes = toMinutes(period.closesAt);

    if (closes > opens) {
      return period.dayOfWeek === day && nowMinutes >= opens && nowMinutes < closes;
    }

    // Overnight: open late on its own day, still open early the next day.
    const startedToday = period.dayOfWeek === day && nowMinutes >= opens;
    const startedYesterday =
      period.dayOfWeek === (day + 6) % 7 && nowMinutes < closes % MINUTES_PER_DAY;

    return startedToday || startedYesterday;
  });
}

/**
 * Collapse per-day hours into display rows, so seven identical entries read as
 * a single "Mon – Sun" line rather than seven repeated ones.
 *
 * Grouping starts at Monday: a week that reads Mon…Sun matches how opening
 * hours are written down, whereas Date#getDay()'s Sunday-first order would
 * split a Mon–Fri block across the two ends of the list.
 */
export function groupOpeningHours(hours: readonly OpeningHours[]): OpeningHoursGroup[] {
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const byDay = new Map(hours.map((period) => [period.dayOfWeek, period]));

  const groups: OpeningHoursGroup[] = [];

  for (const day of weekOrder) {
    const period = byDay.get(day);
    if (!period) continue;

    const previous = groups[groups.length - 1];
    const isContiguous =
      previous !== undefined &&
      previous.opensAt === period.opensAt &&
      previous.closesAt === period.closesAt &&
      previous.days[previous.days.length - 1] === weekOrder[weekOrder.indexOf(day) - 1];

    if (isContiguous) {
      previous.days.push(day);
      continue;
    }

    groups.push({ days: [day], opensAt: period.opensAt, closesAt: period.closesAt });
  }

  return groups;
}

/** 7 Jan 2024 was a Sunday, so day 0 lands on it and the rest follow. */
const WEEKDAY_REFERENCE_DATE = Date.UTC(2024, 0, 7);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatWeekday(dayOfWeek: number, locale?: string): string {
  const date = new Date(WEEKDAY_REFERENCE_DATE + dayOfWeek * MS_PER_DAY);
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(date);
}

/** `'22:30'` rendered as the locale writes it — 12-hour in en-US, 24-hour in de-DE. */
export function formatTimeOfDay(time: string, locale?: string): string {
  const [hours, minutes] = time.split(':');
  const date = new Date(Date.UTC(2024, 0, 7, Number(hours), Number(minutes)));

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}
