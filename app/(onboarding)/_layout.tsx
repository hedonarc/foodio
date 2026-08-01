import { Stack } from 'expo-router';

import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';

/**
 * One screen exists per step, so completing a step is enough to move on, and
 * resuming a half-finished onboarding lands on the right screen. The screens
 * themselves never navigate.
 */
export default function OnboardingLayout() {
  const step = useOnboardingStore((state) => state.step);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Protected guard={step === OnboardingStep.Location}>
        <Stack.Screen name="location" />
      </Stack.Protected>

      <Stack.Protected guard={step === OnboardingStep.Notifications}>
        <Stack.Screen name="notifications" />
      </Stack.Protected>
    </Stack>
  );
}
