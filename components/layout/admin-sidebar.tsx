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
import { SCANX_LOGO_BASE64 } from "@/lib/constants/branding";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const mainNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    href: "/admin/patients",
    icon: Search,
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: ClipboardList,
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },
  {
    label: "Calls",
    href: "/admin/calls",
    icon: Phone,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    label: "Cases & Tasks",
    href: "/admin/cases",
    icon: Activity,
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

import { useState } from "react";
import Image from "next/image";
// ...
export function AdminSidebar() {
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className="hidden min-h-screen w-[260px] shrink-0 flex-col bg-[#111827] text-white lg:flex">
      <div className="flex h-[65px] items-center justify-center border-b border-white/10 px-5">
        {logoError ? (
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-white">
              Scan
            </span>
            <span className="text-[#8b6f47]">
              X
            </span>
          </div>
        ) : (
          <Image
            src={`data:image/png;base64,${SCANX_LOGO_BASE64}`}
            alt="ScanX Logo"
            width={150}
            height={32}
            className="object-contain invert brightness-200"
            priority
            onError={() => setLogoError(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#b9b2a8]">
            Operations
          </p>

          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
              />
            ))}
          </nav>
        </div>

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

        <div className="mt-auto border-t border-white/10 pt-4">
          <SidebarLink
            item={{
              label: "Settings",
              href: "/admin/settings",
              icon: Settings,
            }}
          />
        </div>
      </div>
    </aside>
  );
}