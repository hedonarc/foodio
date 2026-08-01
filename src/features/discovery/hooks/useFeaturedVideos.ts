import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchFeaturedVideos } from '../api/featuredVideo.api';

export function useFeaturedVideos() {
  return useQuery({
    queryKey: queryKeys.featuredVideos.list(),
    queryFn: fetchFeaturedVideos,
  });
}
