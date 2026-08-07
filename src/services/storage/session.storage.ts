import * as SecureStore from 'expo-secure-store';

import { logError } from '@/lib/logger';

const ACCESS_TOKEN_KEY = 'foodio_access_token';
const REFRESH_TOKEN_KEY = 'foodio_refresh_token';
const ROLE_KEY = 'foodio_active_role';

/**
 * iOS keeps Secure Store across app uninstall; Android does not. Sign-out is
 * therefore a requirement rather than a convenience, and "uninstall to reset"
 * is wrong on one platform. See issue #55.
 */
async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    logError('session.storage.getItem', error);
    return null;
  }
}

async function setItem(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch (error) {
    logError('session.storage.setItem', error);
  }
}

export const getAccessToken = (): Promise<string | null> => getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string | null): Promise<void> =>
  setItem(ACCESS_TOKEN_KEY, token);

export const getRefreshToken = (): Promise<string | null> => getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string | null): Promise<void> =>
  setItem(REFRESH_TOKEN_KEY, token);

export const getStoredRole = (): Promise<string | null> => getItem(ROLE_KEY);
export const setStoredRole = (role: string | null): Promise<void> => setItem(ROLE_KEY, role);
