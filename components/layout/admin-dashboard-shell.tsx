// components/layout/admin-dashboard-shell.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/lib/auth/auth-store";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

type AdminDashboardShellProps = {
  children: React.ReactNode;
};

const searchInputClasses =
  "w-full rounded-full border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none placeholder:text-[#777777] focus:border-[#8b6f47]";

export function AdminDashboardShell({
  children,
}: AdminDashboardShellProps) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmed = searchValue.trim();

    if (!trimmed) {
      return;
    }

    router.push(
      `/patients?q=${encodeURIComponent(trimmed)}`,
    );
  }

  const displayName =
    user?.full_name ||
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "Admin";

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    front_desk: "Front Desk",
    sonographer: "Sonographer",
    sales: "Sales",
  };

  const roleLabel = user ? (roleLabels[user.role] ?? user.role) : "Admin";

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f1e8]">
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />

        <MobileSidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#e4ddd0] bg-[#f5f1e8]/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  aria-haspopup="dialog"
                  className="shrink-0 rounded-md border border-[#dddddd] bg-white p-2 text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] lg:hidden"
                >
                  <Menu className="size-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold tracking-tight text-[#2d2d2d] sm:text-2xl">
                    ScanX Command Center
                  </h1>

                  <p className="mt-1 hidden text-sm text-[#777777] sm:block">
                    Real-time Patient Timeline Dashboard
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="hidden md:block"
                >
                  <input
                    value={searchValue}
                    onChange={(event) =>
                      setSearchValue(event.target.value)
                    }
                    placeholder="Search patient / phone / appointment ID"
                    aria-label="Search patient, phone or appointment ID"
                    className={`${searchInputClasses} md:w-56 xl:w-80`}
                  />
                </form>

                <span className="hidden rounded-full bg-[#e6f7ed] px-3 py-1.5 text-xs font-semibold text-[#16803c] sm:inline-block">
                  Live: ON
                </span>

                <button
                  type="button"
                  className="hidden rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a1a] md:inline-block"
                >
                  Refresh
                </button>

                <button
                  type="button"
                  className="hidden rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636] md:inline-block"
                >
                  New Case
                </button>

                <div className="hidden text-right lg:block">
                  <p className="text-sm font-semibold text-[#2d2d2d]">
                    {displayName}
                  </p>

                  <p className="text-xs text-[#777777]">
                    {roleLabel}
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

            {/* The search box moves to its own row where the header is narrow. */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-3 md:hidden"
            >
              <input
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                placeholder="Search patient / phone / appointment ID"
                aria-label="Search patient, phone or appointment ID"
                className={searchInputClasses}
              />
            </form>
          </header>

          <main className="min-w-0 flex-1 p-3 sm:p-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
