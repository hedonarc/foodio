import { ApiError } from '@/api/errors';

/**
 * On this endpoint a 409 means the order already has a review — the sheet is
 * only reachable from a delivered order, so the backend's other 409 (not yet
 * delivered) cannot arise from this surface. Already-reviewed is a state to
 * settle into, not an error to toast.
 */
export function isAlreadyReviewed(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
