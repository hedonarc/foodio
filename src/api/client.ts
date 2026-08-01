import axios from 'axios';

import { env } from '@/config/env';

import { toApiError } from './errors';

/**
 * The single Axios instance for the app. Nothing outside `src/api` should
 * import axios directly — see AGENTS.md.
 *
 * Every rejection leaving this client is an ApiError, so callers never have to
 * know what an AxiosError looks like.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
