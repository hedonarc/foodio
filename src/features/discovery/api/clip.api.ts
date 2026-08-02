import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Clip } from '../types/clip.types';
import { clipListSchema } from '../types/clip.types';

export async function fetchClips(): Promise<Clip[]> {
  const { data } = await apiClient.get<unknown>('/clips?_sort=postedAt&_order=desc');
  return parseResponse(clipListSchema, data, 'GET /clips');
}
