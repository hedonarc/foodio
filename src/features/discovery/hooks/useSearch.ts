import { useMemo, useState } from 'react';

import { useActiveAddress } from '@/features/checkout/hooks/useActiveAddress';
import { useRestaurants } from '@/features/restaurants';
import { useDebounce } from '@/hooks/useDebounce';

import { categoriesFrom } from '../lib/categories';
import type { SearchFilters } from '../lib/searchFilters';
import { applyFilters, EMPTY_FILTERS } from '../lib/searchFilters';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The typed text, the server's answer to it, and the on-device narrowing.
 *
 * Two list queries: the unsearched one is the request Home already made, so it
 * is a cache read that keeps the cuisine chips and the browse state populated
 * while the searched one is in flight.
 */
export function useSearch(initialCuisine?: string) {
  const [text, setText] = useState('');
  const query = useDebounce(text.trim(), SEARCH_DEBOUNCE_MS);
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...EMPTY_FILTERS,
    cuisines: initialCuisine ? [initialCuisine] : [],
  }));

  const { address } = useActiveAddress();
  const coordinates = address
    ? { latitude: address.latitude, longitude: address.longitude }
    : undefined;

  const everything = useRestaurants(undefined, coordinates);
  const searched = useRestaurants(query || undefined, coordinates);
  const active = query ? searched : everything;

  const results = useMemo(() => applyFilters(active.data ?? [], filters), [active.data, filters]);
  const categories = useMemo(() => categoriesFrom(everything.data ?? []), [everything.data]);

  // Sort on its own narrows nothing, so it does not end browsing.
  const isBrowsing = !query && filters.cuisines.length === 0 && filters.toggles.length === 0;

  return {
    text,
    setText,
    filters,
    setFilters,
    results,
    categories,
    isBrowsing,
    isPending: active.isPending,
    error: active.error,
    refetch: active.refetch,
  };
}
