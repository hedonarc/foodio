import * as SecureStore from 'expo-secure-store';

import { OnboardingStep } from '@/features/onboarding/types/onboarding.types';
import { logError } from '@/lib/logger';

const ONBOARDING_STATUS_KEY = 'foodio_onboarding_status';

function isOnboardingStep(value: string): value is OnboardingStep {
  return Object.values(OnboardingStep).includes(value as OnboardingStep);
}

export async function getOnboardingStatus(): Promise<OnboardingStep | null> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_STATUS_KEY);
    return value && isOnboardingStep(value) ? value : null;
  } catch (error) {
    // Treated as "never onboarded" rather than fatal, but no longer silently:
    // a read failure here means onboarding repeats on every launch, which is
    // worth seeing rather than guessing at.
    logError('onboarding.storage.get', error);
    return null;
  }
}

export async function setOnboardingStatus(status: OnboardingStep): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_STATUS_KEY, status);
  } catch (error) {
    logError('onboarding.storage.set', error);
  }
}
