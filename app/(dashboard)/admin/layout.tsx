// app/(dashboard)/admin/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardShell>
        {children}
      </AdminDashboardShell>
    </ProtectedRoute>
  );
}