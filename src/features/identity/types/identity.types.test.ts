import type { ActiveRole, Person } from './identity.types';
import { CUSTOMER_ROLE, resolveRole, roleOptionsFor, sameRole } from './identity.types';

const person = (entitlements: Person['entitlements']): Person => ({
  id: 'marco',
  displayName: 'Marco R.',
  entitlements,
});

describe('roleOptionsFor', () => {
  it('offers only ordering to someone with no entitlements', () => {
    expect(roleOptionsFor(person([]))).toEqual([{ role: CUSTOMER_ROLE, restaurantId: null }]);
  });

  it('yields one entry per capability, not per relationship', () => {
    const options = roleOptionsFor(
      person([{ restaurantId: 'rest-1', capabilities: ['serve', 'deliver'] }]),
    );

    expect(options.map((option) => option.role.kind)).toEqual(['customer', 'serve', 'deliver']);
  });

  it('keeps two jobs at two restaurants apart', () => {
    const options = roleOptionsFor(
      person([
        { restaurantId: 'rest-1', capabilities: ['serve'] },
        { restaurantId: 'rest-3', capabilities: ['serve'] },
      ]),
    );

    expect(options.map((option) => option.restaurantId)).toEqual([null, 'rest-1', 'rest-3']);
  });
});

describe('sameRole', () => {
  it('separates serving from delivering at one restaurant', () => {
    const serve: ActiveRole = { kind: 'serve', restaurantId: 'rest-1' };
    const deliver: ActiveRole = { kind: 'deliver', restaurantId: 'rest-1' };

    expect(sameRole(serve, deliver)).toBe(false);
  });

  it('separates the same capability at two restaurants', () => {
    expect(
      sameRole(
        { kind: 'serve', restaurantId: 'rest-1' },
        { kind: 'serve', restaurantId: 'rest-3' },
      ),
    ).toBe(false);
  });
});

describe('resolveRole', () => {
  const marco = person([{ restaurantId: 'rest-1', capabilities: ['serve', 'deliver'] }]);

  it('restores a role the person still holds', () => {
    const remembered: ActiveRole = { kind: 'serve', restaurantId: 'rest-1' };

    expect(resolveRole(marco, remembered)).toEqual(remembered);
  });

  it('falls back to ordering when the entitlement is gone', () => {
    const revoked: ActiveRole = { kind: 'serve', restaurantId: 'rest-9' };

    expect(resolveRole(marco, revoked)).toEqual(CUSTOMER_ROLE);
  });

  it('falls back when the capability was dropped but the relationship remains', () => {
    const served = person([{ restaurantId: 'rest-1', capabilities: ['serve'] }]);

    expect(resolveRole(served, { kind: 'deliver', restaurantId: 'rest-1' })).toEqual(CUSTOMER_ROLE);
  });

  it('falls back when signed out', () => {
    expect(resolveRole(null, { kind: 'serve', restaurantId: 'rest-1' })).toEqual(CUSTOMER_ROLE);
  });
});
