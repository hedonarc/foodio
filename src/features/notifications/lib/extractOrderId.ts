/**
 * The backend's notification payload is `{ orderId, status }`, but the
 * payload arrives as `unknown` off the notification response — malformed or
 * missing data means "nowhere to navigate", not a crash.
 */
export function extractOrderId(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  if (!('orderId' in data)) return null;

  const { orderId } = data as { orderId: unknown };
  return typeof orderId === 'string' && orderId.length > 0 ? orderId : null;
}
