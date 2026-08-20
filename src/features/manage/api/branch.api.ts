import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import type { Restaurant } from '@/features/restaurants';
import { restaurantSchema } from '@/features/restaurants';

export type NewBranch = {
  /** Optional: a Branch usually shares its parent's name, so this is the exception. */
  name?: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryRadiusMeters: number;
};

/**
 * Another location for the Chain this Restaurant already belongs to. It joins
 * the same subscription — no second invoice — and inherits the parent's menu.
 */
export async function createBranch(restaurantId: string, body: NewBranch): Promise<Restaurant> {
  const endpoint = `/restaurants/${restaurantId}/branches`;
  const { data } = await apiClient.post<unknown>(endpoint, body);
  return parseResponse(restaurantSchema, data, `POST ${endpoint}`);
}
