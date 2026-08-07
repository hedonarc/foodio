import type { ZodType } from 'zod';

import { parseResponse } from './parse';

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

/**
 * A next-page cursor lives in a response header (`X-Next-Cursor`), not the
 * body — the body is the same bare array these endpoints always returned.
 * Absent or non-string header means the current page is the last one; the
 * cursor itself is opaque and only ever carried forward, never inspected.
 */
export function parsePage<T>(
  schema: ZodType<T[]>,
  data: unknown,
  nextCursorHeader: unknown,
  endpoint: string,
): Page<T> {
  const items = parseResponse(schema, data, endpoint);
  const nextCursor =
    typeof nextCursorHeader === 'string' && nextCursorHeader.length > 0 ? nextCursorHeader : null;
  return { items, nextCursor };
}
