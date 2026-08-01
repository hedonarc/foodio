import axios from 'axios';

import { API_URL_HELP, resolveApiUrl } from '@/config/env';

import { ApiError, toApiError } from './errors';

/**
 * The single Axios instance for the app. Nothing outside `src/api` should
 * import axios directly — see AGENTS.md.
 *
 * Every rejection leaving this client is an ApiError, so callers never have to
 * know what an AxiosError looks like.
 */
export const apiClient = axios.create({
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

/**
 * The base URL is resolved per request rather than at import time. Resolving it
 * eagerly meant a misconfigured build threw while modules were still loading,
 * which crashed the app before it could render anything — including the error
 * state that would have explained why.
 */
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
