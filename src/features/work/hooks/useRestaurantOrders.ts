import { skipToken, useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { fetchRestaurantOrdersPage } from '@/features/checkout/api/order.api';

/**
 * The restaurant's orders, not the signed-in person's. Entitlement is checked
 * server-side from the token — this param only says which of your restaurants.
 */
export function useRestaurantOrders(restaurantId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.orders.forRestaurant(restaurantId ?? ''),
    queryFn: restaurantId
      ? ({ pageParam }: { pageParam: string | undefined }) =>
          fetchRestaurantOrdersPage(restaurantId, pageParam)
      : skipToken,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) };
}
