// lib/auth/csrf.ts

/**
 * Double-submit CSRF token, set as a (non-HttpOnly, readable) cookie by
 * the backend alongside the HttpOnly refresh-token cookie on login and
 * refresh. Echoed back as the X-CSRF-Token header on any request that
 * relies on the refresh cookie (POST /auth/refresh, POST /auth/logout) -
 * a cross-site attacker can trigger the cookie to be sent automatically,
 * but can't read its value to reproduce it in a header.
 */
const CSRF_COOKIE_NAME = "scanx_csrf_token";

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}
