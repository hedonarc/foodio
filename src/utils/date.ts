/** UTC on purpose: an ISO date is midnight UTC and would shift a day west of it. */
export function formatDate(isoDate: string, locale?: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
