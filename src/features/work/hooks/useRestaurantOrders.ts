import { skipToken, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { queryKeys } from '@/constants/queryKeys';
import { orderListSchema } from '@/features/checkout/types/order.types';

/**
 * The restaurant's orders, not the signed-in person's. Entitlement is checked
 * server-side from the token — this param only says which of your restaurants.
 */
async function fetchRestaurantOrders(restaurantId: string) {
  const endpoint = `/orders?forRestaurantId=${encodeURIComponent(restaurantId)}&_sort=placedAt&_order=desc`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(orderListSchema, data, 'GET /orders?forRestaurantId');
}

export function useRestaurantOrders(restaurantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.forRestaurant(restaurantId ?? ''),
    queryFn: restaurantId ? () => fetchRestaurantOrders(restaurantId) : skipToken,
  });
}
