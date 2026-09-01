// features/patients/hooks/use-send-sms.ts

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sendSms,
  type SendSmsResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

type SendSmsInput = {
  purpose: string;
  destinationNumber: string;
  body: string;
};

export function useSendSms(appointmentId: string) {
  return useMutation<SendSmsResult, Error, SendSmsInput>({
    mutationFn: async (input) => {
      try {
        return await sendSms(appointmentId, input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to send the text message. Please try again.",
        );
      }
    },

    onSuccess: () => {
      toast.success("Text message sent.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
