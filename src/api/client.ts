import axios from 'axios';

import { API_URL_HELP, resolveApiUrl } from '@/config/env';

import { ApiError, toApiError } from './errors';

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
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
