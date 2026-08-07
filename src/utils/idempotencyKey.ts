/**
 * Generated once when the customer forms the intent to place an order, kept
 * across a retry, and thrown away once the order is confirmed — never derived
 * from the order's own content. See backend ADR-0011.
 *
 * Uniqueness is all that matters here, not unpredictability, so this needs no
 * native crypto module — a dedup key is not a secret.
 */
export function generateIdempotencyKey(): string {
  const random = () => Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${random()}-${random()}`;
}
