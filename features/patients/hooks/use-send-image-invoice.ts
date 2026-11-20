// features/patients/hooks/use-send-image-invoice.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  sendImageInvoice,
  type ImageInvoice,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

export function useSendImageInvoice(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<ImageInvoice, Error>({
    mutationFn: async () => {
      try {
        return await sendImageInvoice(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to send the image invoice. Please try again.",
        );
      }
    },

    // Success or not, refresh the status: a 409 means an invoice already
    // exists, and a failure leaves a `failed` row behind.
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.patients.imageInvoice(appointmentId),
      });
    },
  });
}
