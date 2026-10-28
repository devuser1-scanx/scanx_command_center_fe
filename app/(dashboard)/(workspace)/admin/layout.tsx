// app/(dashboard)/(workspace)/admin/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * The Administration section (Users, Roles, Clinics, Notifications,
 * Settings) - admin only. The shell is already provided by the parent
 * (workspace) layout, which admits every signed-in role; this layout is
 * the one place that narrows access down to admin alone for everything
 * nested under it.
 */
export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
  );
}
