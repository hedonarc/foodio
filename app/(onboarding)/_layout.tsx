import { Stack } from 'expo-router';

import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';

/**
 * Mounts the screen for the current step, so completing a step moves the user
 * on and resuming a half-finished onboarding lands in the right place. The
 * screens themselves never navigate.
 *
 * The notification guard is `!== Location` rather than `=== Notifications` on
 * purpose. Once onboarding is complete both screens would otherwise be guarded
 * off at once, and expo-router renders a layout with no screens as `null`
 * rather than navigating away from it — see `withLayoutContext`:
 *
 *     // Prevent throwing an error when there are no screens.
 *     if (!sorted.length) return null;
 *
 * Leaving one screen mounted keeps this Stack renderable, and the root layout's
 * guard is what actually removes the group and lets the app take over.
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

      <Stack.Protected guard={step !== OnboardingStep.Location}>
        <Stack.Screen name="notifications" />
      </Stack.Protected>
    </Stack>
  );
}
