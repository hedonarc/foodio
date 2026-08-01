/**
 * Money is stored as an integer count of the currency's minor unit — see
 * docs/adr/0002-money-as-integer-minor-units.md. Formatting is the only place
 * it becomes a decimal, and it happens once, here.
 */
export function formatMoney(minorUnits: number, currency: string, locale?: string): string {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  // JPY has no minor unit, USD has two. Ask the formatter rather than assuming 100.
  const exponent = formatter.resolvedOptions().maximumFractionDigits ?? 2;

  return formatter.format(minorUnits / 10 ** exponent);
}
