// features/patients/hooks/use-report-link.ts

import { useQuery } from "@tanstack/react-query";

import {
  getReportLink,
  type ReportLinkResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useReportLink(appointmentId: string, enabled: boolean) {
  return useQuery<ReportLinkResult, Error>({
    queryKey: ["patients", "report-link", appointmentId] as const,

    queryFn: async () => {
      try {
        return await getReportLink(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to generate a report download link.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 0,
    retry: false,
  });
}
