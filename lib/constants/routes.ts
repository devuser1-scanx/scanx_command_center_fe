// lib/constants/routes.ts

export const PUBLIC_ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  unauthorized: "/unauthorized",
} as const;

export const AUTHENTICATED_ROUTES = {
  changePassword: "/change-password",
} as const;

/**
 * Pages shared by every role in the main operational workspace (admin
 * and front_desk today) - no /admin prefix, since these aren't
 * admin-only. See app/(dashboard)/(workspace)/layout.tsx.
 */
export const WORKSPACE_ROUTES = {
  dashboard: "/dashboard",
  patients: "/patients",
  reports: "/reports",
} as const;

/**
 * The true Administration section - admin only. See
 * app/(dashboard)/(workspace)/admin/layout.tsx.
 */
export const ADMIN_ROUTES = {
  users: "/admin/users",
  createUser: "/admin/users/create",
  roles: "/admin/roles",
  clinics: "/admin/clinics",
  auditLogs: "/admin/audit-logs",
} as const;

export const SONOGRAPHER_ROUTES = {
  patientSearch: "/sonographer/patient-search",
} as const;

export const SALES_ROUTES = {
  dashboard: "/sales/dashboard",
} as const;