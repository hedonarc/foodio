import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchClipsByMenuItem } from '../api/clip.api';

export function useMenuItemClips(menuItemId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clips.byMenuItem(menuItemId ?? ''),
    queryFn: menuItemId ? () => fetchClipsByMenuItem(menuItemId) : skipToken,
  });
}
