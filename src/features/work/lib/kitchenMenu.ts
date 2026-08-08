import type { MenuItem, RestaurantMenu } from '@/features/menu/types/menu.types';

const isSoldOut = (item: MenuItem): boolean => item.isAvailable === false;

/**
 * The working view keeps live dishes at hand: sold-out sinks to the bottom of
 * its own category, canonical order preserved within each half. This screen
 * only — the customer menu renders the shared cache untouched.
 */
export const soldOutLast = (menu: RestaurantMenu): RestaurantMenu =>
  menu.map((category) => ({
    ...category,
    menuItems: [
      ...category.menuItems.filter((item) => !isSoldOut(item)),
      ...category.menuItems.filter(isSoldOut),
    ],
  }));
