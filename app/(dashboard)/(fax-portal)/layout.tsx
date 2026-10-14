// app/(dashboard)/(fax-portal)/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";

type FaxPortalLayoutProps = {
  children: ReactNode;
};

/**
 * Sales & FAX Referrals. Shares the sidebar + header shell with the main
 * workspace but has its own role gate: admin and front_desk (the
 * "help desk" staff) and sales agents. The (fax-portal) route group keeps
 * the group name out of the URL, so pages live at /fax-portal/....
 *
 * The backend enforces the same roles (app/api/dependencies/fax_portal.py).
 */
export default function FaxPortalLayout({
  children,
}: FaxPortalLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin", "front_desk", "sales"]}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </ProtectedRoute>
  );
}
