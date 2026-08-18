import type { Restaurant, RestaurantSummary } from '@/features/restaurants';

export type LiveState = 'onboarding' | 'active' | 'suspended';

/**
 * What stops this restaurant opening, or nothing.
 *
 * One bar, and only one: t2 deliberately kept opening hours off it, because a
 * rule that applied at publication but not afterwards would be an asymmetry
 * pretending to be a standard. The server enforces the same single rule, so
 * this exists to explain the refusal before it happens, never to add to it.
 */
export function blockerFor(dishCount: number): 'no-dishes' | null {
  return dishCount === 0 ? 'no-dishes' : null;
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
