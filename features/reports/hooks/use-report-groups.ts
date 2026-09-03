// features/reports/hooks/use-report-groups.ts

import { useQuery } from "@tanstack/react-query";

import {
  listReportGroups,
  type ReportGroupList,
} from "@/features/reports/api/reports-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function reportGroupsQueryKey(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  return [
    "reports",
    "groups",
    params.search ?? null,
    params.page,
    params.pageSize,
  ] as const;
}

export function useReportGroups(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  return useQuery<ReportGroupList, Error>({
    queryKey: reportGroupsQueryKey(params),

    queryFn: async () => {
      try {
        return await listReportGroups(params);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load reports.");
      }
    },

    staleTime: 15_000,
  });
}
