import type { Restaurant, RestaurantSummary } from '@/features/restaurants';

export type LiveState = 'onboarding' | 'active' | 'suspended';

/** `undefined` while the subscription is still loading — see `blockerFor`. */
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled';

export type Blocker = 'no-dishes' | 'unpaid';

/**
 * What stops this restaurant opening, or nothing.
 *
 * Two bars, and exactly two. Opening hours are still deliberately not one of
 * them: t2 kept them off because a rule that applied at publication but not
 * afterwards would be an asymmetry pretending to be a standard.
 *
 * The second bar arrived on purpose, not by drift. An unpaid subscription
 * refuses **reopening only** — a restaurant already open stays open, and
 * ordering is never blocked at any point on the dunning ramp. That is the sharp
 * end of ADR-0017, placed where the restaurant is already in the product rather
 * than in a customer's checkout.
 *
 * The dish comes first when both are unmet: it is the one they can fix without
 * spending anything.
 *
 * Both rules are the server's; this exists to explain a refusal before it
 * happens, never to invent one.
 */
export function blockerFor(
  dishCount: number,
  subscription: SubscriptionStatus | undefined,
): Blocker | null {
  if (dishCount === 0) return 'no-dishes';
  // `undefined` means we have not heard yet. Claiming they cannot open would be
  // a guess, and the server refuses anyway if we are wrong.
  return subscription === 'past_due' ? 'unpaid' : null;
}

/**
 * An active restaurant with no opening hours is listed and permanently Closed.
 *
 * t2 accepted that cost on the explicit condition that the app would steer
 * rather than the API refuse — this is that steer. It is a warning, never a
 * block: an empty week legitimately means "shut until further notice".
 */
export const looksShutToCustomers = (
  restaurant: Pick<Restaurant, 'status' | 'openingHours'>,
): boolean => restaurant.status === 'active' && restaurant.openingHours.length === 0;

/** Whether the restaurant may change its own status at all. Suspension is Foodio's lever. */
export const canChangeStatus = (status: RestaurantSummary['status']): boolean =>
  status !== 'suspended';
