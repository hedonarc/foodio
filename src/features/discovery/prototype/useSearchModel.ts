// PROTOTYPE — not production. See HomePrototype.tsx.
import { useMemo, useState } from 'react';

import { useActiveAddress } from '@/features/checkout/hooks/useActiveAddress';
import { useRestaurants } from '@/features/restaurants';
import { useDebounce } from '@/hooks/useDebounce';

import { categoriesFrom } from './categories';
import type { SearchFilters } from './filters';
import { applyFilters, EMPTY_FILTERS } from './filters';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * What every variant needs and none of them should lay out: the typed text,
 * the server's answer to it, the on-device narrowing, and a few remembered
 * searches. Recents live in memory — persistence is not the question here.
 */
export function useSearchModel() {
  const [text, setText] = useState('');
  const query = useDebounce(text.trim(), SEARCH_DEBOUNCE_MS);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [recents, setRecents] = useState<string[]>(['biryani', 'sushi', 'coffee']);

  const { address } = useActiveAddress();
  const coordinates = address
    ? { latitude: address.latitude, longitude: address.longitude }
    : undefined;

  // The unsearched list is the same request Home already made — cache, not a second round trip.
  const everything = useRestaurants(undefined, coordinates);
  const searched = useRestaurants(query || undefined, coordinates);

  const results = useMemo(
    () => applyFilters((query ? searched.data : everything.data) ?? [], filters),
    [query, searched.data, everything.data, filters],
  );
  const categories = useMemo(() => categoriesFrom(everything.data ?? []), [everything.data]);

  const remember = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecents((previous) => [clean, ...previous.filter((t) => t !== clean)].slice(0, 5));
  };

  const reset = () => {
    setText('');
    setFilters(EMPTY_FILTERS);
  };

  return {
    text,
    setText,
    query,
    filters,
    setFilters,
    results,
    categories,
    recents,
    remember,
    reset,
    isPending: query ? searched.isPending : everything.isPending,
  };
}

export type SearchModel = ReturnType<typeof useSearchModel>;
