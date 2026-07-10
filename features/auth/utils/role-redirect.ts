// features/auth/utils/role-redirect.ts

import type { UserRole } from "@/features/auth/types/auth-types";
import {
  ADMIN_ROUTES,
  FRONT_DESK_ROUTES,
  PUBLIC_ROUTES,
  SALES_ROUTES,
  SONOGRAPHER_ROUTES,
} from "@/lib/constants/routes";

/**
 * Return the default landing page for a user role.
 */
export function getRoleRedirectPath(
  role: UserRole,
): string {
  switch (role) {
    case "admin":
      return ADMIN_ROUTES.dashboard;

    case "front_desk":
      return FRONT_DESK_ROUTES.dashboard;

    case "sonographer":
      return SONOGRAPHER_ROUTES.patientSearch;

    case "sales":
      return SALES_ROUTES.dashboard;

    default:
      return PUBLIC_ROUTES.unauthorized;
  }
}