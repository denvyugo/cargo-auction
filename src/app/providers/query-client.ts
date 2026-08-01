import { QueryClient } from '@tanstack/react-query'

/**
 * Single shared QueryClient instance.
 *
 * It lives here (rather than being created inside a React component) because
 * the router (src/app/routes/router.tsx) needs the same instance available
 * in its context at router-creation time, so that route loaders can call
 * `queryClient.ensureQueryData(...)`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
