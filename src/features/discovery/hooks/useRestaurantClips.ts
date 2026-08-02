import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchClipsByRestaurant } from '../api/clip.api';

export function useRestaurantClips(restaurantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clips.byRestaurant(restaurantId ?? ''),
    queryFn: restaurantId ? () => fetchClipsByRestaurant(restaurantId) : skipToken,
  });
}
