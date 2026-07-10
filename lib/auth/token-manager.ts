// lib/auth/token-manager.ts

const REFRESH_TOKEN_STORAGE_KEY =
  "scanx_command_center_refresh_token";

/**
 * Access tokens are kept only in JavaScript memory.
 *
 * This means the token is removed whenever the page is fully refreshed.
 * The refresh token can then be used to request a new access token.
 */
let accessToken: string | null = null;

/**
 * Refresh token is temporarily stored in sessionStorage because the
 * current backend returns it in the JSON response.
 *
 * Production recommendation:
 * Move the refresh token to a Secure, HttpOnly cookie managed by the
 * backend. At that point, the frontend should not read or store it.
 */
let inMemoryRefreshToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const tokenManager = {
  /**
   * Save a new access token in memory.
   */
  setAccessToken(token: string | null): void {
    accessToken = token;
  },

  /**
   * Return the current in-memory access token.
   */
  getAccessToken(): string | null {
    return accessToken;
  },

  /**
   * Save the refresh token in memory and sessionStorage.
   */
  setRefreshToken(token: string | null): void {
    inMemoryRefreshToken = token;

    if (!isBrowser()) {
      return;
    }

    if (token) {
      window.sessionStorage.setItem(
        REFRESH_TOKEN_STORAGE_KEY,
        token,
      );
      return;
    }

    window.sessionStorage.removeItem(
      REFRESH_TOKEN_STORAGE_KEY,
    );
  },

  /**
   * Read the refresh token.
   *
   * Memory is checked first. If the page was refreshed, sessionStorage
   * is checked so the application can restore the session.
   */
  getRefreshToken(): string | null {
    if (inMemoryRefreshToken) {
      return inMemoryRefreshToken;
    }

    if (!isBrowser()) {
      return null;
    }

    const storedToken = window.sessionStorage.getItem(
      REFRESH_TOKEN_STORAGE_KEY,
    );

    inMemoryRefreshToken = storedToken;

    return storedToken;
  },

  /**
   * Save both tokens after login or token refresh.
   */
  setTokens(tokens: {
    accessToken: string;
    refreshToken?: string | null;
  }): void {
    accessToken = tokens.accessToken;

    if (tokens.refreshToken !== undefined) {
      this.setRefreshToken(tokens.refreshToken);
    }
  },

  /**
   * Remove all authentication tokens.
   *
   * This should run during logout, refresh-token failure, and session
   * expiration.
   */
  clearTokens(): void {
    accessToken = null;
    inMemoryRefreshToken = null;

    if (!isBrowser()) {
      return;
    }

    window.sessionStorage.removeItem(
      REFRESH_TOKEN_STORAGE_KEY,
    );
  },

  /**
   * Check whether an access token currently exists.
   */
  hasAccessToken(): boolean {
    return Boolean(accessToken);
  },

  /**
   * Check whether a refresh token currently exists.
   */
  hasRefreshToken(): boolean {
    return Boolean(this.getRefreshToken());
  },
};