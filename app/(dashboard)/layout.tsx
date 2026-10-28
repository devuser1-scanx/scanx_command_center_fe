import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DialerProvider } from "@/features/calls/providers/dialer-provider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      {/* Above every page, so a phone call carries on while the person moves
          between Command Center pages. */}
      <DialerProvider>
        <div className="min-h-screen bg-[#f5f1e8]">
          {children}
        </div>
      </DialerProvider>
    </ProtectedRoute>
  );
}
