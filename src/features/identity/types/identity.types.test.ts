import type { ActiveRole, Person } from './identity.types';
import {
  CUSTOMER_ROLE,
  otpVerifyFormSchema,
  resolveRole,
  roleOptionsFor,
  sameRole,
} from './identity.types';

const person = (entitlements: Person['entitlements']): Person => ({
  id: 'marco',
  displayName: 'Marco R.',
  phone: null,
  entitlements,
});

describe('roleOptionsFor', () => {
  it('offers only the customer role to someone with no entitlements', () => {
    expect(roleOptionsFor(person([]))).toEqual([{ role: CUSTOMER_ROLE, restaurantId: null }]);
  });

  it('yields one entry per capability, not per relationship', () => {
    const options = roleOptionsFor(
      person([{ restaurantId: 'rest-1', capabilities: ['kitchen', 'delivery'] }]),
    );

    expect(options.map((option) => option.role.kind)).toEqual(['customer', 'kitchen', 'delivery']);
  });

  it('keeps two jobs at two restaurants apart', () => {
    const options = roleOptionsFor(
      person([
        { restaurantId: 'rest-1', capabilities: ['kitchen'] },
        { restaurantId: 'rest-3', capabilities: ['kitchen'] },
      ]),
    );

    expect(options.map((option) => option.restaurantId)).toEqual([null, 'rest-1', 'rest-3']);
  });
});

describe('sameRole', () => {
  it('separates the kitchen from delivery at one restaurant', () => {
    const kitchen: ActiveRole = { kind: 'kitchen', restaurantId: 'rest-1' };
    const delivery: ActiveRole = { kind: 'delivery', restaurantId: 'rest-1' };

    expect(sameRole(kitchen, delivery)).toBe(false);
  });

  it('separates the same capability at two restaurants', () => {
    expect(
      sameRole(
        { kind: 'kitchen', restaurantId: 'rest-1' },
        { kind: 'kitchen', restaurantId: 'rest-3' },
      ),
    ).toBe(false);
  });
});

describe('resolveRole', () => {
  const marco = person([{ restaurantId: 'rest-1', capabilities: ['kitchen', 'delivery'] }]);

  it('restores a role the person still holds', () => {
    const remembered: ActiveRole = { kind: 'kitchen', restaurantId: 'rest-1' };

    expect(resolveRole(marco, remembered)).toEqual(remembered);
  });

  it('falls back to customer when the entitlement is gone', () => {
    const revoked: ActiveRole = { kind: 'kitchen', restaurantId: 'rest-9' };

    expect(resolveRole(marco, revoked)).toEqual(CUSTOMER_ROLE);
  });

  it('falls back when the capability was dropped but the relationship remains', () => {
    const kitchenOnly = person([{ restaurantId: 'rest-1', capabilities: ['kitchen'] }]);

    expect(resolveRole(kitchenOnly, { kind: 'delivery', restaurantId: 'rest-1' })).toEqual(
      CUSTOMER_ROLE,
    );
  });

  it('falls back when signed out', () => {
    expect(resolveRole(null, { kind: 'kitchen', restaurantId: 'rest-1' })).toEqual(CUSTOMER_ROLE);
  });
});

describe('otpVerifyFormSchema', () => {
  const base = { phone: '+923001234567', code: '123456' };

  // Regression: a blank TextField reports '', not undefined. `.optional()`
  // alone only skips validation on undefined, so this used to fail `.min(1)`
  // and silently block every returning user — nobody types a name on a
  // second sign-in, since the field is labelled "first time only".
  it('accepts a blank name, the case every returning user hits', () => {
    expect(otpVerifyFormSchema.safeParse({ ...base, displayName: '' }).success).toBe(true);
  });

  it('accepts a whitespace-only name the same way', () => {
    expect(otpVerifyFormSchema.safeParse({ ...base, displayName: '   ' }).success).toBe(true);
  });

  it('accepts no displayName field at all', () => {
    expect(otpVerifyFormSchema.safeParse(base).success).toBe(true);
  });

  it('still trims and keeps a real name', () => {
    const result = otpVerifyFormSchema.safeParse({ ...base, displayName: '  Sara Ahmed  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.displayName).toBe('Sara Ahmed');
  });

  it('still rejects a name over 60 characters', () => {
    expect(otpVerifyFormSchema.safeParse({ ...base, displayName: 'a'.repeat(61) }).success).toBe(
      false,
    );
  });
});
