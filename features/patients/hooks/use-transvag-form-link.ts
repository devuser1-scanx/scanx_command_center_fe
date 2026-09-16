// features/patients/hooks/use-transvag-form-link.ts

import { useQuery } from "@tanstack/react-query";

import {
  getTransvagFormLink,
  type TransvagFormLinkResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useTransvagFormLink(appointmentId: string, enabled: boolean) {
  return useQuery<TransvagFormLinkResult, Error>({
    queryKey: ["patients", "transvag-form-link", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getTransvagFormLink(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to generate a Transvaginal Consent form link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
    retry: false,
  });
}
