// app/(dashboard)/(workspace)/patients/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type PatientsLayoutProps = {
  children: ReactNode;
};

/** The Patients module (search and patient profile) - needs the patients permission. */
export default function PatientsLayout({
  children,
}: PatientsLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.patients]}>
      {children}
    </ProtectedRoute>
  );
}
