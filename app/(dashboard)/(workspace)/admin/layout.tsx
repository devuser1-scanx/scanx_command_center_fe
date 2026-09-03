// app/(dashboard)/(workspace)/admin/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * The true Administration section (Users, Roles, Clinics, Audit Logs,
 * Settings) - admin only. The shell is already provided by the parent
 * (workspace) layout, which also allows front_desk; this layout is the
 * one place that actually narrows access back down to admin alone for
 * everything nested under it.
 */
export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
  );
}
