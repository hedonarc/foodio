/** Matches the server's alphabet: letters and digits, look-alikes removed. */
export const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const CODE_LENGTH = 6;

/**
 * What someone typed, turned into what the server will accept.
 *
 * People copy codes out of WhatsApp with spaces, dashes and stray case, and
 * they read `0` where the alphabet only has `O`. Silently dropping the
 * unusable characters is kinder than refusing the paste — the only thing that
 * survives is a character the server could have minted.
 */
export function normaliseCode(input: string): string {
  return [...input.toUpperCase()]
    .filter((character) => CODE_ALPHABET.includes(character))
    .slice(0, CODE_LENGTH)
    .join('');
}

export const isCompleteCode = (code: string): boolean => code.length === CODE_LENGTH;
