import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { ApiError } from '@/api/errors';
import { setQueryClient } from '@/api/queryCache';

const MAX_RETRIES = 2;

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false;
          return failureCount < MAX_RETRIES;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  // In state so Fast Refresh cannot swap the cache mid-session.
  const [queryClient] = useState(createQueryClient);
  setQueryClient(queryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
