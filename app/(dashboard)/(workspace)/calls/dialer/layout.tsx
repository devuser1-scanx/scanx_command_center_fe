// app/(dashboard)/(workspace)/calls/dialer/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PERMISSIONS } from "@/lib/constants/permissions";

type DialerLayoutProps = {
  children: ReactNode;
};

/** Placing calls needs calls.create on top of the Calls module's permission. */
export default function DialerLayout({ children }: DialerLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.CALLS_CREATE]}>
      {children}
    </ProtectedRoute>
  );
}
