// PROTOTYPE — not production. See HomePrototype.tsx.
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
export const TOGGLE_LABELS: Record<Toggle, string> = {
  freeDelivery: 'Free delivery',
  topRated: '4.0+',
  under30: 'Under 30 min',
  deliversHere: 'Delivers to you',
};

export const SORTS: readonly SortKey[] = ['nearest', 'rating', 'fastest', 'cheapest'];
export const SORT_LABELS: Record<SortKey, string> = {
  nearest: 'Nearest',
  rating: 'Top rated',
  fastest: 'Fastest',
  cheapest: 'Cheapest delivery',
};

const passes = (restaurant: RestaurantSummary, toggle: Toggle): boolean => {
  switch (toggle) {
    case 'freeDelivery':
      return restaurant.deliveryFeeMinor === 0;
    case 'topRated':
      return restaurant.rating >= 4;
    case 'under30':
      return restaurant.deliveryEstimate.maxMinutes <= 30;
    case 'deliversHere':
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

/** Everything the server sent, narrowed and ordered on the device. */
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

export const activeFilterCount = (filters: SearchFilters): number =>
  filters.cuisines.length + filters.toggles.length + (filters.sort === 'nearest' ? 0 : 1);

export function toggleIn<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}
