import { z } from 'zod';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Subscription } from '../types/subscription.types';
import { subscriptionSchema } from '../types/subscription.types';

export const planSchema = z.object({
  code: z.string(),
  name: z.string(),
  priceMinor: z.number().int(),
  currency: z.string(),
  interval: z.enum(['month', 'year']),
  /** How many locations the plan covers. One means a single shop. */
  branchLimit: z.number().int(),
});

export type Plan = z.infer<typeof planSchema>;

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await apiClient.get<unknown>('/plans');
  return parseResponse(z.array(planSchema), data, 'GET /plans');
}

export async function changePlan(restaurantId: string, planCode: string): Promise<Subscription> {
  const endpoint = `/restaurants/${restaurantId}/subscription`;
  const { data } = await apiClient.patch<unknown>(endpoint, { planCode });
  return parseResponse(subscriptionSchema, data, `PATCH ${endpoint}`);
}
