import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Stack } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from '@/providers/QueryProvider';
import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';
import { colors } from '@/theme';

import '../global.css';

import '@/i18n';

/**
 * Onboarding is gated by which routes exist, not by navigation calls.
 *
 * The root index used to redirect while the permission screens also navigated,
 * so one state change triggered two navigations to the same place. A redirect
 * from a background screen cannot dismiss the stack on top of it either.
 * Guards avoid both problems: when `(onboarding)` stops existing, the router
 * has nowhere to be but `index`.
 */
export default function RootLayout() {
  const step = useOnboardingStore((state) => state.step);
  const isHydrated = useOnboardingStore((state) => state.isHydrated);
  const hydrate = useOnboardingStore((state) => state.hydrate);

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [isHydrated, hydrate]);

  // The persisted step is unknown until hydration finishes; mounting routes
  // before then would flash onboarding at someone who already completed it.
  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const hasOnboarded = step === OnboardingStep.Complete;

  return (
    <QueryProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!hasOnboarded}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>

          <Stack.Protected guard={hasOnboarded}>
            <Stack.Screen name="index" />
            <Stack.Screen name="restaurant/[id]" />
            <Stack.Screen name="cart" />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
