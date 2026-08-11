// features/dashboard/admin/hooks/use-dashboard-summary.ts

import { useQuery } from "@tanstack/react-query";

import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/features/dashboard/admin/api/dashboard-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useDashboardSummary(date: string) {
  return useQuery<DashboardSummary, Error>({
    queryKey: ["dashboard", "summary", date] as const,

    queryFn: async () => {
      try {
        return await getDashboardSummary(date);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load today's summary.",
        );
      }
    },

    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
