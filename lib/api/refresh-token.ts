// lib/api/refresh-token.ts

import type {
  RefreshTokenResponse,
} from "@/features/auth/types/auth-types";
import { env } from "@/lib/env";
import { tokenManager } from "@/lib/auth/token-manager";
import {
  ApiError,
  getApiErrorMessage,
  type ApiErrorResponse,
} from "@/lib/api/api-error";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

/**
 * Stores the currently running refresh request.
 *
 * When several API calls receive 401 at the same time, they all reuse
 * this single promise instead of sending multiple refresh requests.
 */
let activeRefreshRequest:
  | Promise<RefreshTokenResponse>
  | null = null;

function buildUrl(endpoint: string): string {
  const baseUrl = env.apiBaseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${path}`;
}

async function parseErrorResponse(
  response: Response,
): Promise<ApiErrorResponse | null> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return null;
  }
}

/**
 * Calls POST /auth/refresh and saves the newly issued tokens.
 */
async function performRefresh(): Promise<RefreshTokenResponse> {
  const refreshToken =
    tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new ApiError({
      message:
        "Your session has expired. Please sign in again.",
      status: 401,
      code: "REFRESH_TOKEN_MISSING",
    });
  }

  let response: Response;

  try {
    response = await fetch(
      buildUrl(API_ENDPOINTS.auth.refresh),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        /**
         * This supports the future production setup where the refresh
         * token is stored in an HttpOnly cookie.
         */
        credentials: "include",

        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      },
    );
  } catch (error) {
    throw new ApiError({
      message:
        "Unable to refresh your session. Check your internet connection.",
      code: "REFRESH_NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    const payload =
      await parseErrorResponse(response);

    tokenManager.clearTokens();

    throw new ApiError({
      message: getApiErrorMessage(
        payload,
        "Your session has expired. Please sign in again.",
      ),
      status: response.status,
      code:
        payload?.code ??
        "REFRESH_TOKEN_FAILED",
      details: payload,
    });
  }

  let tokens: RefreshTokenResponse;

  try {
    tokens =
      (await response.json()) as RefreshTokenResponse;
  } catch (error) {
    tokenManager.clearTokens();

    throw new ApiError({
      message:
        "The authentication server returned an invalid response.",
      status: response.status,
      code: "INVALID_REFRESH_RESPONSE",
      cause: error,
    });
  }

  if (!tokens.access_token) {
    tokenManager.clearTokens();

    throw new ApiError({
      message:
        "The authentication server did not return an access token.",
      status: response.status,
      code: "ACCESS_TOKEN_MISSING",
      details: tokens,
    });
  }

  tokenManager.setTokens({
    accessToken: tokens.access_token,

    /**
     * Some backends rotate the refresh token while others return only
     * a new access token.
     */
    refreshToken:
      tokens.refresh_token !== undefined
        ? tokens.refresh_token
        : undefined,
  });

  return tokens;
}

/**
 * Public refresh function.
 *
 * All simultaneous callers share one refresh request.
 */
export async function refreshAccessToken(): Promise<string> {
  if (!activeRefreshRequest) {
    activeRefreshRequest = performRefresh().finally(
      () => {
        activeRefreshRequest = null;
      },
    );
  }

  const tokens = await activeRefreshRequest;

  return tokens.access_token;
}