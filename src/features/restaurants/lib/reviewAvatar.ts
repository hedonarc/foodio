/**
 * The backend serves `avatar: ''` for authors without a picture — the app
 * owns the fallback: a disc showing the author's first letter.
 */
export function initialOf(author: string): string {
  const trimmed = author.trim();
  if (trimmed.length === 0) return '?';
  // Iterating by code point keeps surrogate pairs (emoji, CJK) whole.
  const [first] = trimmed;
  return (first ?? '?').toLocaleUpperCase();
}
