import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Subscription } from '../types/subscription.types';
import { subscriptionSchema } from '../types/subscription.types';

/**
 * Staff-scoped on the server, which is the point: whether a restaurant is
 * behind on its bills is commercially sensitive, so it is read from here rather
 * than served on the restaurant payload every customer sees.
 */
export async function fetchSubscription(restaurantId: string): Promise<Subscription> {
  const endpoint = `/restaurants/${restaurantId}/subscription`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(subscriptionSchema, data, `GET ${endpoint}`);
}
