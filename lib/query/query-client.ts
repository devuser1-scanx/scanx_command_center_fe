// lib/query/query-client.ts

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Data remains fresh for 30 seconds.
         *
         * During this period, TanStack Query will reuse the cached value
         * instead of immediately calling the backend again.
         */
        staleTime: 30 * 1000,

        /**
         * Keep unused cached data for five minutes.
         *
         * In TanStack Query v5, this option is called gcTime.
         */
        gcTime: 5 * 60 * 1000,

        /**
         * Retry normal queries only once.
         *
         * We do not want the UI repeatedly calling the backend when the
         * backend is unavailable or the user is unauthorized.
         */
        retry: 1,

        /**
         * Do not automatically refetch every query whenever the browser
         * tab becomes active.
         *
         * We can enable this later for specific dashboard queries.
         */
        refetchOnWindowFocus: false,

        /**
         * Do not refetch automatically merely because a component mounts
         * while its cached data is still fresh.
         */
        refetchOnMount: true,

        /**
         * Refetch when the internet reconnects.
         */
        refetchOnReconnect: true,
      },

      mutations: {
        /**
         * Mutations include login, logout, password changes, user creation,
         * user updates, and similar write operations.
         *
         * Retrying these automatically can accidentally submit the same
         * operation multiple times, so retries are disabled.
         */
        retry: false,
      },
    },
  });
}