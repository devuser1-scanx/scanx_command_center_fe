// lib/auth/token-manager.ts

/**
 * Access tokens are kept only in JavaScript memory.
 *
 * This means the token is removed whenever the page is fully refreshed.
 * A fresh access token is then obtained via POST /auth/refresh, which
 * relies on the HttpOnly refresh-token cookie the browser sends
 * automatically - the refresh token itself never exists in JS at all,
 * not even transiently.
 */
let accessToken: string | null = null;

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
   * Save the access token after login or token refresh.
   */
  setTokens(tokens: { accessToken: string }): void {
    accessToken = tokens.accessToken;
  },

  /**
   * Remove the in-memory access token.
   *
   * This should run during logout, refresh failure, and session
   * expiration. The refresh-token cookie itself is cleared by the
   * backend's Set-Cookie response on POST /auth/logout (or simply
   * expires/gets rejected server-side if that call is never made).
   */
  clearTokens(): void {
    accessToken = null;
  },

  /**
   * Check whether an access token currently exists.
   */
  hasAccessToken(): boolean {
    return Boolean(accessToken);
  },
};
