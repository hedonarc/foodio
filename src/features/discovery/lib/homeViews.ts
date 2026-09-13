import type { RestaurantSummary } from '@/features/restaurants';

import type { SearchFilters } from './searchFilters';
import { applyFilters, EMPTY_FILTERS } from './searchFilters';

/**
 * A view is one way of looking at the whole list — a sort, or a single
 * filter — never a combination. Combining is what the search screen is for;
 * Home is for browsing, and a view is one tap that needs no badge, no sheet
 * and no second rail above the first Restaurant. Chosen with the founder from three mockups: #190.
 */
export const HOME_VIEWS = ['all', 'fast', 'free', 'rated'] as const;
export type HomeView = (typeof HOME_VIEWS)[number];

const FILTERS_BY_VIEW: Record<HomeView, SearchFilters> = {
  all: EMPTY_FILTERS,
  fast: { cuisines: [], toggles: ['under30'], sort: 'fastest' },
  free: { cuisines: [], toggles: ['freeDelivery'], sort: 'nearest' },
  // A sort, not a floor: with every Restaurant in the pilot still "New", a
  // 4.0+ floor would empty the tab on day one.
  rated: { cuisines: [], toggles: [], sort: 'rating' },
};

export function applyView(
  restaurants: readonly RestaurantSummary[],
  view: HomeView,
): RestaurantSummary[] {
  return applyFilters(restaurants, FILTERS_BY_VIEW[view]);
}
