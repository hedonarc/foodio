import axios from 'axios';

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

/** Every rejection leaving this client is an ApiError. */
export const apiClient = axios.create({
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

// Per request, not at import: throwing during module evaluation killed the app
// before it could render the error state explaining why.
apiClient.interceptors.request.use((config) => {
  const baseURL = resolveApiUrl();
  if (!baseURL) throw new ApiError('config', API_URL_HELP);

  config.baseURL = baseURL;

  // Identity travels here and nowhere else: no call site puts a person in a
  // URL, so the server stays the authority on who is asking. See issue #55.
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
