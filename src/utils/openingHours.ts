/** One contiguous open period on one day. `0` is Sunday, matching Date#getDay(). */
export type OpeningHours = {
  dayOfWeek: number;
  /** 24-hour `HH:mm`. */
  opensAt: string;
  closesAt: string;
};

/** One open period, stripped of the day it falls on. */
export type OpeningWindow = Omit<OpeningHours, 'dayOfWeek'>;

/** Consecutive days sharing the same hours. */
export type OpeningHoursGroup = {
  days: number[];
  /** Chronological. A day may hold several — lunch, shut, then dinner. */
  windows: OpeningWindow[];
};

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

/** A period closing no later than it opens runs past midnight. */
/**
 * What the clock says **at the restaurant**. Reading `at.getDay()` and
 * `at.getHours()` asks the device instead, which is only right by coincidence
 * when the customer happens to share the restaurant's timezone.
 */
function localTimeAt(at: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at);

  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  // 0 = Sunday, matching `dayOfWeek` in the contract and `Date#getDay`.
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Some ICU builds render midnight as 24 under hour12: false.
  const hour = Number.parseInt(read('hour'), 10) % 24;

  return {
    day: days.indexOf(read('weekday')),
    minutes: hour * 60 + Number.parseInt(read('minute'), 10),
  };
}

export function isOpenAt(hours: readonly OpeningHours[], at: Date, timeZone: string): boolean {
  const { day, minutes: nowMinutes } = localTimeAt(at, timeZone);

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

const sameWindows = (a: readonly OpeningWindow[], b: readonly OpeningWindow[]): boolean =>
  a.length === b.length &&
  a.every(
    (window, index) =>
      window.opensAt === b[index]?.opensAt && window.closesAt === b[index]?.closesAt,
  );

/**
 * Monday-first, so a Mon–Fri block stays contiguous rather than splitting.
 *
 * A day may hold more than one window — lunch, shut through the afternoon, then
 * dinner is ordinary in Lahore, and nothing in the schema forbids it. Days are
 * grouped on their whole set of windows, so a day that drops lunch breaks the
 * block rather than passing for one that keeps it.
 */
export function groupOpeningHours(hours: readonly OpeningHours[]): OpeningHoursGroup[] {
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  const byDay = new Map<number, OpeningWindow[]>();
  for (const { dayOfWeek, opensAt, closesAt } of hours) {
    const windows = byDay.get(dayOfWeek) ?? [];
    windows.push({ opensAt, closesAt });
    byDay.set(dayOfWeek, windows);
  }

  const groups: OpeningHoursGroup[] = [];

  for (const day of weekOrder) {
    const windows = byDay.get(day);
    if (!windows || windows.length === 0) continue;

    // `HH:mm` sorts correctly as text, and an overnight window opens last anyway.
    windows.sort((a, b) => a.opensAt.localeCompare(b.opensAt));

    const previous = groups[groups.length - 1];
    const isContiguous =
      previous !== undefined &&
      sameWindows(previous.windows, windows) &&
      previous.days[previous.days.length - 1] === weekOrder[weekOrder.indexOf(day) - 1];

    if (isContiguous) {
      previous.days.push(day);
      continue;
    }

    groups.push({ days: [day], windows });
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
