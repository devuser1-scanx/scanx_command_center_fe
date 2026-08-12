// features/auth/hooks/use-logout.ts

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { logout } from "@/features/auth/api/auth-api";
import { normalizeApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/lib/auth/auth-store";

export function useLogout() {
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
     * Local authentication must always be removed. Navigation to /login is
     * handled by ProtectedRoute reacting to isAuthenticated becoming false -
     * navigating here too raced ProtectedRoute's own redirect and left the
     * app stuck on the "Verifying your access..." screen.
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
    },
  });
}