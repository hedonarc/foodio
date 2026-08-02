import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Clip } from '../types/clip.types';
import { clipListSchema } from '../types/clip.types';

export async function fetchClips(): Promise<Clip[]> {
  const { data } = await apiClient.get<unknown>('/clips?_sort=postedAt&_order=desc');
  return parseResponse(clipListSchema, data, 'GET /clips');
}

export async function fetchClipsByRestaurant(restaurantId: string): Promise<Clip[]> {
  const { data } = await apiClient.get<unknown>(
    `/clips?restaurantId=${encodeURIComponent(restaurantId)}&_sort=postedAt&_order=desc`,
  );
  return parseResponse(clipListSchema, data, 'GET /clips?restaurantId');
}

export async function fetchClipsByMenuItem(menuItemId: string): Promise<Clip[]> {
  const { data } = await apiClient.get<unknown>(
    `/clips?menuItemId=${encodeURIComponent(menuItemId)}&_sort=postedAt&_order=desc`,
  );
  return parseResponse(clipListSchema, data, 'GET /clips?menuItemId');
}
