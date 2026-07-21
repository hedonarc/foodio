import { create } from 'zustand';

export enum OnboardingStep {
  Location = 'location',
  Notifications = 'notifications',
  Complete = 'complete',
}

type OnboardingState = {
  step: OnboardingStep;
  completeLocationStep: () => void;
  completeNotificationStep: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: OnboardingStep.Location,
  completeLocationStep: () => set({ step: OnboardingStep.Notifications }),
  completeNotificationStep: () => set({ step: OnboardingStep.Complete }),
}));
