import { create } from 'zustand';

import { OnboardingStep } from '@/features/onboarding/types/onboarding.types';
import { getOnboardingStatus, setOnboardingStatus } from '@/services/storage';

export { OnboardingStep };

type OnboardingState = {
  step: OnboardingStep;
  isHydrated: boolean;
  completePermissions: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: OnboardingStep.Permissions,
  isHydrated: false,

  completePermissions: async () => {
    const nextStep = OnboardingStep.Complete;
    set({ step: nextStep });
    await setOnboardingStatus(nextStep);
  },

  hydrate: async () => {
    const savedStep = await getOnboardingStatus();
    if (savedStep) {
      set({ step: savedStep, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
