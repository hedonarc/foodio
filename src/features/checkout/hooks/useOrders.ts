import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { cancelOrder, fetchOrder, fetchOrdersPage, placeOrder } from '../api/order.api';
import type { NewOrder } from '../types/order.types';
import { isTerminal } from '../types/order.types';

/** Polls while the order is live — status advances without the app asking. */
const LIVE_ORDER_POLL_MS = 5_000;

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ''),
    queryFn: orderId ? () => fetchOrder(orderId) : skipToken,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isTerminal(status) ? false : LIVE_ORDER_POLL_MS;
    },
  });
}

export function useOrders() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: ({ pageParam }) => fetchOrdersPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) };
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ order, idempotencyKey }: { order: NewOrder; idempotencyKey: string }) =>
      placeOrder(order, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
