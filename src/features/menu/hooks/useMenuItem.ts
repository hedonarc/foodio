import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchMenuItem } from '../api/menu.api';

export function useMenuItem(menuItemId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.menuItems.detail(menuItemId ?? ''),
    queryFn: menuItemId ? () => fetchMenuItem(menuItemId) : skipToken,
  });
}
