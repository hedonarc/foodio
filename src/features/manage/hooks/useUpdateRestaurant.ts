import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { queryKeys } from '@/constants/queryKeys';
import type { Restaurant } from '@/features/restaurants';
import { restaurantSchema } from '@/features/restaurants';

export type RestaurantPatch = {
  name?: string;
  description?: string;
  address?: string;
  cuisines?: string[];
  deliveryFeeMinor?: number;
  deliveryEstimate?: { minMinutes: number; maxMinutes: number };
};

async function updateRestaurant(restaurantId: string, patch: RestaurantPatch): Promise<Restaurant> {
  const endpoint = `/restaurants/${restaurantId}`;
  const { data } = await apiClient.patch<unknown>(endpoint, patch);
  return parseResponse(restaurantSchema, data, `PATCH ${endpoint}`);
}

/**
 * Editing the restaurant's own record.
 *
 * Invalidates rather than writing through, for the same reason the photograph
 * does: a restaurant appears in the discovery list, in search results and on
 * its own page, each keyed by the customer's coordinates. There is no single
 * cached copy to patch.
 */
export function useUpdateRestaurant(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: RestaurantPatch) => updateRestaurant(restaurantId, patch),
    onSuccess: (restaurant) => {
      queryClient.setQueryData(queryKeys.restaurants.detail(restaurant.id), restaurant);
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}
