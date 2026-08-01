import Constants from 'expo-constants';

/** Port the local mock API listens on (see the `api` script in package.json). */
const DEV_API_PORT = 3000;

/**
 * In development the API host cannot be hardcoded: `localhost` means the
 * emulator itself on Android, and means nothing at all on a physical device.
 * Expo already knows the dev machine's address, so borrow it.
 */
function resolveDevApiUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;

  const host = hostUri.split(':')[0];
  if (!host) return null;

  return `http://${host}:${DEV_API_PORT}`;
}

function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  const devApiUrl = resolveDevApiUrl();
  if (devApiUrl) return devApiUrl;

  throw new Error(
    'Unable to determine the API URL. Set EXPO_PUBLIC_API_URL in .env, or run ' +
      'the app through the Expo dev server so the host can be derived automatically.',
  );
}

export const env = {
  apiUrl: resolveApiUrl(),
} as const;
