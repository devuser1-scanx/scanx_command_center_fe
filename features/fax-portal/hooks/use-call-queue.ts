// features/fax-portal/hooks/use-call-queue.ts

import { useQuery } from "@tanstack/react-query";

import { getCallQueue } from "@/features/fax-portal/api/fax-portal-api";
import { FAX_PORTAL_POLL_MS } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import type { CallQueue } from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

export const callQueueQueryKey = ["fax-portal", "call-queue"] as const;

/**
 * The signed-in user's call queue, in the order to call them. Polled at the
 * same pace as the board and the sidebar badge, so they agree.
 */
export function useCallQueue(enabled = true) {
  return useQuery<CallQueue, Error>({
    queryKey: callQueueQueryKey,
    enabled,

    queryFn: async () => {
      try {
        return await getCallQueue();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load your call queue.");
      }
    },

    refetchInterval: FAX_PORTAL_POLL_MS,
    staleTime: 0,
  });
}
