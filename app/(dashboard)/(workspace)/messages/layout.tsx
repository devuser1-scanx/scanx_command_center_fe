// app/(dashboard)/(workspace)/messages/layout.tsx

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MODULE_PERMISSIONS } from "@/lib/constants/permissions";

type MessagesLayoutProps = {
  children: ReactNode;
};

/** The Messages module (the Patient Inbox) - needs the messages permission. */
export default function MessagesLayout({ children }: MessagesLayoutProps) {
  return (
    <ProtectedRoute requiredPermissions={[MODULE_PERMISSIONS.messages]}>
      {children}
    </ProtectedRoute>
  );
}
