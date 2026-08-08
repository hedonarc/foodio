import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { setMenuItemAvailability } from '@/features/menu/api/menu.api';
import type { MenuItem, RestaurantMenu } from '@/features/menu/types/menu.types';

const replaceItem = (menu: RestaurantMenu, itemId: string, patch: Partial<MenuItem>) =>
  menu.map((category) => ({
    ...category,
    menuItems: category.menuItems.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    ),
  }));

/**
 * The toggle behind the kitchen's menu surface. Optimistic against the same
 * cache the customer menu reads — one truth, so a flip here invalidates
 * nothing twice.
 */
export function useMenuAvailability(restaurantId: string) {
  const queryClient = useQueryClient();
  const menuKey = queryKeys.restaurants.menu(restaurantId);

  return useMutation({
    mutationFn: setMenuItemAvailability,
    // The switch moves with the thumb — kitchen wifi never holds it hostage.
    onMutate: async ({ itemId, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: menuKey });
      const previous = queryClient.getQueryData<RestaurantMenu>(menuKey);
      queryClient.setQueryData<RestaurantMenu>(menuKey, (menu) =>
        menu ? replaceItem(menu, itemId, { isAvailable }) : menu,
      );
      return { previous };
    },
    // The response is the truth; write it through the shared caches.
    onSuccess: (item) => {
      queryClient.setQueryData<RestaurantMenu>(menuKey, (menu) =>
        menu ? replaceItem(menu, item.id, item) : menu,
      );
      queryClient.setQueryData(queryKeys.menuItems.detail(item.id), item);
    },
    // Snap back visibly. The screen owns the toast that says why.
    onError: (_error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(menuKey, context.previous);
    },
  });
}
