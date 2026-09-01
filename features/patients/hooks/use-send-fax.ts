// features/patients/hooks/use-send-fax.ts

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sendFax,
  type SendFaxResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

type SendFaxInput = {
  destinationNumber: string;
  subject: string;
  includeReport: boolean;
  files: File[];
};

export function useSendFax(appointmentId: string) {
  return useMutation<SendFaxResult, Error, SendFaxInput>({
    mutationFn: async (input) => {
      try {
        return await sendFax(appointmentId, input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to send the fax. Please try again.",
        );
      }
    },

    onSuccess: () => {
      toast.success("Fax sent.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
