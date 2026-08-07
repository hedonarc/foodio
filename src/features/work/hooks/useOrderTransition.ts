import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Page } from '@/api/page';
import { queryKeys } from '@/constants/queryKeys';
import type { Order } from '@/features/checkout/types/order.types';

import { transitionOrder } from '../api/workOrders.api';

type OrderPages = InfiniteData<Page<Order>, string | undefined>;

/** The PATCH response omits staff-only fields the list carries; keep them. */
const replaceOrder = (pages: OrderPages, order: Order): OrderPages => ({
  ...pages,
  pages: pages.pages.map((page) => ({
    ...page,
    items: page.items.map((item) =>
      item.id === order.id
        ? { ...order, customerPhone: order.customerPhone ?? item.customerPhone }
        : item,
    ),
  })),
});

export function useOrderTransition(restaurantId: string) {
  const queryClient = useQueryClient();
  const queueKey = queryKeys.orders.forRestaurant(restaurantId);

  return useMutation({
    mutationFn: transitionOrder,
    onSuccess: (order) => {
      queryClient.setQueryData<OrderPages>(queueKey, (pages) =>
        pages ? replaceOrder(pages, order) : pages,
      );
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
    },
    // A 409 means the order moved under the tap. Whatever failed, the queue
    // is the truth, not the tap — refetch and re-render it as it really is.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queueKey });
    },
  });
}
