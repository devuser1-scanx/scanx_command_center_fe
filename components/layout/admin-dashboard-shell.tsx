// components/layout/admin-dashboard-shell.tsx

"use client";

import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/lib/auth/auth-store";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

type AdminDashboardShellProps = {
  children: React.ReactNode;
};

export function AdminDashboardShell({
  children,
}: AdminDashboardShellProps) {
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);

  const displayName =
    user?.full_name ||
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "Admin";

  return (
    <div className="flex min-h-screen bg-[#f5f1e8]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#e4ddd0] bg-[#f5f1e8]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">
                ScanX Command Center
              </h1>

              <p className="mt-1 text-sm text-[#777777]">
                Real-time Patient Timeline Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#777777] md:block">
                Search patient / phone / appointment ID
              </div>

              <span className="rounded-full bg-[#e6f7ed] px-3 py-1.5 text-xs font-semibold text-[#16803c]">
                Live: ON
              </span>

              <button
                type="button"
                className="rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
              >
                Refresh
              </button>

              <button
                type="button"
                className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636]"
              >
                New Case
              </button>

              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-[#2d2d2d]">
                  {displayName}
                </p>

                <p className="text-xs text-[#777777]">
                  Admin
                </p>
              </div>

              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutMutation.isPending
                  ? "Signing out..."
                  : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5">
          {children}
        </main>
      </div>
    </div>
  );
}