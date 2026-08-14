import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { queryKeys } from '@/constants/queryKeys';
import { openingHoursSchema } from '@/features/restaurants';
import type { OpeningHours } from '@/utils/openingHours';

const responseSchema = z.array(openingHoursSchema);

/**
 * PUT, not PATCH: the endpoint replaces the whole week rather than merging into
 * it. That is what makes "closed on Tuesday" expressible at all — a merge has
 * no way to say a day has no windows.
 */
async function replaceOpeningHours(
  restaurantId: string,
  openingHours: OpeningHours[],
): Promise<OpeningHours[]> {
  const endpoint = `/restaurants/${restaurantId}/opening-hours`;
  const { data } = await apiClient.put<unknown>(endpoint, { openingHours });
  return parseResponse(responseSchema, data, `PUT ${endpoint}`);
}

export function useReplaceOpeningHours(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (openingHours: OpeningHours[]) => replaceOpeningHours(restaurantId, openingHours),
    // Hours decide Open/Closed on every discovery surface, so none of them can
    // keep what they had.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}
