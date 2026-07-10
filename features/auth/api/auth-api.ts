// features/auth/api/auth-api.ts

import type {
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  ResetPasswordRequest,
} from "@/features/auth/types/auth-types";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { tokenManager } from "@/lib/auth/token-manager";

/**
 * Log in with email and password.
 *
 * This request is public, so it does not send an access token and must
 * not attempt token refresh when the backend returns 401.
 */
export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(
    API_ENDPOINTS.auth.login,
    payload,
    {
      authenticated: false,
      retryOnUnauthorized: false,
    },
  );
}

/**
 * Return the currently authenticated user.
 *
 * The API client automatically adds the access token.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  return apiClient.get<AuthUser>(
    API_ENDPOINTS.auth.me,
  );
}

/**
 * Log out the current session.
 *
 * The backend may require either:
 * - only the access token, or
 * - the refresh token in the request body
 *
 * The current implementation sends the refresh token when available.
 */
export async function logout(): Promise<MessageResponse | void> {
  const refreshToken =
    tokenManager.getRefreshToken();

  return apiClient.post<MessageResponse | void>(
    API_ENDPOINTS.auth.logout,
    refreshToken
      ? {
          refresh_token: refreshToken,
        }
      : undefined,
    {
      authenticated: true,

      /**
       * Logout should not start a token refresh loop when the session
       * has already expired.
       */
      retryOnUnauthorized: false,
    },
  );
}

/**
 * Change the password of the currently logged-in user.
 */
export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<MessageResponse> {
  return apiClient.post<MessageResponse>(
    API_ENDPOINTS.auth.changePassword,
    payload,
  );
}

/**
 * Request a password-reset email.
 *
 * This endpoint is public.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<MessageResponse> {
  return apiClient.post<MessageResponse>(
    API_ENDPOINTS.auth.forgotPassword,
    payload,
    {
      authenticated: false,
      retryOnUnauthorized: false,
    },
  );
}

/**
 * Reset a password using the token received through email.
 *
 * This endpoint is public.
 */
export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<MessageResponse> {
  return apiClient.post<MessageResponse>(
    API_ENDPOINTS.auth.resetPassword,
    payload,
    {
      authenticated: false,
      retryOnUnauthorized: false,
    },
  );
}

export const authApi = {
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};