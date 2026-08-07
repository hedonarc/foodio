import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useMutation } from '@tanstack/react-query';

import { logError } from '@/lib/logger';
import { selectIsSignedIn, useSessionStore } from '@/stores/session.store';

import { registerPushToken } from '../api/pushToken.api';
import { setCachedPushToken } from '../lib/pushTokenCache';
import { shouldRegisterPushToken } from '../lib/shouldRegisterPushToken';
import type { PushPlatform } from '../types/pushToken.types';

const PLATFORM: PushPlatform | null =
  Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;

/**
 * Registers this device's Expo push token once a person is signed in and
 * notification permission is granted. Runs again whenever sign-in state
 * flips, so permission granted early in onboarding (before sign-in) still
 * lands a registration the moment the person signs in (story 2).
 *
 * `getExpoPushTokenAsync` has no real token to hand out on the iOS
 * Simulator — that rejection (and any other registration failure) is
 * swallowed here, not surfaced, since a missed push registration is not
 * something the customer can act on.
 */
export function useSyncPushToken(): void {
  const isSignedIn = useSessionStore(selectIsSignedIn);

  const { mutate: register } = useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: PushPlatform }) =>
      registerPushToken(token, platform),
    // Cache only a token the backend actually confirmed, so sign-out
    // deregisters exactly what was registered.
    onSuccess: (_data, { token }) => setCachedPushToken(token),
  });

  useEffect(() => {
    if (!isSignedIn || !PLATFORM) return;

    let cancelled = false;

    void (async () => {
      try {
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.getPermissionsAsync();
        if (cancelled || !shouldRegisterPushToken(status, isSignedIn)) return;

        const { data: token } = await Notifications.getExpoPushTokenAsync();
        if (cancelled) return;

        register({ token, platform: PLATFORM });
      } catch (error) {
        logError('notifications.sync', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, register]);
}
