import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchClips } from '../api/clip.api';

export function useClips() {
  return useQuery({
    queryKey: queryKeys.clips.list(),
    queryFn: fetchClips,
  });
}
