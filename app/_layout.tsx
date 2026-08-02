import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Stack } from 'expo-router';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { setAuthTokenSource } from '@/api/client';
import { fetchPeople } from '@/features/identity';
import { QueryProvider } from '@/providers/QueryProvider';
import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import '../global.css';

import '@/i18n';

// One place attaches identity to requests; no call site asserts who is asking.
setAuthTokenSource(() => useSessionStore.getState().token);

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

  const sessionHydrated = useSessionStore((state) => state.isHydrated);
  // The active role picks the navigator; switching resets to its home (#59).
  const role = useSessionStore((state) => state.role);
  const hydrateSession = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (sessionHydrated) return;

    // Resolve the token through the server: a stored token is a claim, not proof.
    void hydrateSession(async (token) => {
      const people = await fetchPeople().catch(() => []);
      return people.find((person) => `person:${person.id}` === token) ?? null;
    });
  }, [sessionHydrated, hydrateSession]);

  if (!isHydrated || !sessionHydrated) {
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

      <Stack.Protected guard={hasOnboarded && role.kind === 'kitchen'}>
        <Stack.Screen
          name="(kitchen)"
          options={{ contentStyle: { backgroundColor: colors.white } }}
        />
      </Stack.Protected>

      <Stack.Protected guard={hasOnboarded && role.kind === 'delivery'}>
        <Stack.Screen
          name="(delivery)"
          options={{ contentStyle: { backgroundColor: colors.white } }}
        />
      </Stack.Protected>

      <Stack.Protected guard={hasOnboarded && role.kind === 'customer'}>
        {/* No root insets: the tab bar owns the bottom edge and each tab its top. */}
        <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: colors.white } }} />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="menu-item/[id]" />
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
        {/* Full-bleed video: black, no insets — the screen places its own controls. */}
        <Stack.Screen name="clip/[id]" options={{ contentStyle: { backgroundColor: 'black' } }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="address" />
        <Stack.Screen name="order/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
