import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type SonographerLayoutProps = {
  children: ReactNode;
};

export default function SonographerLayout({
  children,
}: SonographerLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["sonographer"]}>
      {children}
    </ProtectedRoute>
  );
}
