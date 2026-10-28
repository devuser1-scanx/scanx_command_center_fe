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
 * Pages shared by the roles in the main operational workspace (each
 * gated by its module permission) - no /admin prefix, since these aren't
 * admin-only. See app/(dashboard)/(workspace)/layout.tsx.
 */
export const WORKSPACE_ROUTES = {
  dashboard: "/dashboard",
  patients: "/patients",
  reports: "/reports",
} as const;

/**
 * The Calls module (the Web Dialer): a group of pages inside the workspace.
 * See app/(dashboard)/(workspace)/calls.
 */
export const CALLS_ROUTES = {
  dashboard: "/calls",
  dialer: "/calls/dialer",
  patients: "/calls/patients",
  history: "/calls/history",
} as const;

/**
 * The true Administration section - admin only. See
 * app/(dashboard)/(workspace)/admin/layout.tsx.
 */
export const ADMIN_ROUTES = {
  users: "/admin/users",
  createUser: "/admin/users/create",
  user: (userId: number | string) => `/admin/users/${userId}`,
  roles: "/admin/roles",
  clinics: "/admin/clinics",
} as const;

export const SONOGRAPHER_ROUTES = {
  patientSearch: "/sonographer/patient-search",
} as const;

export const SALES_ROUTES = {
  dashboard: "/sales/dashboard",
} as const;

/**
 * Sales & FAX Referrals (the "FAX Portal"). Shared by admin and sales
 * agents (the FAX Portal permission) - see
 * app/(dashboard)/(fax-portal)/layout.tsx.
 */
export const FAX_PORTAL_ROUTES = {
  board: "/fax-portal/board",
  queue: "/fax-portal/queue",
  intake: "/fax-portal/intake",
  case: "/fax-portal/case",
  insights: "/fax-portal/insights",
} as const;

export const faxPortalCaseRoute = (referralId: number): string =>
  `${FAX_PORTAL_ROUTES.case}/${referralId}`;

export const faxPortalIntakeRoute = (referralId: number): string =>
  `${FAX_PORTAL_ROUTES.intake}?referral=${referralId}`;
