import { Redirect } from 'expo-router';

import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';

export default function Index() {
  const step = useOnboardingStore((state) => state.step);

  if (step !== OnboardingStep.Complete) {
    return <Redirect href="/(onboarding)/location" />;
  }

  return <Redirect href="/(tabs)" />;
}
