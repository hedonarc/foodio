import { blockerFor, canChangeStatus, looksShutToCustomers } from './goingLive';

describe('blockerFor', () => {
  it('names the one bar when there is nothing to sell', () => {
    expect(blockerFor(0, 'active')).toBe('no-dishes');
  });

  it('clears as soon as there is a single dish', () => {
    expect(blockerFor(1, 'active')).toBeNull();
  });

  /**
   * t2 deliberately kept opening hours off the bar: a rule that applied at
   * publication but not afterwards would be an asymmetry pretending to be a
   * standard. Asserted so nobody "improves" this into a second condition.
   */
  /**
   * The guard exists so a rule cannot arrive by accident, not so one can never
   * arrive. A second one did arrive, on purpose: an unpaid subscription refuses
   * reopening — see ADR-0017 and t22. Opening hours are still not a bar.
   */
  it('takes a dish count and a subscription, and nothing else', () => {
    expect(blockerFor.length).toBe(2);
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

describe('blockerFor — the unpaid bar', () => {
  it('refuses a restaurant whose subscription is behind', () => {
    expect(blockerFor(5, 'past_due')).toBe('unpaid');
  });

  it('lets a trialing restaurant open, because it owes nothing yet', () => {
    expect(blockerFor(5, 'trialing')).toBeNull();
  });

  it('lets a paid-up restaurant open', () => {
    expect(blockerFor(5, 'active')).toBeNull();
  });

  /**
   * Not heard yet is not the same as behind. Claiming they cannot open would be
   * a guess, and the server refuses anyway if the guess was wrong.
   */
  it('says nothing while the subscription is still loading', () => {
    expect(blockerFor(5, undefined)).toBeNull();
  });

  /** The one they can fix without spending anything comes first. */
  it('names the dish first when both are unmet', () => {
    expect(blockerFor(0, 'past_due')).toBe('no-dishes');
  });
});
