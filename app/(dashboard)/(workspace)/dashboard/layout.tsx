// app/(dashboard)/(workspace)/dashboard/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type DashboardLayoutProps = {
  children: ReactNode;
};

/** The Dashboard module - needs the dashboard permission. */
export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.dashboard]}>
      {children}
    </ProtectedRoute>
  );
}
