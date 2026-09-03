// app/(dashboard)/(workspace)/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

/**
 * Shared shell (sidebar + header) for every role that works inside the
 * main operational workspace - currently admin and front_desk. The
 * (workspace) route group keeps "admin" out of the URL for pages both
 * roles use (/dashboard, /patients, /reports); truly admin-only pages
 * live nested under ./admin, gated further by its own layout.
 */
export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin", "front_desk"]}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </ProtectedRoute>
  );
}
