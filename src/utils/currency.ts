/** The only place minor units become a decimal — see docs/adr/0002. */
export function formatMoney(minorUnits: number, currency: string, locale?: string): string {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  // JPY has no minor unit, USD has two — ask rather than assume 100.
  const exponent = formatter.resolvedOptions().maximumFractionDigits ?? 2;

  return formatter.format(minorUnits / 10 ** exponent);
}
