import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchClipsPage } from '../api/clip.api';

export function useClips() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.clips.list(),
    queryFn: ({ pageParam }) => fetchClipsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) };
}
