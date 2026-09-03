// features/auth/hooks/use-login.ts

import { useMutation } from "@tanstack/react-query";

import {
  getCurrentUser,
  login,
} from "@/features/auth/api/auth-api";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "@/features/auth/types/auth-types";
import { normalizeApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/lib/auth/auth-store";
import { tokenManager } from "@/lib/auth/token-manager";

type LoginMutationResult = {
  user: AuthUser;
  tokens: LoginResponse;
};

/**
 * Handles the complete login workflow:
 *
 * 1. Send credentials to POST /auth/login
 * 2. Store the returned tokens temporarily
 * 3. Request GET /auth/me
 * 4. Store the authenticated user and session in Zustand
 */
export function useLogin() {
  const setSession = useAuthStore(
    (state) => state.setSession,
  );

  const clearAuth = useAuthStore(
    (state) => state.clearAuth,
  );

  return useMutation<
    LoginMutationResult,
    Error,
    LoginRequest
  >({
    mutationFn: async (
      credentials,
    ): Promise<LoginMutationResult> => {
      try {
        /**
         * First, authenticate the user and receive tokens.
         */
        const tokens = await login(credentials);

        /**
         * Store the access token before requesting /auth/me because
         * that request requires it in its Authorization header. The
         * refresh token was already set as an HttpOnly cookie by the
         * backend's response - it never passes through this code.
         */
        tokenManager.setTokens({
          accessToken: tokens.access_token,
        });

        /**
         * Fetch the complete authenticated user record.
         */
        const user = await getCurrentUser();

        return {
          user,
          tokens,
        };
      } catch (error) {
        /**
         * Login should be treated as unsuccessful when either:
         *
         * - POST /auth/login fails
         * - GET /auth/me fails after login
         *
         * Remove any temporary tokens in both cases.
         */
        tokenManager.clearTokens();

        throw normalizeApiError(
          error,
          "Unable to sign in. Please check your credentials.",
        );
      }
    },

    onSuccess: ({ user, tokens }) => {
      setSession({
        user,
        tokens,
      });
    },

    onError: () => {
      clearAuth();
    },
  });
}