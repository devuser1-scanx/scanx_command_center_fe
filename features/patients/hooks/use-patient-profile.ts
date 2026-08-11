// features/patients/hooks/use-patient-profile.ts

import { useQuery } from "@tanstack/react-query";

import {
  getPatientProfile,
  type PatientProfile,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function usePatientProfile(appointmentId: string) {
  return useQuery<PatientProfile, Error>({
    queryKey: ["patients", "profile", appointmentId] as const,

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
