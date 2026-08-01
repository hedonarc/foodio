import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Redirect } from 'expo-router';

import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';
import { colors } from '@/theme';

export default function Index() {
  const step = useOnboardingStore((state) => state.step);
  const isHydrated = useOnboardingStore((state) => state.isHydrated);
  const hydrate = useOnboardingStore((state) => state.hydrate);

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [isHydrated, hydrate]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (step === OnboardingStep.Location) {
    return <Redirect href="/(onboarding)/location" />;
  }

  if (step === OnboardingStep.Notifications) {
    return <Redirect href="/(onboarding)/notifications" />;
  }

  return <Redirect href="/(tabs)" />;
}
