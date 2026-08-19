import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchSubscription } from '../api/subscription.api';

/**
 * Every Restaurant has one from the moment it is claimed, so a 404 here means
 * something is wrong rather than "not subscribed" — but the going-live screen
 * treats an unknown answer as "no objection" either way, because the server
 * refuses if we guessed wrong.
 */
export function useSubscription(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.subscription.byRestaurant(restaurantId),
    queryFn: () => fetchSubscription(restaurantId),
    enabled: restaurantId !== '',
  });
}
