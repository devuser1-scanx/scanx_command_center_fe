// features/dashboard/admin/hooks/use-clinics.ts

import { useQuery } from "@tanstack/react-query";

import {
  getClinics,
  type Clinic,
} from "@/features/dashboard/admin/api/dashboard-api";
import { normalizeApiError } from "@/lib/api/api-error";

export const CLINICS_QUERY_KEY = ["dashboard", "clinics"] as const;

/**
 * Clinics change rarely, so this is cached for the whole session
 * (staleTime: Infinity) rather than refetched on every mount.
 */
export function useClinics() {
  return useQuery<Clinic[], Error>({
    queryKey: CLINICS_QUERY_KEY,

    queryFn: async () => {
      try {
        return await getClinics();
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load clinics.",
        );
      }
    },

    staleTime: Infinity,
    retry: 1,
  });
}
