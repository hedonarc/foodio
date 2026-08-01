import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchRestaurantMenu } from '../api/menu.api';

export function useRestaurantMenu(restaurantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.restaurants.menu(restaurantId ?? ''),
    queryFn: restaurantId ? () => fetchRestaurantMenu(restaurantId) : skipToken,
  });
}
