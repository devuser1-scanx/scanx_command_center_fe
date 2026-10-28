// features/calls/hooks/use-calls-queries.ts

import { useQuery } from "@tanstack/react-query";

import {
  getCallsSummary,
  getMissedCalls,
  getPatientCallHistory,
  getRecentCalls,
  searchCallPatients,
} from "@/features/calls/api/calls-api";
import type {
  CallPatientHistoryResponse,
  CallPatientSearchResponse,
  CallsResponse,
  CallsSummary,
  CallsSummaryQuery,
} from "@/features/calls/types/calls-types";
import { normalizeApiError } from "@/lib/api/api-error";

/** Every Calls query starts with this key, so one invalidation refreshes them all. */
export const CALLS_QUERY_KEY = ["calls"] as const;

const STALE_MS = 15_000;

export function useCallsSummary(query: CallsSummaryQuery) {
  return useQuery<CallsSummary, Error>({
    queryKey: [...CALLS_QUERY_KEY, "summary", query.startDate, query.endDate],
    staleTime: STALE_MS,

    queryFn: async () => {
      try {
        return await getCallsSummary(query);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the call summary.");
      }
    },
  });
}

export function useRecentCalls(limit = 50) {
  return useQuery<CallsResponse, Error>({
    queryKey: [...CALLS_QUERY_KEY, "recent", limit],
    staleTime: STALE_MS,

    queryFn: async () => {
      try {
        return await getRecentCalls(limit);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load recent calls.");
      }
    },
  });
}

export function useMissedCalls(limit = 50) {
  return useQuery<CallsResponse, Error>({
    queryKey: [...CALLS_QUERY_KEY, "missed", limit],
    staleTime: STALE_MS,

    queryFn: async () => {
      try {
        return await getMissedCalls(limit);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load missed calls.");
      }
    },
  });
}

/** Runs only for a submitted, non-empty search. */
export function useCallPatientSearch(query: string) {
  const search = query.trim();

  return useQuery<CallPatientSearchResponse, Error>({
    queryKey: [...CALLS_QUERY_KEY, "patients", search],
    enabled: search.length > 0,
    staleTime: STALE_MS,

    queryFn: async () => {
      try {
        return await searchCallPatients(search);
      } catch (error) {
        throw normalizeApiError(error, "Unable to search patients.");
      }
    },
  });
}

/** Runs only once a patient with a phone number is selected. */
export function usePatientCallHistory(phone: string | null) {
  return useQuery<CallPatientHistoryResponse, Error>({
    queryKey: [...CALLS_QUERY_KEY, "patient-history", phone],
    enabled: phone !== null,
    staleTime: STALE_MS,

    queryFn: async () => {
      try {
        return await getPatientCallHistory(phone ?? "");
      } catch (error) {
        throw normalizeApiError(error, "Unable to load call history.");
      }
    },
  });
}
