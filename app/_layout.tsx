import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Stack } from 'expo-router';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryProvider } from '@/providers/QueryProvider';
import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';
import { colors } from '@/theme';

import '../global.css';

import '@/i18n';

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </QueryProvider>
  );
}

/** Split out so it can read insets, which requires being inside the provider. */
function RootNavigator() {
  const insets = useSafeAreaInsets();

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

  const hasOnboarded = step === OnboardingStep.Complete;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Safe areas for every screen. Opt out per screen via its own contentStyle.
        contentStyle: {
          backgroundColor: colors.white,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      }}
    >
      <Stack.Protected guard={!hasOnboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={hasOnboarded}>
        <Stack.Screen name="index" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="cart" />
      </Stack.Protected>
    </Stack>
  );
}
