// features/fax-portal/hooks/use-fax-portal-counts.ts

import { useQuery } from "@tanstack/react-query";

import { getFaxPortalCounts } from "@/features/fax-portal/api/fax-portal-api";
import type { FaxPortalCounts } from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

/** Same cadence as the board, so sidebar badges and cards agree. */
export const FAX_PORTAL_POLL_MS = 15_000;

export const faxPortalCountsQueryKey = ["fax-portal", "counts"] as const;

/**
 * Sidebar badge counts (My Call Queue, Intake Review). Polled, and
 * invalidated after board actions.
 */
export function useFaxPortalCounts(enabled = true) {
  return useQuery<FaxPortalCounts, Error>({
    queryKey: faxPortalCountsQueryKey,
    enabled,

    queryFn: async () => {
      try {
        return await getFaxPortalCounts();
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load the FAX Portal counts.",
        );
      }
    },

    refetchInterval: FAX_PORTAL_POLL_MS,
    staleTime: 0,
  });
}
