import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import type { Restaurant } from '@/features/restaurants';
import { restaurantSchema } from '@/features/restaurants';

export type NewRestaurant = {
  name: string;
  latitude: number;
  longitude: number;
  deliveryRadiusMeters: number;
};

export async function createRestaurant(values: NewRestaurant): Promise<Restaurant> {
  const { data } = await apiClient.post<unknown>('/restaurants', values);
  return parseResponse(restaurantSchema, data, 'POST /restaurants');
}
