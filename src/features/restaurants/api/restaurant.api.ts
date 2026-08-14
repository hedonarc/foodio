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

export type RestaurantPhotoChange = {
  restaurantId: string;
  /** The public URL an upload returned. `''` clears the photograph. */
  image: string;
};

/** Saves an already-uploaded photograph onto the restaurant. The bytes are in storage. */
export async function setRestaurantPhoto({
  restaurantId,
  image,
}: RestaurantPhotoChange): Promise<Restaurant> {
  const endpoint = `/restaurants/${restaurantId}`;
  const { data } = await apiClient.patch<unknown>(endpoint, { image });
  return parseResponse(restaurantSchema, data, `PATCH ${endpoint}`);
}
