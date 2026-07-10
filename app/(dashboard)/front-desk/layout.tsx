import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type FrontDeskLayoutProps = {
  children: ReactNode;
};

export default function FrontDeskLayout({
  children,
}: FrontDeskLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["front_desk"]}>
      {children}
    </ProtectedRoute>
  );
}
