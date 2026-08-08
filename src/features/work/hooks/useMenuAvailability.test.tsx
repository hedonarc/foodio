import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { queryKeys } from '@/constants/queryKeys';
import { setMenuItemAvailability } from '@/features/menu/api/menu.api';
import type { MenuItem, RestaurantMenu } from '@/features/menu/types/menu.types';

import { useMenuAvailability } from './useMenuAvailability';

jest.mock('@/features/menu/api/menu.api', () => ({
  setMenuItemAvailability: jest.fn(),
}));

const mockSetAvailability = jest.mocked(setMenuItemAvailability);

const item = (id: string, isAvailable?: boolean): MenuItem => ({
  id,
  restaurantId: 'rest-1',
  menuCategoryId: 'cat-1',
  name: id,
  description: '',
  priceMinor: 500,
  image: 'https://example.com/dish.jpg',
  ...(isAvailable === undefined ? {} : { isAvailable }),
});

const menuKey = queryKeys.restaurants.menu('rest-1');

function setup(items: MenuItem[]) {
  // Infinite gcTime: a scheduled gc timer would keep the jest worker alive.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const menu: RestaurantMenu = [
    { id: 'cat-1', restaurantId: 'rest-1', name: 'Mains', position: 0, menuItems: items },
  ];
  queryClient.setQueryData<RestaurantMenu>(menuKey, menu);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const itemsInCache = () =>
    queryClient.getQueryData<RestaurantMenu>(menuKey)?.[0]?.menuItems ?? [];

  return { queryClient, wrapper, itemsInCache };
}

describe('useMenuAvailability', () => {
  it('flips the item in the shared menu cache before the PATCH settles', async () => {
    const { wrapper, itemsInCache } = setup([item('dish-1'), item('dish-2')]);
    mockSetAvailability.mockImplementation(() => new Promise(() => {}));

    const { result } = await renderHook(() => useMenuAvailability('rest-1'), { wrapper });
    result.current.mutate({ restaurantId: 'rest-1', itemId: 'dish-1', isAvailable: false });

    await waitFor(() => expect(itemsInCache()[0]?.isAvailable).toBe(false));
    expect(itemsInCache()[1]?.isAvailable).toBeUndefined();
  });

  it('rolls the cache back when the PATCH fails', async () => {
    const { wrapper, itemsInCache } = setup([item('dish-1', true)]);
    mockSetAvailability.mockRejectedValue(new Error('You do not work here.'));

    const { result } = await renderHook(() => useMenuAvailability('rest-1'), { wrapper });
    result.current.mutate({ restaurantId: 'rest-1', itemId: 'dish-1', isAvailable: false });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(itemsInCache()[0]?.isAvailable).toBe(true);
  });

  it('writes the server response through the menu and item-detail caches', async () => {
    const { queryClient, wrapper, itemsInCache } = setup([item('dish-1', true)]);
    // The response, not the optimistic guess, is what lands in the cache.
    const fromServer = { ...item('dish-1', false), priceMinor: 999 };
    mockSetAvailability.mockResolvedValue(fromServer);

    const { result } = await renderHook(() => useMenuAvailability('rest-1'), { wrapper });
    result.current.mutate({ restaurantId: 'rest-1', itemId: 'dish-1', isAvailable: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(itemsInCache()[0]).toEqual(fromServer);
    expect(queryClient.getQueryData<MenuItem>(queryKeys.menuItems.detail('dish-1'))).toEqual(
      fromServer,
    );
  });
});
