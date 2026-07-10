// features/auth/hooks/use-logout.ts

import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { logout } from "@/features/auth/api/auth-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/lib/auth/auth-store";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearAuth = useAuthStore(
    (state) => state.clearAuth,
  );

  return useMutation<void, Error, void>({
    mutationFn: async (): Promise<void> => {
      try {
        await logout();
      } catch (error) {
        /**
         * A failed backend logout should not prevent local logout.
         *
         * For example, the access token may already be expired.
         * We normalize the error for debugging, but cleanup still
         * happens in onSettled.
         */
        throw normalizeApiError(
          error,
          "The server could not complete logout.",
        );
      }
    },

    /**
     * onSettled runs whether logout succeeds or fails.
     *
     * Local authentication must always be removed.
     */
    onSettled: async () => {
      clearAuth();

      /**
       * Remove all cached user-specific data.
       *
       * This prevents the next user from briefly seeing cached data
       * from the previous session.
       */
      queryClient.clear();

      router.replace(PUBLIC_ROUTES.login);
      router.refresh();
    },
  });
}