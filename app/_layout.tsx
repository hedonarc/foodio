import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Stack } from 'expo-router';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { setAuthTokenSource, setUnauthorizedHandler } from '@/api/client';
import { useNotificationListener, useSyncPushToken } from '@/features/notifications';
import { QueryProvider } from '@/providers/QueryProvider';
import { useActiveAddressStore } from '@/stores/activeAddress.store';
import { OnboardingStep, useOnboardingStore } from '@/stores/onboarding.store';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import '../global.css';

import '@/i18n';

// One place attaches identity to requests; no call site asserts who is asking.
setAuthTokenSource(() => useSessionStore.getState().accessToken);
// One place rotates an expired token; every other 401 stays a real error.
setUnauthorizedHandler(() => useSessionStore.getState().refreshTokens());

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

    // A stored token is a claim, not proof — hydrate resolves it through the
    // server, and its own 401 handling recovers a merely-expired access token.
    void hydrateSession();
  }, [sessionHydrated, hydrateSession]);

  const activeAddressHydrated = useActiveAddressStore((state) => state.isHydrated);
  const hydrateActiveAddress = useActiveAddressStore((state) => state.hydrate);

  useEffect(() => {
    if (activeAddressHydrated) return;

    // Not part of the splash gate below: nothing about which navigator shows
    // depends on it, unlike onboarding/session — Checkout just resolves to no
    // active address for the instant before this settles.
    void hydrateActiveAddress();
  }, [activeAddressHydrated, hydrateActiveAddress]);

  // Neither gates the splash screen: a push isn't needed for any screen to render.
  useSyncPushToken();
  useNotificationListener();

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
