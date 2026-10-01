import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  manualCheckIn,
  type ManualCheckInResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

export function useManualCheckIn(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<ManualCheckInResult, Error>({
    mutationFn: async () => {
      try {
        return await manualCheckIn(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to check in this patient.",
        );
      }
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.patients.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        }),
      ]);
    },
  });
}
