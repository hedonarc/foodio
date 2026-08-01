import type { ZodType } from 'zod';

import { ApiError } from './errors';

/**
 * Validate a response against the contract we expect.
 *
 * The mock API is a JSON file with nothing enforcing its shape, and a real
 * backend can drift too. Parsing at the boundary means a mismatch surfaces
 * here — naming the endpoint — instead of as an `undefined` deep inside a
 * component several screens later.
 */
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
