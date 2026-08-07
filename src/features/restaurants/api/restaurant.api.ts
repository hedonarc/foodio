import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import type { Coordinates } from '@/utils/distance';

import type { Restaurant, RestaurantSummary } from '../types/restaurant.types';
import { restaurantSchema, restaurantSummaryListSchema } from '../types/restaurant.types';

export async function fetchRestaurants(
  query?: string,
  coordinates?: Coordinates,
): Promise<RestaurantSummary[]> {
  const trimmed = query?.trim();
  const { data } = await apiClient.get<unknown>('/restaurants', {
    params: {
      ...(trimmed ? { q: trimmed } : {}),
      ...(coordinates ? { lat: coordinates.latitude, lng: coordinates.longitude } : {}),
    },
  });
  return parseResponse(restaurantSummaryListSchema, data, 'GET /restaurants');
}

export async function fetchRestaurant(restaurantId: string): Promise<Restaurant> {
  const { data } = await apiClient.get<unknown>(`/restaurants/${restaurantId}`);
  return parseResponse(restaurantSchema, data, `GET /restaurants/${restaurantId}`);
}
