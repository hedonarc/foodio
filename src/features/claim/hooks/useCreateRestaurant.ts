import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { useSessionStore } from '@/stores/session.store';

import { createRestaurant } from '../api/claim.api';

/**
 * Claiming a restaurant, and becoming its Owner in the same breath.
 *
 * The server grants the creator every capability (ADR-0013), but entitlements
 * are resolved per request (ADR-0007) — so the app does not know about them
 * until it asks. `refreshPerson` is what makes the new Kitchen role exist as
 * far as the switcher is concerned, and it must land before the role is set.
 */
export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  const refreshPerson = useSessionStore((state) => state.refreshPerson);
  const setRole = useSessionStore((state) => state.setRole);

  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: async (restaurant) => {
      queryClient.setQueryData(queryKeys.restaurants.detail(restaurant.id), restaurant);
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });

      await refreshPerson();
      await setRole({ kind: 'kitchen', restaurantId: restaurant.id });
    },
  });
}
