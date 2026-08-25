// features/patients/hooks/use-fax-report-lookup.ts

import { useQuery } from "@tanstack/react-query";

import {
  getFaxReportLookup,
  type FaxReportLookupResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useFaxReportLookup(
  appointmentId: string,
  enabled: boolean,
) {
  return useQuery<FaxReportLookupResult, Error>({
    queryKey: ["patients", "fax-report-lookup", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getFaxReportLookup(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to check for a report to attach.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
  });
}
