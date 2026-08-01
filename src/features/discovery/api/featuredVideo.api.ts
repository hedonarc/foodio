import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { FeaturedVideo } from '../types/featuredVideo.types';
import { featuredVideoListSchema } from '../types/featuredVideo.types';

export async function fetchFeaturedVideos(): Promise<FeaturedVideo[]> {
  const { data } = await apiClient.get<unknown>('/featuredVideos');
  return parseResponse(featuredVideoListSchema, data, 'GET /featuredVideos');
}
