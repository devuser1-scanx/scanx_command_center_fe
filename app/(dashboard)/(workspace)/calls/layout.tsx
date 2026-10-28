// app/(dashboard)/(workspace)/calls/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CallsSection } from "@/features/calls/calls-section";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type CallsLayoutProps = {
  children: ReactNode;
};

/**
 * The Calls module (Dashboard, Dialer, Patients, Call History) - needs the
 * calls permission. The call itself lives above, in the DialerProvider of
 * app/(dashboard)/layout.tsx, so it survives leaving these pages.
 */
export default function CallsLayout({ children }: CallsLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.calls]}>
      <CallsSection>{children}</CallsSection>
    </ProtectedRoute>
  );
}
