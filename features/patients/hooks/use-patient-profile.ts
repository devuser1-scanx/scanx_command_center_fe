import { useQuery } from "@tanstack/react-query";

import {
  getPatientProfile,
  type PatientProfile,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

export function usePatientProfile(appointmentId: string) {
  return useQuery<PatientProfile, Error>({
    queryKey: queryKeys.patients.profile(appointmentId),

    queryFn: async () => {
      try {
        return await getPatientProfile(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load this patient's profile.",
        );
      }
    },

    enabled: Boolean(appointmentId),
    staleTime: 15_000,
  });
}
