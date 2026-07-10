import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "@/features/auth/api/auth-api";
import type {
  MessageResponse,
  ResetPasswordRequest,
} from "@/features/auth/types/auth-types";
import { normalizeApiError } from "@/lib/api/api-error";

export function useResetPassword() {
  return useMutation<
    MessageResponse,
    Error,
    ResetPasswordRequest
  >({
    mutationFn: async (payload) => {
      try {
        return await resetPassword(payload);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to reset the password.",
        );
      }
    },
  });
}
