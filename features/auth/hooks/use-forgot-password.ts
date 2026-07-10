import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "@/features/auth/api/auth-api";
import type {
  ForgotPasswordRequest,
  MessageResponse,
} from "@/features/auth/types/auth-types";
import { normalizeApiError } from "@/lib/api/api-error";

export function useForgotPassword() {
  return useMutation<
    MessageResponse,
    Error,
    ForgotPasswordRequest
  >({
    mutationFn: async (payload) => {
      try {
        return await forgotPassword(payload);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to submit the password reset request.",
        );
      }
    },
  });
}
