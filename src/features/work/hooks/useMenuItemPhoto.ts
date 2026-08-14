import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { setMenuItemPhoto } from '@/features/menu/api/menu.api';
import type { MenuItem, RestaurantMenu } from '@/features/menu/types/menu.types';

const replaceItem = (menu: RestaurantMenu, item: MenuItem) =>
  menu.map((category) => ({
    ...category,
    menuItems: category.menuItems.map((entry) => (entry.id === item.id ? item : entry)),
  }));

/**
 * Saves an already-uploaded photograph onto a dish.
 *
 * Not optimistic, unlike the sold-out switch beside it. The bytes have already
 * travelled and the owner is watching for the picture to appear, so a moment of
 * honest waiting beats a picture that shows and then vanishes.
 */
export function useMenuItemPhoto(restaurantId: string) {
  const queryClient = useQueryClient();
  const menuKey = queryKeys.restaurants.menu(restaurantId);

  return useMutation({
    mutationFn: setMenuItemPhoto,
    onSuccess: (item) => {
      queryClient.setQueryData<RestaurantMenu>(menuKey, (menu) =>
        menu ? replaceItem(menu, item) : menu,
      );
      queryClient.setQueryData(queryKeys.menuItems.detail(item.id), item);
    },
  });
}
