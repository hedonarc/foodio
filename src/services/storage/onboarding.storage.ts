import * as SecureStore from 'expo-secure-store';

import { OnboardingStep } from '@/features/onboarding/types/onboarding.types';

const ONBOARDING_STATUS_KEY = 'foodio_onboarding_status';

export async function getOnboardingStatus(): Promise<OnboardingStep | null> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_STATUS_KEY);
    if (value && Object.values(OnboardingStep).includes(value as OnboardingStep)) {
      return value as OnboardingStep;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setOnboardingStatus(status: OnboardingStep): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_STATUS_KEY, status);
  } catch {
    // Silently ignore storage failures in non-supported environments
  }
}
