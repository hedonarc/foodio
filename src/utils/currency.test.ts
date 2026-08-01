import { formatMoney } from './currency';

describe('formatMoney', () => {
  it('renders minor units as a decimal amount', () => {
    expect(formatMoney(1499, 'USD', 'en-US')).toBe('$14.99');
  });

  it('keeps trailing zeroes', () => {
    expect(formatMoney(1150, 'USD', 'en-US')).toBe('$11.50');
    expect(formatMoney(400, 'USD', 'en-US')).toBe('$4.00');
  });

  it('renders a free delivery fee as zero rather than blank', () => {
    expect(formatMoney(0, 'USD', 'en-US')).toBe('$0.00');
  });

  it('does not accumulate floating point error across a cart', () => {
    // 0.1 + 0.2 as floats is 0.30000000000000004; as minor units it is exact.
    const total = 10 + 20;
    expect(formatMoney(total, 'USD', 'en-US')).toBe('$0.30');
  });

  it('respects currencies with no minor unit', () => {
    // JPY has an exponent of 0, so 1499 minor units is ¥1,499 — not ¥14.99.
    expect(formatMoney(1499, 'JPY', 'en-US')).toBe('¥1,499');
  });

  it('follows the locale, not the currency, for separators', () => {
    // `\s` rather than a literal space: Intl separates the amount and the
    // symbol with U+00A0, which is invisible in a diff and easy to get wrong.
    expect(formatMoney(123456, 'EUR', 'de-DE')).toMatch(/^1\.234,56\s€$/u);
  });
});
