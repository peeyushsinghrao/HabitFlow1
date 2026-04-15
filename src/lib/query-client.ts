import { QueryClient } from '@tanstack/react-query';

// Singleton QueryClient shared between provider (React tree) and Zustand stores
// Zustand stores call queryClient.fetchQuery() to get cache-first reads,
// and queryClient.invalidateQueries() after mutations.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,           // 30 s — fresh data, no refetch during this window
      gcTime: 5 * 60 * 1000,          // 5 min — evict from cache after inactivity
      retry: 1,
      refetchOnWindowFocus: false,    // Don't silently refetch when the user alt-tabs
      refetchOnReconnect: false,
    },
  },
});

// ── Per-endpoint stale times ──────────────────────────────────────────────────
// Passed explicitly to fetchQuery so heavy queries age out more slowly.
export const STALE = {
  habits:      30 * 1000,      // 30 s — invalidated after every toggle/add/delete
  stats:       60 * 1000,      // 60 s — invalidated after every toggle/add/delete
  analytics:   5 * 60 * 1000, // 5 min — expensive Prisma aggregation, rarely changes
  profile:    10 * 60 * 1000, // 10 min — almost never changes mid-session
  mood:        2 * 60 * 1000, // 2 min — user may log a mood and revisit soon
  mission:     5 * 60 * 1000, // 5 min
  coins:       2 * 60 * 1000, // 2 min
  pwDaily:     60 * 1000,     // 60 s
  pwClasses:   60 * 1000,     // 60 s
  pwTodos:     60 * 1000,     // 60 s
  pwAnalytics: 5 * 60 * 1000, // 5 min
} as const;

// ── Per-endpoint gc times ─────────────────────────────────────────────────────
export const GC = {
  habits:      5 * 60 * 1000,
  stats:       5 * 60 * 1000,
  analytics:  10 * 60 * 1000,
  profile:    30 * 60 * 1000,
  mood:        5 * 60 * 1000,
  mission:    10 * 60 * 1000,
  coins:       5 * 60 * 1000,
  pwDaily:     5 * 60 * 1000,
  pwClasses:   5 * 60 * 1000,
  pwTodos:     5 * 60 * 1000,
  pwAnalytics:10 * 60 * 1000,
} as const;
