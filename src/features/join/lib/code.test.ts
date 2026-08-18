import { CODE_LENGTH, isCompleteCode, normaliseCode } from './code';

describe('normaliseCode', () => {
  it('leaves a clean code alone', () => {
    expect(normaliseCode('K7M2QX')).toBe('K7M2QX');
  });

  it('upper-cases, because the alphabet has no lower-case members', () => {
    expect(normaliseCode('k7m2qx')).toBe('K7M2QX');
  });

  /** Codes are copied out of WhatsApp, where they arrive spaced or hyphenated. */
  it.each([
    ['K7M 2QX', 'K7M2QX'],
    ['K7M-2QX', 'K7M2QX'],
    ['  K7M2QX  ', 'K7M2QX'],
  ])('drops the punctuation in %s', (input, expected) => {
    expect(normaliseCode(input)).toBe(expected);
  });

  /**
   * The look-alikes are excluded from the alphabet precisely so a code can be
   * read aloud. Someone typing what they heard will reach for them anyway, and
   * dropping them beats refusing the whole paste.
   */
  it.each([...'O0I1'])('drops the look-alike %s', (character) => {
    expect(normaliseCode(character)).toBe('');
  });

  /**
   * `L` stays. It is only ambiguous against `1` in lower case, and the alphabet
   * is upper-case only — so a lower-case `l` upper-cases into a real character
   * rather than being thrown away.
   */
  it('keeps L, and upper-cases a lower-case one into it', () => {
    expect(normaliseCode('L')).toBe('L');
    expect(normaliseCode('l')).toBe('L');
  });

  it('never exceeds the code length, however much is pasted', () => {
    expect(normaliseCode('K7M2QXZZZZZZ')).toHaveLength(CODE_LENGTH);
  });

  it('returns nothing for input with nothing usable in it', () => {
    expect(normaliseCode('!!! 0011')).toBe('');
  });
});

describe('isCompleteCode', () => {
  it('is true only at full length', () => {
    expect(isCompleteCode('K7M2QX')).toBe(true);
    expect(isCompleteCode('K7M2Q')).toBe(false);
    expect(isCompleteCode('')).toBe(false);
  });
});

/**
 * The field deliberately has no `maxLength`, because that caps the raw text:
 * a pasted "GYMH-NU" would be cut to "GYMH-N" before the dash is stripped, and
 * the last character would vanish. Caught by typing a realistic pasted code.
 */
describe('punctuation does not eat the length budget', () => {
  it('keeps all six characters through a hyphenated code', () => {
    expect(normaliseCode('gymh-nu')).toBe('GYMHNU');
  });

  it('keeps all six through spaces', () => {
    expect(normaliseCode('GYM HNU')).toBe('GYMHNU');
  });
});
