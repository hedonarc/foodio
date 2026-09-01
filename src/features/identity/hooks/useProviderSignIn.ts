import { useState } from 'react';
import { Platform } from 'react-native';

import * as AppleAuthentication from 'expo-apple-authentication';

import { GoogleOneTapSignIn } from 'react-native-nitro-google-signin';

import { useSessionStore } from '@/stores/session.store';

import { signInWithProvider } from '../api/identity.api';
import type { IdentityProvider } from '../types/identity.types';

type TokenResult = { idToken: string; displayName?: string };

/**
 * The web client id, not the Android one — Credential Manager asks Google for a
 * token addressed to it, and the API checks that same audience. Configured once
 * per process, lazily, so a build without the value fails at the tap rather
 * than at startup on a screen nobody signed in from.
 */
let configured = false;

function configureGoogle(): void {
  if (configured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!webClientId) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is unset — Google sign-in cannot be offered.',
    );
  }

  GoogleOneTapSignIn.configure({ webClientId, scopes: ['email'] });
  configured = true;
}

/** Apple hands over a name only on the very first sign-in, in pieces. */
function nameFrom(
  credential: AppleAuthentication.AppleAuthenticationCredential,
): string | undefined {
  const parts = [credential.fullName?.givenName, credential.fullName?.familyName].filter(
    (part): part is string => typeof part === 'string' && part.trim() !== '',
  );

  return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * The two ways in. Both end the same way: a token this app cannot forge, handed
 * to the API, which verifies it against the provider's own keys — the backend's
 * ADR-0019.
 *
 * A cancelled sheet is not an error. Somebody who changes their mind should see
 * the screen they came from rather than a red message about what went wrong,
 * which is why the token step may answer `null`.
 */
export function useProviderSignIn() {
  const signIn = useSessionStore((state) => state.signIn);
  const [pending, setPending] = useState<IdentityProvider | null>(null);
  const [error, setError] = useState<unknown>(null);

  const run = async (provider: IdentityProvider, token: () => Promise<TokenResult | null>) => {
    setPending(provider);
    setError(null);

    try {
      const result = await token();
      if (result === null) return;

      const session = await signInWithProvider({ provider, ...result });
      await signIn(session);
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(null);
    }
  };

  return {
    pending,
    error,
    /** iOS only: Apple ships no Android sheet, and Android has no Apple account. */
    appleAvailable: Platform.OS === 'ios',

    google: () =>
      run('google', async () => {
        configureGoogle();

        const result = await GoogleOneTapSignIn.signIn();
        const idToken = result.data?.idToken;

        return typeof idToken === 'string' && idToken !== '' ? { idToken } : null;
      }),

    apple: () =>
      run('apple', async () => {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        const idToken = credential.identityToken;
        if (idToken === null) return null;

        const displayName = nameFrom(credential);
        return displayName === undefined ? { idToken } : { idToken, displayName };
      }),
  };
}
