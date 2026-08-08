import { apiClient } from '@/api/client';
import type { Page } from '@/api/page';
import { parsePage } from '@/api/page';
import { parseResponse } from '@/api/parse';

import type { NewReview, Review } from '../types/review.types';
import { reviewListSchema, reviewSchema } from '../types/review.types';

export async function fetchRestaurantReviewsPage(
  restaurantId: string,
  cursor?: string,
): Promise<Page<Review>> {
  const endpoint = `/restaurants/${restaurantId}/reviews`;
  const { data, headers } = await apiClient.get<unknown>(endpoint, {
    params: cursor ? { cursor } : {},
  });
  return parsePage(reviewListSchema, data, headers['x-next-cursor'], `GET ${endpoint}`);
}

export async function submitOrderReview(orderId: string, review: NewReview): Promise<Review> {
  const endpoint = `/orders/${orderId}/review`;
  const { data } = await apiClient.post<unknown>(endpoint, review);
  return parseResponse(reviewSchema, data, `POST ${endpoint}`);
}
