import { z } from 'zod';

export const menuItemSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  menuCategoryId: z.string(),
  name: z.string(),
  description: z.string(),
  /**
   * The restaurant's current asking price, in minor units of the restaurant's
   * currency. Not what anyone paid — see docs/adr/0002.
   */
  priceMinor: z.number().int(),
  image: z.string(),
  rating: z.number().optional(),
  isPopular: z.boolean().optional(),
});

export const menuCategorySchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  /** Display order chosen by the restaurant. */
  position: z.number().int(),
  menuItems: z.array(menuItemSchema),
});

/** `GET /restaurants/:id/menu` — categories in display order, items embedded. */
export const restaurantMenuSchema = z.array(menuCategorySchema);

export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type RestaurantMenu = z.infer<typeof restaurantMenuSchema>;
