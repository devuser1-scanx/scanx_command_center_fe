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

export type BackendRole = {
  id: number;
  code: string;
  name: string;
};

export type BackendClinicAccess = {
  clinic_id?: number | string;
  id?: number | string;
  clinic?: {
    id?: number | string;
  };
};

export type CurrentUserResponse = {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_active: boolean;
  is_email_verified?: boolean;
  must_change_password: boolean;
  last_login_at?: string | null;
  roles: BackendRole[];
  permissions: Permission[];
  clinic_access: BackendClinicAccess[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
};

export type AuthUser = {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string | null;
  phone?: string | null;

  /**
   * Normalized primary role used by the frontend.
   */
  role: UserRole;

  /**
   * Complete backend roles are preserved for future multi-role support.
   */
  roles: BackendRole[];

  permissions: Permission[];
  status: UserStatus;
  is_active: boolean;
  is_email_verified?: boolean;
  must_change_password: boolean;
  last_login_at?: string | null;

  clinic_id?: number | string | null;
  clinic_ids: Array<number | string>;
  clinic_access: BackendClinicAccess[];

  created_at?: string;
  updated_at?: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};
 

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
  confirm_new_password?: string;
};

export type MessageResponse = {
  message: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
};