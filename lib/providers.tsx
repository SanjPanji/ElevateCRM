'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

let queryClient: QueryClient | null = null;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const client = getQueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
