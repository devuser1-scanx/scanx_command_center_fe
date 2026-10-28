// app/(dashboard)/(workspace)/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

/**
 * Shared shell (sidebar + header) for every signed-in role. It only checks
 * that the user is signed in with a supported role; what each role can open
 * is decided one level down - each module (dashboard, patients, reports)
 * has its own layout requiring that module's permission, and ./admin
 * narrows access to admin alone. The (workspace) route group keeps
 * "workspace" out of the URL (/dashboard, /patients, /reports).
 */
export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </ProtectedRoute>
  );
}
