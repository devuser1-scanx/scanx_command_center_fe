// features/patients/hooks/use-sms-prefill.ts

import { useQuery } from "@tanstack/react-query";

import {
  getSmsPrefill,
  type SmsPrefillResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useSmsPrefill(appointmentId: string, enabled: boolean) {
  return useQuery<SmsPrefillResult, Error>({
    queryKey: ["patients", "sms-prefill", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getSmsPrefill(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to look up phone number and directions link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
  });
}
