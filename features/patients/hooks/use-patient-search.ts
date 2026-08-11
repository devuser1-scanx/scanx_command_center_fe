// features/patients/hooks/use-patient-search.ts

import { useQuery } from "@tanstack/react-query";

import {
  searchPatients,
  type PatientSummary,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function patientSearchQueryKey(params: {
  q?: string;
  date?: string;
}) {
  return [
    "patients",
    "search",
    params.q ?? null,
    params.date ?? null,
  ] as const;
}

export function usePatientSearch(params: {
  q?: string;
  date?: string;
}) {
  return useQuery<PatientSummary[], Error>({
    queryKey: patientSearchQueryKey(params),

    queryFn: async () => {
      try {
        return await searchPatients(params);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to search patients.",
        );
      }
    },

    staleTime: 15_000,
  });
}
