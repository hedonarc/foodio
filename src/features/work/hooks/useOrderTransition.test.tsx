import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { Page } from '@/api/page';
import { queryKeys } from '@/constants/queryKeys';
import type { Order, OrderStatus } from '@/features/checkout/types/order.types';

import { transitionOrder } from '../api/workOrders.api';

import { useOrderTransition } from './useOrderTransition';

jest.mock('../api/workOrders.api', () => ({
  transitionOrder: jest.fn(),
}));

const mockTransitionOrder = jest.mocked(transitionOrder);

const orderWith = (id: string, status: OrderStatus, customerPhone?: string): Order => ({
  id,
  restaurantId: 'rest-1',
  restaurantName: 'Taco Fiesta',
  currency: 'USD',
  status,
  placedAt: '2026-08-08T10:00:00Z',
  lines: [],
  subtotalMinor: 1000,
  deliveryFeeMinor: 100,
  totalMinor: 1100,
  address: {
    label: 'Home',
    line1: '1 Market St',
    city: 'San Francisco',
    postcode: '94103',
    latitude: 0,
    longitude: 0,
  },
  paymentMethod: 'cash_on_delivery',
  ...(customerPhone === undefined ? {} : { customerPhone }),
});

type OrderPages = InfiniteData<Page<Order>, string | undefined>;

const queueKey = queryKeys.orders.forRestaurant('rest-1');

function setup(seed: Order[]) {
  // Infinite gcTime: a scheduled gc timer would keep the jest worker alive.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const pages: OrderPages = {
    pages: [{ items: seed, nextCursor: null }],
    pageParams: [undefined],
  };
  queryClient.setQueryData<OrderPages>(queueKey, pages);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('useOrderTransition', () => {
  it('writes the transitioned order into the queue and detail caches', async () => {
    const { queryClient, wrapper } = setup([
      orderWith('o-1', 'placed'),
      orderWith('o-2', 'placed'),
    ]);
    mockTransitionOrder.mockResolvedValue(orderWith('o-1', 'accepted'));

    const { result } = await renderHook(() => useOrderTransition('rest-1'), { wrapper });
    result.current.mutate({ orderId: 'o-1', to: 'accepted' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const pages = queryClient.getQueryData<OrderPages>(queueKey);
    const statuses = pages?.pages[0]?.items.map((order) => order.status);
    expect(statuses).toEqual(['accepted', 'placed']);
    expect(queryClient.getQueryData<Order>(queryKeys.orders.detail('o-1'))?.status).toBe(
      'accepted',
    );
  });

  it('keeps the staff-only phone the PATCH response omits', async () => {
    const { queryClient, wrapper } = setup([orderWith('o-1', 'ready', '+923001230002')]);
    mockTransitionOrder.mockResolvedValue(orderWith('o-1', 'out_for_delivery'));

    const { result } = await renderHook(() => useOrderTransition('rest-1'), { wrapper });
    result.current.mutate({ orderId: 'o-1', to: 'out_for_delivery' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const pages = queryClient.getQueryData<OrderPages>(queueKey);
    expect(pages?.pages[0]?.items[0]?.customerPhone).toBe('+923001230002');
  });

  it('refetches the queue when the transition fails — the queue is the truth', async () => {
    const { queryClient, wrapper } = setup([orderWith('o-1', 'placed')]);
    mockTransitionOrder.mockRejectedValue(new Error('This order was already cancelled.'));
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useOrderTransition('rest-1'), { wrapper });
    result.current.mutate({ orderId: 'o-1', to: 'accepted' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queueKey });
    // The failure never edits the cache — the refetch renders the true state.
    const pages = queryClient.getQueryData<OrderPages>(queueKey);
    expect(pages?.pages[0]?.items[0]?.status).toBe('placed');
  });
});
