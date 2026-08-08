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
  useOnboardingStore.setState({ step: OnboardingStep.Permissions, isHydrated: false });
  mockedGet.mockReset();
  mockedSet.mockReset().mockResolvedValue();
});

describe('step transitions', () => {
  it('starts at the permission checklist', () => {
    expect(state().step).toBe(OnboardingStep.Permissions);
  });

  it('moves from the checklist straight to complete', async () => {
    await state().completePermissions();
    expect(state().step).toBe(OnboardingStep.Complete);
  });

  it('persists the step so onboarding is not repeated on the next launch', async () => {
    await state().completePermissions();
    expect(mockedSet).toHaveBeenCalledWith(OnboardingStep.Complete);
  });

  it('advances in memory even when persistence rejects', async () => {
    // A storage failure must not strand the user on the permission screen.
    mockedSet.mockRejectedValue(new Error('keychain unavailable'));

    await expect(state().completePermissions()).rejects.toThrow();
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

  it('leaves a first-time user at the permission checklist', async () => {
    mockedGet.mockResolvedValue(null);

    await state().hydrate();

    expect(state().step).toBe(OnboardingStep.Permissions);
    expect(state().isHydrated).toBe(true);
  });

  it('marks itself hydrated even with nothing stored, so the gate never hangs', async () => {
    mockedGet.mockResolvedValue(null);

    await state().hydrate();

    expect(state().isHydrated).toBe(true);
  });
});
