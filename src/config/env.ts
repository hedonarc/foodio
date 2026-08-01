import { NativeModules, TurboModuleRegistry } from 'react-native';

import Constants from 'expo-constants';

const DEV_API_PORT = 3000;

/** Handles `host:port`, `http://host:port/` and `exp://host:port`. */
function hostFrom(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  const withoutScheme = value.replace(/^[a-z+.-]+:\/\//i, '');
  const host = withoutScheme.split('/')[0]?.split('?')[0]?.split(':')[0];

  return host && host.length > 0 ? host : null;
}

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

/** TurboModule first: the New Architecture does not expose NativeModules.SourceCode. */
function metroScriptUrl(): string | null {
  return (
    readScriptUrl(TurboModuleRegistry.get('SourceCode')) ?? readScriptUrl(NativeModules.SourceCode)
  );
}

/**
 * `localhost` is the emulator itself on Android and nothing on a device, so the
 * host is derived. `hostUri` is empty outside Expo Go, hence the fallbacks.
 */
function resolveDevApiUrl(): string | null {
  const host =
    hostFrom(Constants.expoConfig?.hostUri) ??
    hostFrom(Constants.experienceUrl) ??
    hostFrom(metroScriptUrl());

  return host ? `http://${host}:${DEV_API_PORT}` : null;
}

/** Null rather than throwing, so misconfiguration surfaces as an error state. */
export function resolveApiUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  return resolveDevApiUrl();
}

export const API_URL_HELP =
  'Unable to determine the API URL. Set EXPO_PUBLIC_API_URL in .env, or run the ' +
  'app through the Expo dev server so the host can be derived automatically.';
