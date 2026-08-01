import { NativeModules, TurboModuleRegistry } from 'react-native';

import Constants from 'expo-constants';

/** Port the local mock API listens on (see the `api` script in package.json). */
const DEV_API_PORT = 3000;

/**
 * Pull a bare hostname out of any of the shapes Expo hands us:
 * `192.168.0.6:8081`, `http://192.168.0.6:8081/`, `exp://192.168.0.6:8081`.
 */
function hostFrom(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  const withoutScheme = value.replace(/^[a-z+.-]+:\/\//i, '');
  const host = withoutScheme.split('/')[0]?.split('?')[0]?.split(':')[0];

  return host && host.length > 0 ? host : null;
}

/** Read `scriptURL` off either shape of the SourceCode native module. */
function readScriptUrl(module: unknown): string | null {
  if (typeof module !== 'object' || module === null) return null;

  const candidate = module as { scriptURL?: unknown; getConstants?: unknown };

  if (typeof candidate.scriptURL === 'string') return candidate.scriptURL;

  if (typeof candidate.getConstants === 'function') {
    const constants: unknown = candidate.getConstants();
    if (typeof constants === 'object' && constants !== null) {
      const { scriptURL } = constants as { scriptURL?: unknown };
      if (typeof scriptURL === 'string') return scriptURL;
    }
  }

  return null;
}

/**
 * The Metro server this bundle was loaded from — definitionally the dev
 * machine, and the only source that survives being launched outside the dev
 * client, where Expo's manifest fields are empty.
 *
 * The TurboModule is tried first: under the New Architecture, which RN 0.86
 * enables by default, `NativeModules.SourceCode` is not exposed at all.
 */
function metroScriptUrl(): string | null {
  return (
    readScriptUrl(TurboModuleRegistry.get('SourceCode')) ?? readScriptUrl(NativeModules.SourceCode)
  );
}

/**
 * In development the API host cannot be hardcoded: `localhost` means the
 * emulator itself on Android, and means nothing at all on a physical device.
 *
 * `hostUri` is populated in Expo Go but not in every development build, so
 * fall through several sources rather than trusting one.
 */
function resolveDevApiUrl(): string | null {
  const host =
    hostFrom(Constants.expoConfig?.hostUri) ??
    hostFrom(Constants.experienceUrl) ??
    hostFrom(metroScriptUrl());

  return host ? `http://${host}:${DEV_API_PORT}` : null;
}

/**
 * Resolved lazily, and null rather than throwing, so a misconfigured build
 * surfaces as an error state on the screen that needed data — not as a crash
 * at import time that takes the whole app down before it renders.
 */
export function resolveApiUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  return resolveDevApiUrl();
}

export const API_URL_HELP =
  'Unable to determine the API URL. Set EXPO_PUBLIC_API_URL in .env, or run the ' +
  'app through the Expo dev server so the host can be derived automatically.';
