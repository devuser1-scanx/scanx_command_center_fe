// app/(dashboard)/(fax-portal)/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type FaxPortalLayoutProps = {
  children: ReactNode;
};

/**
 * Sales & FAX Referrals. Shares the sidebar + header shell with the main
 * workspace but has its own gate: the FAX Portal permission, which Admin and
 * Sales Agent hold. The (fax-portal) route group keeps the group name out of
 * the URL, so pages live at /fax-portal/....
 *
 * The backend enforces the same permission (app/api/dependencies/fax_portal.py).
 */
export default function FaxPortalLayout({
  children,
}: FaxPortalLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.faxPortal]}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </ProtectedRoute>
  );
}
