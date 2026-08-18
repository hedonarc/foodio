import { checklistFor, isFinishing, remainingCount } from './checklist';

const BARE = {
  status: 'onboarding' as const,
  description: '',
  address: '',
  cuisines: [],
  openingHours: [],
};

const facts = (over: Partial<Parameters<typeof checklistFor>[0]> = {}) =>
  checklistFor({ restaurant: BARE, dishCount: 0, staffCount: 1, ...over });

describe('checklistFor', () => {
  it('ticks nothing for a restaurant that has only just been claimed', () => {
    expect(remainingCount(facts())).toBe(5);
  });

  it('marks the dish the only required step, matching t2s single bar', () => {
    expect(
      facts()
        .filter((step) => step.required)
        .map((step) => step.key),
    ).toEqual(['dish']);
  });

  it('ticks the dish step as soon as there is one', () => {
    expect(facts({ dishCount: 1 }).find((step) => step.key === 'dish')?.done).toBe(true);
  });

  it('un-ticks it again when the last dish goes, exactly as the server would', () => {
    const dishStep = (count: number) =>
      facts({ dishCount: count }).find((step) => step.key === 'dish')?.done;

    expect(dishStep(1)).toBe(true);
    expect(dishStep(0)).toBe(false);
  });

  it('wants all three profile fields, not just a name', () => {
    const partly = { ...BARE, description: 'Cakes.', address: '', cuisines: ['Bakery'] };
    expect(facts({ restaurant: partly }).find((step) => step.key === 'describe')?.done).toBe(false);

    const whole = { ...partly, address: '12 Mall Road' };
    expect(facts({ restaurant: whole }).find((step) => step.key === 'describe')?.done).toBe(true);
  });

  it('does not count the owner as having added a team', () => {
    expect(facts({ staffCount: 1 }).find((step) => step.key === 'staff')?.done).toBe(false);
    expect(facts({ staffCount: 2 }).find((step) => step.key === 'staff')?.done).toBe(true);
  });

  it('ticks going live only when the restaurant actually is', () => {
    expect(facts().find((step) => step.key === 'live')?.done).toBe(false);

    const open = { ...BARE, status: 'active' as const };
    expect(facts({ restaurant: open }).find((step) => step.key === 'live')?.done).toBe(true);
  });
});

describe('isFinishing', () => {
  it('shows the checklist while a restaurant is still being set up', () => {
    expect(isFinishing('onboarding')).toBe(true);
  });

  it('retires it once the restaurant is open', () => {
    expect(isFinishing('active')).toBe(false);
  });

  /** A suspended restaurant has a problem no checklist step can fix. */
  it('does not offer it to a suspended restaurant', () => {
    expect(isFinishing('suspended')).toBe(false);
  });
});
