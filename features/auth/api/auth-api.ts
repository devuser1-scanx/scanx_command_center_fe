// features/auth/api/auth-api.ts

import type {
  AuthUser,
  ChangePasswordRequest,
  CurrentUserResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  ResetPasswordRequest,
} from "@/features/auth/types/auth-types";

import { normalizeAuthUser } from "@/features/auth/utils/normalize-auth-user";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getCsrfToken } from "@/lib/auth/csrf";

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
  const response =
    await apiClient.get<CurrentUserResponse>(
      API_ENDPOINTS.auth.me,
    );

  return normalizeAuthUser(response);
}

/**
 * Log out the current session.
 *
 * The refresh token itself travels only as an HttpOnly cookie, sent
 * automatically by the browser. The X-CSRF-Token header is the
 * double-submit counterpart the backend requires alongside it.
 */
export async function logout(): Promise<MessageResponse | void> {
  return apiClient.post<MessageResponse | void>(
    API_ENDPOINTS.auth.logout,
    undefined,
    {
      authenticated: true,
      headers: {
        "X-CSRF-Token": getCsrfToken() ?? "",
      },

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