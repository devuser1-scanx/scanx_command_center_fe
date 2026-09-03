// features/auth/utils/role-redirect.ts

import type { UserRole } from "@/features/auth/types/auth-types";
import {
  PUBLIC_ROUTES,
  SALES_ROUTES,
  SONOGRAPHER_ROUTES,
  WORKSPACE_ROUTES,
} from "@/lib/constants/routes";

/**
 * Return the default landing page for a user role.
 *
 * admin and front_desk share the same operational workspace (dashboard,
 * patients, reports, etc.) - see app/(dashboard)/(workspace)/layout.tsx.
 * Only the further-nested Administration pages (Users, Roles, Clinics,
 * Audit Logs, Settings) stay admin-only.
 */
export function getRoleRedirectPath(
  role: UserRole,
): string {
  switch (role) {
    case "admin":
    case "front_desk":
      return WORKSPACE_ROUTES.dashboard;

    case "sonographer":
      return SONOGRAPHER_ROUTES.patientSearch;

    case "sales":
      return SALES_ROUTES.dashboard;

    default:
      return PUBLIC_ROUTES.unauthorized;
  }
}
