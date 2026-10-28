// app/(dashboard)/(workspace)/reports/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type ReportsLayoutProps = {
  children: ReactNode;
};

/** The Reports module - needs the reports permission. */
export default function ReportsLayout({
  children,
}: ReportsLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.reports]}>
      {children}
    </ProtectedRoute>
  );
}
