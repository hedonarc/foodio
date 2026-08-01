import { create } from 'zustand';

import { OnboardingStep } from '@/features/onboarding/types/onboarding.types';
import { logDebug } from '@/lib/logger';
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
    logDebug('onboarding.store', `completeLocationStep -> ${nextStep}`);
    set({ step: nextStep });
    await setOnboardingStatus(nextStep);
    logDebug('onboarding.store', `persisted ${nextStep}`);
  },

  completeNotificationStep: async () => {
    const nextStep = OnboardingStep.Complete;
    logDebug('onboarding.store', `completeNotificationStep -> ${nextStep}`);
    set({ step: nextStep });
    await setOnboardingStatus(nextStep);
    logDebug('onboarding.store', `persisted ${nextStep}`);
  },

  hydrate: async () => {
    const savedStep = await getOnboardingStatus();
    logDebug('onboarding.store', `hydrate read ${savedStep ?? 'nothing stored'}`);
    if (savedStep) {
      set({ step: savedStep, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
