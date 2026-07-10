import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f1e8]">
        {children}
      </div>
    </ProtectedRoute>
  );
}
