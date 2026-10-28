// features/auth/utils/role-redirect.ts

import type { UserRole } from "@/features/auth/types/auth-types";
import {
  FAX_PORTAL_ROUTES,
  PUBLIC_ROUTES,
  WORKSPACE_ROUTES,
} from "@/lib/constants/routes";

/**
 * Return the default landing page for a user role.
 *
 * Every role works inside the same shell (see
 * app/(dashboard)/(workspace)/layout.tsx); what each one can open is decided
 * by its permissions. Only the Administration pages (Users, Roles, Clinics,
 * Notifications, Settings) are admin-only.
 */
export function getRoleRedirectPath(
  role: UserRole,
): string {
  switch (role) {
    case "admin":
    case "sonographer":
      return WORKSPACE_ROUTES.dashboard;

    case "sales":
      // Sales agents work out of the FAX Portal.
      return FAX_PORTAL_ROUTES.board;

    default:
      return PUBLIC_ROUTES.unauthorized;
  }
}
