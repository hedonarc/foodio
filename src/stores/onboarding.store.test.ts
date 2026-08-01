import { getOnboardingStatus, setOnboardingStatus } from '@/services/storage';

import { OnboardingStep, useOnboardingStore } from './onboarding.store';

jest.mock('@/services/storage', () => ({
  getOnboardingStatus: jest.fn(),
  setOnboardingStatus: jest.fn(),
}));

const mockedGet = jest.mocked(getOnboardingStatus);
const mockedSet = jest.mocked(setOnboardingStatus);

const state = () => useOnboardingStore.getState();

beforeEach(() => {
  useOnboardingStore.setState({ step: OnboardingStep.Location, isHydrated: false });
  mockedGet.mockReset();
  mockedSet.mockReset().mockResolvedValue();
});

describe('step transitions', () => {
  it('starts at the location step', () => {
    expect(state().step).toBe(OnboardingStep.Location);
  });

  it('moves from location to notifications', async () => {
    await state().completeLocationStep();
    expect(state().step).toBe(OnboardingStep.Notifications);
  });

  it('moves from notifications to complete', async () => {
    await state().completeNotificationStep();
    expect(state().step).toBe(OnboardingStep.Complete);
  });

  it('persists each step so onboarding is not repeated on the next launch', async () => {
    await state().completeLocationStep();
    expect(mockedSet).toHaveBeenCalledWith(OnboardingStep.Notifications);

    await state().completeNotificationStep();
    expect(mockedSet).toHaveBeenCalledWith(OnboardingStep.Complete);
  });

  it('advances in memory even when persistence rejects', async () => {
    // A storage failure must not strand the user on a permission screen.
    mockedSet.mockRejectedValue(new Error('keychain unavailable'));

    await expect(state().completeNotificationStep()).rejects.toThrow();
    expect(state().step).toBe(OnboardingStep.Complete);
  });
});

describe('hydrate', () => {
  it('restores a persisted step', async () => {
    mockedGet.mockResolvedValue(OnboardingStep.Complete);

    await state().hydrate();

    expect(state().step).toBe(OnboardingStep.Complete);
    expect(state().isHydrated).toBe(true);
  });

  it('leaves a first-time user at the location step', async () => {
    mockedGet.mockResolvedValue(null);

    await state().hydrate();

    expect(state().step).toBe(OnboardingStep.Location);
    expect(state().isHydrated).toBe(true);
  });

  it('marks itself hydrated even with nothing stored, so the gate never hangs', async () => {
    mockedGet.mockResolvedValue(null);

    await state().hydrate();

    expect(state().isHydrated).toBe(true);
  });
});
