// features/patients/hooks/use-reschedule-link.ts

import { useQuery } from "@tanstack/react-query";

import {
  getRescheduleLink,
  type RescheduleLinkResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useRescheduleLink(appointmentId: string, enabled: boolean) {
  return useQuery<RescheduleLinkResult, Error>({
    queryKey: ["patients", "reschedule-link", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getRescheduleLink(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to generate a reschedule link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
    retry: false,
  });
}
