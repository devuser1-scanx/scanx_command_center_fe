// features/patients/hooks/use-send-mail.ts

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sendMail,
  type SendMailResult,
} from "@/features/patients/api/patients-api";
import { normalizeApiError } from "@/lib/api/api-error";

type SendMailInput = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  bodyHtml: string;
  includeReport: boolean;
  files: File[];
};

export function useSendMail(appointmentId: string) {
  return useMutation<SendMailResult, Error, SendMailInput>({
    mutationFn: async (input) => {
      try {
        return await sendMail(appointmentId, input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to send the email. Please try again.",
        );
      }
    },

    onSuccess: () => {
      toast.success("Email sent.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
