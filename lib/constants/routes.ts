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

export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  users: "/admin/users",
  createUser: "/admin/users/create",
  roles: "/admin/roles",
  clinics: "/admin/clinics",
  auditLogs: "/admin/audit-logs",
} as const;

export const FRONT_DESK_ROUTES = {
  dashboard: "/front-desk/dashboard",
} as const;

export const SONOGRAPHER_ROUTES = {
  patientSearch: "/sonographer/patient-search",
} as const;

export const SALES_ROUTES = {
  dashboard: "/sales/dashboard",
} as const;