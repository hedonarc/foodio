import type { InternalAxiosRequestConfig } from 'axios';
import axios, { isAxiosError } from 'axios';

import { API_URL_HELP, resolveApiUrl } from '@/config/env';

import { ApiError, toApiError } from './errors';

/**
 * Set by the session store. A plain module variable rather than an import, so
 * the client does not depend on a store that depends on the client.
 */
let getAuthToken: () => string | null = () => null;

export function setAuthTokenSource(source: () => string | null): void {
  getAuthToken = source;
}

/**
 * Attempts one refresh and returns the new access token, or null if the
 * refresh itself failed — in which case the caller has already been signed
 * out. Same wiring pattern as `setAuthTokenSource`, for the same reason.
 */
let refreshAccessToken: () => Promise<string | null> = () => Promise.resolve(null);

export function setUnauthorizedHandler(handler: () => Promise<string | null>): void {
  refreshAccessToken = handler;
}

/** Every rejection leaving this client is an ApiError. */
export const apiClient = axios.create({
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

const isAuthEndpoint = (url: string | undefined): boolean => (url ?? '').startsWith('/auth/');

// Per request, not at import: throwing during module evaluation killed the app
// before it could render the error state explaining why.
apiClient.interceptors.request.use((config) => {
  const baseURL = resolveApiUrl();
  if (!baseURL) throw new ApiError('config', API_URL_HELP);

  config.baseURL = baseURL;

  // Identity travels here and nowhere else: no call site puts a person in a
  // URL, so the server stays the authority on who is asking. See issue #55.
  //
  // Never on /auth/*: the backend validates a *present* token even on a
  // public route and 401s a stale one rather than silently ignoring it — by
  // design, so an expired session can't hide from the app. A sign-in flow has
  // no session to assert yet, so it must never carry one.
  const token = getAuthToken();
  if (token && !isAuthEndpoint(config.url)) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean };

// Concurrent 401s share one refresh rather than each starting their own —
// a stampede would race to rotate the same refresh token, and only the first
// rotation can succeed.
let refreshInFlight: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config) {
      const config = error.config as RetriableConfig;

      if (!config._retriedAfterRefresh && !isAuthEndpoint(config.url)) {
        config._retriedAfterRefresh = true;
        refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });

        const newToken = await refreshInFlight;
        if (newToken) {
          config.headers.set('Authorization', `Bearer ${newToken}`);
          return apiClient.request(config);
        }
      }
    }

    return Promise.reject(toApiError(error));
  },
);
