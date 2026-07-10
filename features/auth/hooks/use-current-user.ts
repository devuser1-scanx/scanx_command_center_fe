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
 * - Refresh the access token after a page reload
 * - Request GET /auth/me
 * - Restore the Zustand authentication state
 */
export function useCurrentUser() {
  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const updateTokens = useAuthStore(
    (state) => state.updateTokens,
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
         * only exists in memory.
         *
         * When a refresh token exists, request a new access token before
         * calling /auth/me.
         */
        if (
          !accessToken &&
          tokenManager.hasRefreshToken()
        ) {
          accessToken =
            await refreshAccessToken();

          updateTokens({
            accessToken,
            refreshToken:
              tokenManager.getRefreshToken(),
          });
        }

        if (!accessToken) {
          throw new Error(
            "No active authentication session.",
          );
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
     * Only run the query when at least one authentication token exists.
     *
     * Without this condition, the public login page would immediately
     * call /auth/me and receive an unnecessary 401 response.
     */
    enabled:
      tokenManager.hasAccessToken() ||
      tokenManager.hasRefreshToken(),

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