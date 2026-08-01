import { Stack } from 'expo-router';

import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';

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

      {/* `!== Location`, not `=== Notifications`: expo-router renders a Stack
          with every screen guarded off as null instead of navigating away. */}
      <Stack.Protected guard={step !== OnboardingStep.Location}>
        <Stack.Screen name="notifications" />
      </Stack.Protected>
    </Stack>
  );
}
