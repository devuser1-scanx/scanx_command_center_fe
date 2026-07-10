// features/auth/types/auth-types.ts

export type UserRole =
  | "admin"
  | "front_desk"
  | "sonographer"
  | "sales";

export type UserStatus =
  | "active"
  | "inactive"
  | "blocked";

export type Permission = string;

/**
 * Data sent to the backend when a user logs in.
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Token response returned after a successful login.
 *
 * This follows the usual FastAPI snake_case response format.
 */
export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
};

/**
 * Logged-in user returned by GET /auth/me.
 */
export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string | null;

  role: UserRole;
  permissions: Permission[];

  status: UserStatus;
  is_active: boolean;
  must_change_password: boolean;

  clinic_id?: string | null;
  clinic_ids?: string[];

  created_at?: string;
  updated_at?: string;
};

/**
 * Request used when refreshing an expired access token.
 */
export type RefreshTokenRequest = {
  refresh_token: string;
};

/**
 * Response returned by POST /auth/refresh.
 */
export type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
};

/**
 * Request used when a logged-in user changes their password.
 */
export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_password?: string;
};

/**
 * Request used when a user forgets their password.
 */
export type ForgotPasswordRequest = {
  email: string;
};

/**
 * Request used when resetting a password through a reset token.
 */
export type ResetPasswordRequest = {
  token: string;
  new_password: string;
  confirm_password?: string;
};

/**
 * Standard backend response for actions that only return a message.
 */
export type MessageResponse = {
  message: string;
};

/**
 * Authentication state stored in Zustand.
 */
export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  isAuthenticated: boolean;
  isInitialized: boolean;
};