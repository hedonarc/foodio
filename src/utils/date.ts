/**
 * Format an ISO 8601 calendar date (`2026-07-18`) for display.
 *
 * Rendered in UTC on purpose: `new Date('2026-07-18')` is midnight UTC, so
 * formatting it in a negative-offset timezone would show the 17th.
 */
export function formatDate(isoDate: string, locale?: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
