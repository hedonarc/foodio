/**
 * The first letter of a name, for standing in where there is no picture — a
 * review author without an avatar, a restaurant that has not set a photograph.
 */
export function initialOf(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '?';
  // Iterating by code point keeps surrogate pairs (emoji, CJK) whole.
  const [first] = trimmed;
  return (first ?? '?').toLocaleUpperCase();
}
