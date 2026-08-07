import { skipToken, useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { fetchRestaurantOrdersPage } from '@/features/checkout/api/order.api';

import { useAppForeground } from './useAppForeground';

/**
 * Polling, not WebSocket — deferred on a measurable trigger, see #86. Kitchen
 * tablets are always foregrounded; the interval pauses when the app is not.
 */
const QUEUE_POLL_MS = 10_000;

/**
 * The restaurant's orders, not the signed-in person's. Entitlement is checked
 * server-side from the token — this param only says which of your restaurants.
 */
export function useRestaurantOrders(restaurantId: string | undefined) {
  const isForeground = useAppForeground();

  const query = useInfiniteQuery({
    queryKey: queryKeys.orders.forRestaurant(restaurantId ?? ''),
    queryFn: restaurantId
      ? ({ pageParam }: { pageParam: string | undefined }) =>
          fetchRestaurantOrdersPage(restaurantId, pageParam)
      : skipToken,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: isForeground ? QUEUE_POLL_MS : false,
  });

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) };
}
