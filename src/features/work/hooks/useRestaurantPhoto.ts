import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { setRestaurantPhoto } from '@/features/restaurants/api/restaurant.api';

/**
 * Saves an already-uploaded photograph onto the restaurant.
 *
 * Invalidates rather than writing through, unlike the dish equivalent: the
 * restaurant appears in the discovery list, the search results and its own
 * detail page, each under a key that includes the customer's coordinates. There
 * is no single cached copy to patch, so the honest move is to let them refetch.
 */
export function useRestaurantPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setRestaurantPhoto,
    onSuccess: (restaurant) => {
      queryClient.setQueryData(queryKeys.restaurants.detail(restaurant.id), restaurant);
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}
