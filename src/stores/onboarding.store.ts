import { create } from 'zustand';

import { OnboardingStep } from '@/features/onboarding/types/onboarding.types';
import { getOnboardingStatus, setOnboardingStatus } from '@/services/storage';

export { OnboardingStep };

type OnboardingState = {
  step: OnboardingStep;
  isHydrated: boolean;
  completeLocationStep: () => Promise<void>;
  completeNotificationStep: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: OnboardingStep.Location,
  isHydrated: false,

  completeLocationStep: async () => {
    const nextStep = OnboardingStep.Notifications;
    set({ step: nextStep });
    await setOnboardingStatus(nextStep);
  },

  completeNotificationStep: async () => {
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
