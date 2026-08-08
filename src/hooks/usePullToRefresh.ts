import { useCallback, useState } from 'react';

import { type QueryKey, useQueryClient } from '@tanstack/react-query';

/**
 * Spinner state for RefreshControl over screens composed of several queries,
 * where no single hook's `isRefetching` covers the whole surface.
 */
export function usePullToRefresh(keys: readonly QueryKey[]) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all(
      keys.map((queryKey) => queryClient.refetchQueries({ queryKey, type: 'active' })),
    ).finally(() => setRefreshing(false));
  }, [keys, queryClient]);

  return { refreshing, onRefresh };
}
