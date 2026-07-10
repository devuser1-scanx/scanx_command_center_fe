import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type SalesLayoutProps = {
  children: ReactNode;
};

export default function SalesLayout({
  children,
}: SalesLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["sales"]}>
      {children}
    </ProtectedRoute>
  );
}
