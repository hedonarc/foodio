import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import type { Coordinates } from '@/utils/distance';

import { fetchRestaurants } from '../api/restaurant.api';

export function useRestaurants(query?: string, coordinates?: Coordinates) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(query, coordinates),
    queryFn: () => fetchRestaurants(query, coordinates),
    placeholderData: (previous) => previous,
  });
}
