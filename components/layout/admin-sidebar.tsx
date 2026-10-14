// components/layout/admin-sidebar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ChartLine,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderOpen,
  Inbox,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Phone,
  PhoneCall,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useFaxPortalCounts } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import { SCANX_LOGO_WHITE_BASE64 } from "@/lib/constants/branding";
import { useAuthStore } from "@/lib/auth/auth-store";
import { FAX_PORTAL_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  disabled?: boolean;
  /**
   * Which FAX Portal badge count (GET /fax-portal/counts) to show.
   */
  badge?: "call_queue" | "intake_review";
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

/**
 * Sales & FAX Referrals. Roles that see this section: the same ones the
 * backend allows (app/api/dependencies/fax_portal.py).
 */
const FAX_PORTAL_ROLES = ["admin", "front_desk", "sales"];

const FAX_PORTAL_PREFIX = "/fax-portal";

const faxPortalNavItems: AdminNavItem[] = [
  {
    label: "Referral Board",
    href: FAX_PORTAL_ROUTES.board,
    icon: Kanban,
  },
  {
    label: "My Call Queue",
    href: FAX_PORTAL_ROUTES.queue,
    icon: PhoneCall,
    badge: "call_queue",
  },
  {
    label: "Intake Review",
    href: FAX_PORTAL_ROUTES.intake,
    icon: ClipboardCheck,
    badge: "intake_review",
  },
  {
    label: "Referral Case",
    href: FAX_PORTAL_ROUTES.case,
    icon: FolderOpen,
  },
  {
    label: "Referral Insights",
    href: FAX_PORTAL_ROUTES.insights,
    icon: ChartLine,
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

function CountBadge({ count }: { count: number | undefined }) {
  if (!count) {
    return null;
  }

  return (
    <span
      aria-label={`${count} waiting`}
      className="min-w-5 rounded-full bg-[#c0392b] px-1.5 py-0.5 text-center text-[10px] leading-none font-bold text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SidebarLink({
  item,
  nested = false,
  badgeCount,
}: {
  item: AdminNavItem;
  nested?: boolean;
  badgeCount?: number;
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
        className={cn(
          "flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#6b6459] opacity-50",
          nested && "ml-4",
        )}
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
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        nested && "ml-4",
        isActive
          ? "bg-[#8b6f47] text-white"
          : "text-[#d8d2c7] hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      <CountBadge count={badgeCount} />
    </Link>
  );
}

function FaxPortalGroup() {
  const pathname = usePathname();
  const counts = useFaxPortalCounts().data;

  const isGroupActive =
    pathname === FAX_PORTAL_PREFIX ||
    pathname.startsWith(`${FAX_PORTAL_PREFIX}/`);

  // The group opens by itself whenever one of its routes becomes active;
  // after that it can still be collapsed or expanded by hand.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [wasGroupActive, setWasGroupActive] = useState(isGroupActive);

  if (wasGroupActive !== isGroupActive) {
    setWasGroupActive(isGroupActive);
    setManualOpen(null);
  }

  const isOpen = manualOpen ?? isGroupActive;
  const totalWaiting =
    (counts?.call_queue ?? 0) + (counts?.intake_review ?? 0);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="fax-portal-submenu"
        onClick={() => setManualOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          isGroupActive && !isOpen
            ? "bg-[#8b6f47] text-white"
            : "text-[#d8d2c7] hover:bg-white/10 hover:text-white",
        )}
      >
        <Inbox className="size-4 shrink-0" />
        <span className="flex-1 text-left">FAX Portal</span>

        {!isOpen && <CountBadge count={totalWaiting} />}

        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <nav
          id="fax-portal-submenu"
          aria-label="FAX Portal"
          className="mt-1 space-y-1"
        >
          {faxPortalNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              nested
              badgeCount={item.badge ? counts?.[item.badge] : undefined}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const canSeeOperations =
    user?.role === "admin" || user?.role === "front_desk";
  const canSeeFaxPortal =
    user !== null && FAX_PORTAL_ROLES.includes(user.role);

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
        {canSeeOperations && (
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
        )}

        {canSeeFaxPortal && (
          <div className={canSeeOperations ? "mt-8" : undefined}>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#b9b2a8]">
              Sales
            </p>

            <FaxPortalGroup />
          </div>
        )}

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
