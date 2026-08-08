import { initialOf } from './reviewAvatar';

describe('initialOf', () => {
  it('takes the first letter, uppercased', () => {
    expect(initialOf('maria G.')).toBe('M');
  });

  it('ignores leading whitespace', () => {
    expect(initialOf('  james')).toBe('J');
  });

  it('falls back to ? for an empty author', () => {
    expect(initialOf('')).toBe('?');
    expect(initialOf('   ')).toBe('?');
  });

  it('keeps a surrogate-pair character whole', () => {
    expect(initialOf('𝔸lice')).toBe('𝔸');
  });
});
