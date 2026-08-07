import { shouldRegisterPushToken } from './shouldRegisterPushToken';

describe('shouldRegisterPushToken', () => {
  it('registers when permission is granted and signed in', () => {
    expect(shouldRegisterPushToken('granted', true)).toBe(true);
  });

  it('does not register when signed out, even with permission granted', () => {
    expect(shouldRegisterPushToken('granted', false)).toBe(false);
  });

  it('does not register when permission is denied, even when signed in', () => {
    expect(shouldRegisterPushToken('denied', true)).toBe(false);
  });

  it('does not register when permission is undetermined and signed in', () => {
    expect(shouldRegisterPushToken('undetermined', true)).toBe(false);
  });

  it('does not register when neither is true', () => {
    expect(shouldRegisterPushToken('denied', false)).toBe(false);
  });
});
