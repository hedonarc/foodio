import { z } from 'zod';

export const menuItemSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  menuCategoryId: z.string(),
  name: z.string(),
  description: z.string(),
  /** Minor units. The current asking price, not what anyone paid — docs/adr/0002. */
  priceMinor: z.number().int(),
  image: z.string(),
  rating: z.number().optional(),
  isPopular: z.boolean().optional(),
});

export const menuCategorySchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  position: z.number().int(),
  menuItems: z.array(menuItemSchema),
});

/** `GET /restaurants/:id/menu` */
export const restaurantMenuSchema = z.array(menuCategorySchema);

export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type RestaurantMenu = z.infer<typeof restaurantMenuSchema>;
