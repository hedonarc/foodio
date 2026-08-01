import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchRestaurant } from '../api/restaurant.api';

/** `skipToken` keeps the query idle until the route param arrives. */
export function useRestaurant(restaurantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(restaurantId ?? ''),
    queryFn: restaurantId ? () => fetchRestaurant(restaurantId) : skipToken,
  });
}
