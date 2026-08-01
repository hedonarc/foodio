import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Restaurant, RestaurantSummary } from '../types/restaurant.types';
import { restaurantSchema, restaurantSummaryListSchema } from '../types/restaurant.types';

export async function fetchRestaurants(query?: string): Promise<RestaurantSummary[]> {
  const trimmed = query?.trim();
  const { data } = await apiClient.get<unknown>('/restaurants', {
    ...(trimmed ? { params: { q: trimmed } } : {}),
  });
  return parseResponse(restaurantSummaryListSchema, data, 'GET /restaurants');
}

export async function fetchRestaurant(restaurantId: string): Promise<Restaurant> {
  const { data } = await apiClient.get<unknown>(`/restaurants/${restaurantId}`);
  return parseResponse(restaurantSchema, data, `GET /restaurants/${restaurantId}`);
}
