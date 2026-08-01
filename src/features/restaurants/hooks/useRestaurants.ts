import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchRestaurants } from '../api/restaurant.api';

export function useRestaurants() {
  return useQuery({
    queryKey: queryKeys.restaurants.list(),
    queryFn: fetchRestaurants,
  });
}
