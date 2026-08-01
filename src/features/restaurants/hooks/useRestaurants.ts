import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchRestaurants } from '../api/restaurant.api';

export function useRestaurants(query?: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(query),
    queryFn: () => fetchRestaurants(query),
    placeholderData: (previous) => previous,
  });
}
