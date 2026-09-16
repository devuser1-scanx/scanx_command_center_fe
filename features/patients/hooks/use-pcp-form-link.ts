// features/patients/hooks/use-pcp-form-link.ts

import { useQuery } from "@tanstack/react-query";

import {
  getPcpFormLink,
  type PcpFormLinkResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function usePcpFormLink(appointmentId: string, enabled: boolean) {
  return useQuery<PcpFormLinkResult, Error>({
    queryKey: ["patients", "pcp-form-link", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getPcpFormLink(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to generate a PCP form link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
    retry: false,
  });
}
