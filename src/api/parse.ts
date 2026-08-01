import type { ZodType } from 'zod';

import { ApiError } from './errors';

/** Surfaces drift here, naming the endpoint, rather than as an undefined later. */
export function parseResponse<T>(schema: ZodType<T>, data: unknown, endpoint: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const [issue] = result.error.issues;
  const path = issue?.path.join('.');
  const detail = issue ? `${path ? `${path}: ` : ''}${issue.message}` : 'unknown mismatch';

  throw new ApiError('contract', `Unexpected response from ${endpoint} (${detail})`, {
    cause: result.error,
  });
}
