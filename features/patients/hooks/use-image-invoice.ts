// features/patients/hooks/use-image-invoice.ts

import { useQuery } from "@tanstack/react-query";

import {
  getImageInvoice,
  type ImageInvoice,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

/**
 * The latest image invoice for an appointment (null when none was sent).
 * Refetched on window focus, so a payment made on Stripe's page shows up
 * when staff come back to the tab.
 */
export function useImageInvoice(appointmentId: string, enabled: boolean) {
  return useQuery<ImageInvoice | null, Error>({
    queryKey: queryKeys.patients.imageInvoice(appointmentId),

    queryFn: async () => {
      try {
        return await getImageInvoice(appointmentId);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load the image invoice status.",
        );
      }
    },

    enabled: enabled && Boolean(appointmentId),
    staleTime: 15_000,
  });
}
