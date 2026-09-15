// components/layout/admin-sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { SCANX_LOGO_WHITE_BASE64 } from "@/lib/constants/branding";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  disabled?: boolean;
};

const mainNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: Search,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: ClipboardList,
    disabled: true,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    disabled: true,
  },
  {
    label: "Calls",
    href: "/calls",
    icon: Phone,
    disabled: true,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    label: "Cases & Tasks",
    href: "/cases",
    icon: Activity,
    disabled: true,
  },
];

const adminNavItems: AdminNavItem[] = [
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Roles",
    href: "/admin/roles",
    icon: ShieldCheck,
  },
  {
    label: "Clinics",
    href: "/admin/clinics",
    icon: Building2,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
];

function SidebarLink({
  item,
}: {
  item: AdminNavItem;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        title="Under development"
        className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#6b6459] opacity-50"
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#8b6f47] text-white"
          : "text-[#d8d2c7] hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const logoSource = SCANX_LOGO_WHITE_BASE64
    ? SCANX_LOGO_WHITE_BASE64.startsWith("data:image/")
      ? SCANX_LOGO_WHITE_BASE64
      : `data:image/png;base64,${SCANX_LOGO_WHITE_BASE64}`
    : null;

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col self-start bg-[#111827] text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          {logoSource ? (
            <img
              src={logoSource}
              alt="ScanX"
              className="h-15 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">
                Scan
              </span>
              <span className="text-[#8b6f47]">
                X
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#b9b2a8]">
            Operations
          </p>

          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#b9b2a8]">
              Administration
            </p>

            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                />
              ))}
            </nav>
          </div>
        )}

        {isAdmin && (
          <div className="mt-auto border-t border-white/10 pt-4">
            <SidebarLink
              item={{
                label: "Settings",
                href: "/admin/settings",
                icon: Settings,
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}