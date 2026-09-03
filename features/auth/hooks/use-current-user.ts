// features/auth/hooks/use-current-user.ts

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/api/auth-api";
import type { AuthUser } from "@/features/auth/types/auth-types";
import { normalizeApiError } from "@/lib/api/api-error";
import { refreshAccessToken } from "@/lib/api/refresh-token";
import { useAuthStore } from "@/lib/auth/auth-store";
import { tokenManager } from "@/lib/auth/token-manager";

export const CURRENT_USER_QUERY_KEY = [
  "auth",
  "current-user",
] as const;

/**
 * Restores and loads the authenticated user.
 *
 * This hook can:
 *
 * - Use an existing access token
 * - Refresh the access token after a page reload, via the HttpOnly
 *   refresh-token cookie the browser sends automatically - there is no
 *   client-side signal for whether that cookie exists, so this always
 *   attempts it once and lets a 401 mean "no session"
 * - Request GET /auth/me
 * - Restore the Zustand authentication state
 */
export function useCurrentUser() {
  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const updateAccessToken = useAuthStore(
    (state) => state.updateAccessToken,
  );

  const setInitialized = useAuthStore(
    (state) => state.setInitialized,
  );

  const clearAuth = useAuthStore(
    (state) => state.clearAuth,
  );

  return useQuery<AuthUser, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,

    queryFn: async (): Promise<AuthUser> => {
      try {
        let accessToken =
          tokenManager.getAccessToken();

        /**
         * After a full page refresh, the access token is gone because it
         * only exists in memory. Attempt a refresh before calling
         * /auth/me - it succeeds if the refresh-token cookie is present
         * and valid, and fails (401) otherwise.
         */
        if (!accessToken) {
          accessToken = await refreshAccessToken();
          updateAccessToken(accessToken);
        }

        return await getCurrentUser();
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to restore your session.",
        );
      }
    },

    /**
     * Always attempt once on mount. There's no client-readable signal
     * for whether a session cookie exists (it's HttpOnly by design), so
     * the query itself - not a pre-check - is what determines this.
     */
    enabled: true,

    /**
     * Authentication state should not be considered generally cacheable
     * for long periods.
     */
    staleTime: 0,

    /**
     * Do not automatically retry authentication failures.
     */
    retry: false,

    refetchOnWindowFocus: false,

    /**
     * TanStack Query v5 does not reliably support query-level onSuccess
     * and onError callbacks for useQuery in the same way mutations do.
     *
     * Session state will therefore be synchronized by the auth
     * initialization component created in the next step.
     */
  });
}
