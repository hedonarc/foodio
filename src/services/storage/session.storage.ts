import * as SecureStore from 'expo-secure-store';

import { logError } from '@/lib/logger';

const TOKEN_KEY = 'foodio_session_token';
const ROLE_KEY = 'foodio_active_role';

/**
 * iOS keeps Secure Store across app uninstall; Android does not. Sign-out is
 * therefore a requirement rather than a convenience, and "uninstall to reset"
 * is wrong on one platform. See issue #55.
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    logError('session.storage.getToken', error);
    return null;
  }
}

export async function setSessionToken(token: string | null): Promise<void> {
  try {
    if (token === null) await SecureStore.deleteItemAsync(TOKEN_KEY);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    logError('session.storage.setToken', error);
  }
}

export async function getStoredRole(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ROLE_KEY);
  } catch (error) {
    logError('session.storage.getRole', error);
    return null;
  }
}

export async function setStoredRole(role: string | null): Promise<void> {
  try {
    if (role === null) await SecureStore.deleteItemAsync(ROLE_KEY);
    else await SecureStore.setItemAsync(ROLE_KEY, role);
  } catch (error) {
    logError('session.storage.setRole', error);
  }
}
