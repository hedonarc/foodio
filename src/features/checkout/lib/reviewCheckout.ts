import type { CartLine, CartRestaurant } from '@/features/cart';
import type { MenuItem } from '@/features/menu';
import type { Restaurant } from '@/features/restaurants';
import type { Coordinates } from '@/utils/distance';
import { distanceBetween } from '@/utils/distance';
import { isOpenAt } from '@/utils/openingHours';

import type { DeliveryAddress } from '../types/address.types';

export type RepricedLine = {
  lineId: string;
  name: string;
  wasMinor: number;
  nowMinor: number;
};

export type CheckoutBlocker =
  | { kind: 'empty-cart' }
  | { kind: 'restaurant-unavailable' }
  | { kind: 'restaurant-closed' }
  | { kind: 'no-address' }
  | { kind: 'out-of-range'; distanceMeters: number; radiusMeters: number }
  | { kind: 'price-changed'; lines: RepricedLine[] };

export type CheckoutReview = {
  blockers: CheckoutBlocker[];
  canPlaceOrder: boolean;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
};

export type CheckoutInput = {
  cartRestaurant: CartRestaurant | null;
  lines: readonly CartLine[];
  restaurant: Restaurant | undefined;
  address: DeliveryAddress | null;
  currentPrices: readonly Pick<MenuItem, 'id' | 'priceMinor'>[];
  now: Date;
};

function repricedLines(
  lines: readonly CartLine[],
  currentPrices: readonly Pick<MenuItem, 'id' | 'priceMinor'>[],
): RepricedLine[] {
  const priceById = new Map(currentPrices.map((item) => [item.id, item.priceMinor]));

  return lines.flatMap((line) => {
    const nowMinor = priceById.get(line.menuItemId);
    if (nowMinor === undefined || nowMinor === line.unitPriceMinor) return [];

    return [{ lineId: line.id, name: line.name, wasMinor: line.unitPriceMinor, nowMinor }];
  });
}

/**
 * Every reason this cart cannot be ordered, and what it would cost if it could.
 *
 * Pure, so the rules are testable without a screen and cannot drift between the
 * checkout button and the screen explaining why it is disabled.
 */
export function reviewCheckout(input: CheckoutInput): CheckoutReview {
  const { cartRestaurant, lines, restaurant, address, currentPrices, now } = input;

  const subtotalMinor = lines.reduce(
    (total, line) => total + line.unitPriceMinor * line.quantity,
    0,
  );
  const deliveryFeeMinor = lines.length === 0 ? 0 : (cartRestaurant?.deliveryFeeMinor ?? 0);

  const blockers: CheckoutBlocker[] = [];

  if (lines.length === 0) blockers.push({ kind: 'empty-cart' });

  if (!restaurant) {
    blockers.push({ kind: 'restaurant-unavailable' });
  } else if (!isOpenAt(restaurant.openingHours, now, restaurant.timezone)) {
    blockers.push({ kind: 'restaurant-closed' });
  }

  if (!address) {
    blockers.push({ kind: 'no-address' });
  } else if (restaurant) {
    const outOfRange = deliverabilityBlocker(address, restaurant);
    if (outOfRange) blockers.push(outOfRange);
  }

  const reprices = repricedLines(lines, currentPrices);
  if (reprices.length > 0) blockers.push({ kind: 'price-changed', lines: reprices });

  return {
    blockers,
    canPlaceOrder: blockers.length === 0,
    subtotalMinor,
    deliveryFeeMinor,
    totalMinor: subtotalMinor + deliveryFeeMinor,
  };
}

const restaurantCoordinates = (restaurant: Restaurant): Coordinates => ({
  latitude: restaurant.latitude,
  longitude: restaurant.longitude,
});

/**
 * Prefers the server's answer (`isDeliverable`/`distanceMeters`, sent when the
 * list request carried coordinates) over the client's own Haversine estimate.
 * Falls back to the client computation only when the server did not weigh in.
 */
function deliverabilityBlocker(
  address: DeliveryAddress,
  restaurant: Restaurant,
): CheckoutBlocker | null {
  if (restaurant.isDeliverable !== undefined) {
    if (restaurant.isDeliverable) return null;

    // distanceMeters travels alongside isDeliverable in practice; this
    // fallback only guards against a server sending one without the other.
    const distanceMeters = Math.round(restaurant.distanceMeters ?? restaurant.deliveryRadiusMeters);
    return { kind: 'out-of-range', distanceMeters, radiusMeters: restaurant.deliveryRadiusMeters };
  }

  const distanceMeters = Math.round(distanceBetween(address, restaurantCoordinates(restaurant)));
  if (distanceMeters <= restaurant.deliveryRadiusMeters) return null;

  return { kind: 'out-of-range', distanceMeters, radiusMeters: restaurant.deliveryRadiusMeters };
}
