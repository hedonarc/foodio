import { create } from 'zustand';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  locationStepCompleted: boolean;
  notificationStepCompleted: boolean;
  completeLocationStep: () => void;
  completeNotificationStep: () => void;
  completeOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  locationStepCompleted: false,
  notificationStepCompleted: false,
  completeLocationStep: () => set({ locationStepCompleted: true }),
  completeNotificationStep: () => set({ notificationStepCompleted: true }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));
