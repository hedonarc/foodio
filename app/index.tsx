import { Redirect } from 'expo-router';

import { useOnboardingStore } from '@/stores/onboarding.store';

export default function Index() {
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/location" />;
  }

  return <Redirect href="/(tabs)" />;
}
