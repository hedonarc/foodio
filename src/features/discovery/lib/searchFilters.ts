import type { RestaurantSummary } from '@/features/restaurants';

export type SortKey = 'nearest' | 'rating' | 'fastest' | 'cheapest';
export type Toggle = 'freeDelivery' | 'topRated' | 'under30' | 'deliversHere';

export type SearchFilters = {
  cuisines: string[];
  toggles: Toggle[];
  sort: SortKey;
};

export const EMPTY_FILTERS: SearchFilters = { cuisines: [], toggles: [], sort: 'nearest' };

export const TOGGLES: readonly Toggle[] = ['freeDelivery', 'topRated', 'under30', 'deliversHere'];
export const SORTS: readonly SortKey[] = ['nearest', 'rating', 'fastest', 'cheapest'];

const TOP_RATED_FLOOR = 4;
const UNDER_30_MINUTES = 30;

const passes = (restaurant: RestaurantSummary, toggle: Toggle): boolean => {
  switch (toggle) {
    case 'freeDelivery':
      return restaurant.deliveryFeeMinor === 0;
    case 'topRated':
      return restaurant.rating >= TOP_RATED_FLOOR;
    case 'under30':
      return restaurant.deliveryEstimate.maxMinutes <= UNDER_30_MINUTES;
    case 'deliversHere':
      // Unknown is not a no: the list request only carries a distance when it carried an address.
      return restaurant.isDeliverable !== false;
  }
};

const compare =
  (sort: SortKey) =>
  (a: RestaurantSummary, b: RestaurantSummary): number => {
    switch (sort) {
      case 'nearest':
        return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
      case 'rating':
        return b.rating - a.rating;
      case 'fastest':
        return a.deliveryEstimate.maxMinutes - b.deliveryEstimate.maxMinutes;
      case 'cheapest':
        return a.deliveryFeeMinor - b.deliveryFeeMinor;
    }
  };

/**
 * Narrows and orders on the device. The server answers `q` against the
 * Restaurant's name only, so a cuisine chip and every toggle are applied here,
 * to whatever it sent — and the result is a new array, never the cache's.
 */
export function applyFilters(
  restaurants: readonly RestaurantSummary[],
  filters: SearchFilters,
): RestaurantSummary[] {
  const kept = restaurants.filter(
    (restaurant) =>
      (filters.cuisines.length === 0 ||
        restaurant.cuisines.some((cuisine) => filters.cuisines.includes(cuisine))) &&
      filters.toggles.every((toggle) => passes(restaurant, toggle)),
  );
  return [...kept].sort(compare(filters.sort));
}

export function toggleIn<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}
