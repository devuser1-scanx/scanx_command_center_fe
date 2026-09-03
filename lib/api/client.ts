// lib/api/client.ts

import { env } from "@/lib/env";
import { tokenManager } from "@/lib/auth/token-manager";
import {
  ApiError,
  getApiErrorMessage,
  type ApiErrorResponse,
} from "@/lib/api/api-error";
import { refreshAccessToken } from "@/lib/api/refresh-token";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type ApiRequestOptions = Omit<
  RequestInit,
  "method" | "body"
> & {
  /**
   * HTTP method used for the request.
   */
  method?: HttpMethod;

  /**
   * Request data.
   *
   * Plain objects are converted to JSON automatically.
   * FormData is sent without forcing a JSON content type.
   */
  body?: unknown;

  /**
   * Whether the access token should be attached.
   *
   * Defaults to true.
   */
  authenticated?: boolean;

  /**
   * Whether a 401 response should trigger token refresh.
   *
   * Defaults to true for authenticated requests.
   */
  retryOnUnauthorized?: boolean;
};

function buildUrl(endpoint: string): string {
  if (
    endpoint.startsWith("http://") ||
    endpoint.startsWith("https://")
  ) {
    return endpoint;
  }

  const baseUrl = env.apiBaseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${path}`;
}

function isFormData(
  value: unknown,
): value is FormData {
  return (
    typeof FormData !== "undefined" &&
    value instanceof FormData
  );
}

function createHeaders(
  options: ApiRequestOptions,
): Headers {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (
    options.body !== undefined &&
    options.body !== null &&
    !isFormData(options.body) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const shouldAuthenticate =
    options.authenticated !== false;

  if (shouldAuthenticate) {
    const accessToken =
      tokenManager.getAccessToken();

    if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }
  }

  return headers;
}

function serializeBody(
  body: unknown,
): BodyInit | null | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body === null) {
    return null;
  }

  if (isFormData(body)) {
    return body;
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseErrorPayload(
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

async function parseSuccessResponse<T>(
  response: Response,
): Promise<T> {
  /**
   * 204 means the backend intentionally returned no response body.
   */
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();

  return text as T;
}

async function clearAuthenticationState(): Promise<void> {
  tokenManager.clearTokens();

  /**
   * Dynamic import avoids a direct circular dependency:
   *
   * auth-store -> token-manager
   * api-client -> auth-store
   */
  try {
    const { useAuthStore } = await import(
      "@/lib/auth/auth-store"
    );

    useAuthStore.getState().clearAuth();
  } catch {
    /**
     * Token cleanup has already completed.
     * Store cleanup failure must not hide the original API error.
     */
  }
}

async function executeRequest<T>(
  endpoint: string,
  options: ApiRequestOptions,
  hasRetried = false,
): Promise<T> {
  const authenticated =
    options.authenticated !== false;

  const retryOnUnauthorized =
    options.retryOnUnauthorized ??
    authenticated;

  const headers = createHeaders(options);

  let response: Response;

  try {
    response = await fetch(buildUrl(endpoint), {
      ...options,
      method: options.method ?? "GET",
      headers,
      body: serializeBody(options.body),

      /**
       * Required for the future HttpOnly refresh cookie.
       */
      credentials:
        options.credentials ?? "include",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message:
        "Unable to connect to the server. Check your internet connection.",
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  /**
   * There's no client-readable signal for whether a refresh-token
   * cookie exists (it's HttpOnly by design) - so this always attempts
   * the refresh once on a 401 and lets that call fail naturally (its
   * own 401) when there's no session to restore.
   */
  const shouldRefresh =
    response.status === 401 &&
    authenticated &&
    retryOnUnauthorized &&
    !hasRetried;

  if (shouldRefresh) {
    try {
      await refreshAccessToken();

      /**
       * Retry the original request once using the new access token.
       */
      return await executeRequest<T>(
        endpoint,
        options,
        true,
      );
    } catch (error) {
      await clearAuthenticationState();

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        message:
          "Your session has expired. Please sign in again.",
        status: 401,
        code: "SESSION_EXPIRED",
        cause: error,
      });
    }
  }

  if (!response.ok) {
    const payload =
      await parseErrorPayload(response);

    if (
      response.status === 401 &&
      authenticated
    ) {
      await clearAuthenticationState();
    }

    throw new ApiError({
      message: getApiErrorMessage(
        payload,
        response.statusText ||
          "The request could not be completed.",
      ),
      status: response.status,
      code: payload?.code,
      details: payload,
    });
  }

  return parseSuccessResponse<T>(response);
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return executeRequest<T>(
    endpoint,
    options,
  );
}

/**
 * Fetches a binary response (e.g. a PDF) as a Blob.
 *
 * Bypasses parseSuccessResponse (which assumes JSON/text), but still
 * attaches the bearer token and retries once on a 401 exactly like
 * executeRequest does for JSON requests.
 */
export async function apiRequestBlob(
  endpoint: string,
  options: Omit<ApiRequestOptions, "method" | "body"> = {},
  hasRetried = false,
): Promise<Blob> {
  const headers = createHeaders(options);

  let response: Response;

  try {
    response = await fetch(buildUrl(endpoint), {
      ...options,
      method: "GET",
      headers,
      credentials: options.credentials ?? "include",
    });
  } catch (error) {
    throw new ApiError({
      message:
        "Unable to connect to the server. Check your internet connection.",
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (
    response.status === 401 &&
    !hasRetried
  ) {
    try {
      await refreshAccessToken();
      return await apiRequestBlob(endpoint, options, true);
    } catch (error) {
      await clearAuthenticationState();

      throw new ApiError({
        message:
          "Your session has expired. Please sign in again.",
        status: 401,
        code: "SESSION_EXPIRED",
        cause: error,
      });
    }
  }

  if (!response.ok) {
    const payload = await parseErrorPayload(response);

    throw new ApiError({
      message: getApiErrorMessage(
        payload,
        response.statusText ||
          "The request could not be completed.",
      ),
      status: response.status,
      code: payload?.code,
      details: payload,
    });
  }

  return response.blob();
}

export const apiClient = {
  get<T>(
    endpoint: string,
    options: Omit<
      ApiRequestOptions,
      "method" | "body"
    > = {},
  ): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<
      ApiRequestOptions,
      "method" | "body"
    > = {},
  ): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<
      ApiRequestOptions,
      "method" | "body"
    > = {},
  ): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<
      ApiRequestOptions,
      "method" | "body"
    > = {},
  ): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  delete<T>(
    endpoint: string,
    options: Omit<
      ApiRequestOptions,
      "method" | "body"
    > = {},
  ): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};