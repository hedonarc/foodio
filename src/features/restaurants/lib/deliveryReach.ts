import type { Coordinates } from '@/utils/distance';
import { distanceBetween } from '@/utils/distance';

import type { Restaurant } from '../types/restaurant.types';

export type DeliveryReach = {
  deliverable: boolean;
  distanceMeters: number;
  radiusMeters: number;
};

type ReachableRestaurant = Pick<
  Restaurant,
  'latitude' | 'longitude' | 'deliveryRadiusMeters' | 'isDeliverable' | 'distanceMeters'
>;

/**
 * Whether this Restaurant's own Delivery Area reaches the customer's address.
 *
 * The server's answer wins when the request carried coordinates and it gave
 * one; otherwise the device measures, the same way checkout does. Nothing new
 * is asked of the server — the Restaurant's location and radius arrive with
 * the page, and the address is already on the phone.
 */
export function deliveryReach(
  address: Coordinates,
  restaurant: ReachableRestaurant,
): DeliveryReach {
  const radiusMeters = restaurant.deliveryRadiusMeters;

  if (restaurant.isDeliverable !== undefined) {
    return {
      deliverable: restaurant.isDeliverable,
      distanceMeters: Math.round(restaurant.distanceMeters ?? radiusMeters),
      radiusMeters,
    };
  }

  const distanceMeters = Math.round(
    distanceBetween(address, { latitude: restaurant.latitude, longitude: restaurant.longitude }),
  );
  return { deliverable: distanceMeters <= radiusMeters, distanceMeters, radiusMeters };
}

/** `1.4`, not `1.43`: a customer wants to know roughly how far, not to the metre. */
export const toKm = (meters: number): string => (meters / 1000).toFixed(1);
