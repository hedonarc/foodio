import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { RestaurantMenu } from '../types/menu.types';
import { restaurantMenuSchema } from '../types/menu.types';

export async function fetchRestaurantMenu(restaurantId: string): Promise<RestaurantMenu> {
  const endpoint = `/restaurants/${restaurantId}/menu`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(restaurantMenuSchema, data, `GET ${endpoint}`);
}
