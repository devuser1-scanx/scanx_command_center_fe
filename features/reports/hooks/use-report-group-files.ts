// features/reports/hooks/use-report-group-files.ts

import { useQuery } from "@tanstack/react-query";

import {
  getReportGroupFiles,
  type ReportGroupFiles,
} from "@/features/reports/api/reports-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useReportGroupFiles(groupId: string) {
  return useQuery<ReportGroupFiles, Error>({
    queryKey: ["reports", "group-files", groupId] as const,

    queryFn: async () => {
      try {
        return await getReportGroupFiles(groupId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load this report folder.");
      }
    },

    enabled: Boolean(groupId),
    staleTime: 15_000,
  });
}
