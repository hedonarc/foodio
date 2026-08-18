import { blockerFor, canChangeStatus, looksShutToCustomers } from './goingLive';

describe('blockerFor', () => {
  it('names the one bar when there is nothing to sell', () => {
    expect(blockerFor(0)).toBe('no-dishes');
  });

  it('clears as soon as there is a single dish', () => {
    expect(blockerFor(1)).toBeNull();
  });

  /**
   * t2 deliberately kept opening hours off the bar: a rule that applied at
   * publication but not afterwards would be an asymmetry pretending to be a
   * standard. Asserted so nobody "improves" this into a second condition.
   */
  it('takes only a dish count, so no second rule can creep in', () => {
    expect(blockerFor.length).toBe(1);
  });
});

describe('looksShutToCustomers', () => {
  it('warns about an active restaurant with no hours', () => {
    expect(looksShutToCustomers({ status: 'active', openingHours: [] })).toBe(true);
  });

  it('says nothing once there are hours', () => {
    expect(
      looksShutToCustomers({
        status: 'active',
        openingHours: [{ dayOfWeek: 1, opensAt: '11:00', closesAt: '22:00' }],
      }),
    ).toBe(false);
  });

  /** Not yet listed, so "customers see you as closed" would be a lie. */
  it.each(['onboarding' as const, 'suspended' as const])(
    'stays quiet while %s, when nobody can see it anyway',
    (status) => {
      expect(looksShutToCustomers({ status, openingHours: [] })).toBe(false);
    },
  );
});

describe('canChangeStatus', () => {
  it('lets a restaurant open and step back', () => {
    expect(canChangeStatus('onboarding')).toBe(true);
    expect(canChangeStatus('active')).toBe(true);
  });

  /** Suspension is Foodio's lever — a tenant that could lift it makes billing decorative. */
  it('refuses a suspended restaurant', () => {
    expect(canChangeStatus('suspended')).toBe(false);
  });
});
