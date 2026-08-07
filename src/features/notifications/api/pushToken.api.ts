import { apiClient } from '@/api/client';

import type { PushPlatform } from '../types/pushToken.types';

export async function registerPushToken(token: string, platform: PushPlatform): Promise<void> {
  await apiClient.post<unknown>('/me/push-tokens', { token, platform });
}

/** The token contains `[` and `]` (`ExponentPushToken[...]`), so it must be percent-encoded as a path segment. */
export async function deregisterPushToken(token: string): Promise<void> {
  await apiClient.delete<unknown>(`/me/push-tokens/${encodeURIComponent(token)}`);
}
