// features/patients/hooks/use-scrotal-form-link.ts

import { useQuery } from "@tanstack/react-query";

import {
  getScrotalFormLink,
  type ScrotalFormLinkResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useScrotalFormLink(appointmentId: string, enabled: boolean) {
  return useQuery<ScrotalFormLinkResult, Error>({
    queryKey: ["patients", "scrotal-form-link", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getScrotalFormLink(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to generate a Scrotal Consent form link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
    retry: false,
  });
}
