// lib/api/api-error.ts

export type ApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

export type ApiErrorResponse = {
  detail?:
    | string
    | ApiValidationError[]
    | {
        message?: string;
      };

  message?: string;

  error?: string;

  code?: string;

  errors?: ApiValidationError[];
};

type ApiErrorOptions = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor({
    message,
    status,
    code,
    details,
    cause,
  }: ApiErrorOptions) {
    super(message, {
      cause,
    });

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Extract a readable message from a FastAPI or custom API error response.
 */
export function getApiErrorMessage(
  payload: ApiErrorResponse | null | undefined,
  fallbackMessage = "An unexpected error occurred.",
): string {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (
    payload.detail &&
    !Array.isArray(payload.detail) &&
    typeof payload.detail === "object" &&
    typeof payload.detail.message === "string"
  ) {
    return payload.detail.message;
  }

  if (Array.isArray(payload.detail)) {
    const validationMessages = payload.detail
      .map((item) => item.msg)
      .filter(
        (message): message is string =>
          typeof message === "string" &&
          message.length > 0,
      );

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  if (
    typeof payload.message === "string" &&
    payload.message.length > 0
  ) {
    return payload.message;
  }

  if (
    typeof payload.error === "string" &&
    payload.error.length > 0
  ) {
    return payload.error;
  }

  if (Array.isArray(payload.errors)) {
    const validationMessages = payload.errors
      .map((item) => item.msg)
      .filter(
        (message): message is string =>
          typeof message === "string" &&
          message.length > 0,
      );

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return fallbackMessage;
}

/**
 * Convert unknown errors into ApiError.
 *
 * This is useful inside React Query mutation and query handlers.
 */
export function normalizeApiError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred.",
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || fallbackMessage,
      cause: error,
    });
  }

  return new ApiError({
    message: fallbackMessage,
    details: error,
  });
}

/**
 * Type guard used by components and hooks.
 */
export function isApiError(
  error: unknown,
): error is ApiError {
  return error instanceof ApiError;
}