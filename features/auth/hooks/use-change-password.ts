// features/auth/hooks/use-change-password.ts

import { useMutation } from "@tanstack/react-query";

import { changePassword } from "@/features/auth/api/auth-api";
import type {
  ChangePasswordRequest,
  MessageResponse,
} from "@/features/auth/types/auth-types";
import { normalizeApiError } from "@/lib/api/api-error";

export function useChangePassword() {
  return useMutation<
    MessageResponse,
    Error,
    ChangePasswordRequest
  >({
    mutationFn: async (payload) => {
      try {
        return await changePassword(payload);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to change the password.",
        );
      }
    },
  });
}