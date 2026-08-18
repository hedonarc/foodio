import { z } from 'zod';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

export const codePreviewSchema = z.object({
  restaurantName: z.string(),
  capability: z.enum(['kitchen', 'delivery']),
});

export type CodePreview = z.infer<typeof codePreviewSchema>;

/** Says what a code is for without spending it, so the joiner sees what they are accepting. */
export async function previewJoinCode(code: string): Promise<CodePreview> {
  const endpoint = `/join-codes/${code}/preview`;
  const { data } = await apiClient.post<unknown>(endpoint);
  return parseResponse(codePreviewSchema, data, `POST ${endpoint}`);
}

export async function redeemJoinCode(code: string): Promise<CodePreview> {
  const endpoint = `/join-codes/${code}/redeem`;
  const { data } = await apiClient.post<unknown>(endpoint);
  return parseResponse(codePreviewSchema, data, `POST ${endpoint}`);
}
