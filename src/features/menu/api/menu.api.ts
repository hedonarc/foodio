import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { MenuItem, RestaurantMenu } from '../types/menu.types';
import { menuItemSchema, restaurantMenuSchema } from '../types/menu.types';

export async function fetchRestaurantMenu(restaurantId: string): Promise<RestaurantMenu> {
  const endpoint = `/restaurants/${restaurantId}/menu`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(restaurantMenuSchema, data, `GET ${endpoint}`);
}

export async function fetchMenuItem(menuItemId: string): Promise<MenuItem> {
  const endpoint = `/menuItems/${menuItemId}`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(menuItemSchema, data, `GET ${endpoint}`);
}

export type AvailabilityChange = {
  restaurantId: string;
  itemId: string;
  isAvailable: boolean;
};

/** "Sold out", said in one request — the backend's one-field PATCH. */
export async function setMenuItemAvailability({
  restaurantId,
  itemId,
  isAvailable,
}: AvailabilityChange): Promise<MenuItem> {
  const endpoint = `/restaurants/${restaurantId}/menu-items/${itemId}/availability`;
  const { data } = await apiClient.patch<unknown>(endpoint, { isAvailable });
  return parseResponse(menuItemSchema, data, `PATCH ${endpoint}`);
}
