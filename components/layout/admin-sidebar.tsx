// components/layout/admin-sidebar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChartLine,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderOpen,
  History,
  Inbox,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useFaxPortalCounts } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import { usePermission } from "@/hooks/use-permission";
import { SCANX_LOGO_WHITE_BASE64 } from "@/lib/constants/branding";
import { useAuthStore } from "@/lib/auth/auth-store";
import {
  MODULE_PERMISSIONS,
  PERMISSIONS,
} from "@/lib/constants/permissions";
import { CALLS_ROUTES, FAX_PORTAL_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  disabled?: boolean;
  /**
   * The permission a user needs to see this item (see
   * lib/constants/permissions.ts). Items without one are always shown.
   */
  permission?: string;
  /**
   * Active only on this exact path, not on pages beneath it (a group's first
   * item shares its prefix with the rest of the group).
   */
  exact?: boolean;
  /**
   * Renders as an expandable group of sub-items instead of a plain link.
   */
  group?: "calls";
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
    permission: MODULE_PERMISSIONS.dashboard,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: Search,
    permission: MODULE_PERMISSIONS.patients,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    disabled: true,
    permission: MODULE_PERMISSIONS.messages,
  },
  {
    label: "Calls",
    href: CALLS_ROUTES.dashboard,
    icon: Phone,
    group: "calls",
    permission: MODULE_PERMISSIONS.calls,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    permission: MODULE_PERMISSIONS.reports,
  },
];

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

const CALLS_PREFIX = "/calls";

const callsNavItems: AdminNavItem[] = [
  {
    label: "Dialer",
    href: CALLS_ROUTES.dialer,
    icon: PhoneOutgoing,
    permission: PERMISSIONS.CALLS_CREATE,
  },
  {
    label: "Call History",
    href: CALLS_ROUTES.history,
    icon: History,
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
    disabled: true,
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
  onNavigate,
}: {
  item: AdminNavItem;
  nested?: boolean;
  badgeCount?: number;
  /** Called when the link is followed (closes the slide-out menu). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    (!item.exact && pathname.startsWith(`${item.href}/`));

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
      onClick={onNavigate}
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

type NavGroupProps = {
  /** Used for the sub-menu's element id. */
  id: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  /** The group is active (and opens itself) on this path and everything under it. */
  prefix: string;
  items: AdminNavItem[];
  /** Counts for the items' `badge`s. */
  counts?: Partial<Record<NonNullable<AdminNavItem["badge"]>, number>>;
  /** Shown on the collapsed group header. */
  totalBadge?: number;
  onNavigate?: () => void;
};

function NavGroup({
  id,
  label,
  icon: Icon,
  prefix,
  items,
  counts,
  totalBadge,
  onNavigate,
}: NavGroupProps) {
  const pathname = usePathname();

  const isGroupActive =
    pathname === prefix || pathname.startsWith(`${prefix}/`);

  // The group opens by itself whenever one of its routes becomes active;
  // after that it can still be collapsed or expanded by hand.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [wasGroupActive, setWasGroupActive] = useState(isGroupActive);

  if (wasGroupActive !== isGroupActive) {
    setWasGroupActive(isGroupActive);
    setManualOpen(null);
  }

  const isOpen = manualOpen ?? isGroupActive;
  const submenuId = `${id}-submenu`;

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        onClick={() => setManualOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          isGroupActive && !isOpen
            ? "bg-[#8b6f47] text-white"
            : "text-[#d8d2c7] hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>

        {!isOpen && <CountBadge count={totalBadge} />}

        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <nav
          id={submenuId}
          aria-label={label}
          className="mt-1 space-y-1"
        >
          {items.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              nested
              badgeCount={item.badge ? counts?.[item.badge] : undefined}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function FaxPortalGroup({ onNavigate }: { onNavigate?: () => void }) {
  const counts = useFaxPortalCounts().data;

  return (
    <NavGroup
      id="fax-portal"
      label="FAX Portal"
      icon={Inbox}
      prefix={FAX_PORTAL_PREFIX}
      items={faxPortalNavItems}
      counts={counts}
      totalBadge={(counts?.call_queue ?? 0) + (counts?.intake_review ?? 0)}
      onNavigate={onNavigate}
    />
  );
}

function CallsGroup({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission } = usePermission();

  return (
    <NavGroup
      id="calls"
      label="Calls"
      icon={Phone}
      prefix={CALLS_PREFIX}
      items={callsNavItems.filter(
        (item) => !item.permission || hasPermission(item.permission),
      )}
      onNavigate={onNavigate}
    />
  );
}

/**
 * The logo and every navigation group the signed-in role may see. Used by
 * the fixed sidebar (large screens) and the slide-out menu (small screens).
 */
export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((state) => state.user);
  const { hasPermission } = usePermission();
  const isAdmin = user?.role === "admin";
  const visibleMainNavItems = mainNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );
  const canSeeOperations = visibleMainNavItems.length > 0;
  const canSeeFaxPortal = hasPermission(MODULE_PERMISSIONS.faxPortal);

  const logoSource = SCANX_LOGO_WHITE_BASE64
    ? SCANX_LOGO_WHITE_BASE64.startsWith("data:image/")
      ? SCANX_LOGO_WHITE_BASE64
      : `data:image/png;base64,${SCANX_LOGO_WHITE_BASE64}`
    : null;

  return (
    <>
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
              {visibleMainNavItems.map((item) =>
                item.group === "calls" ? (
                  <CallsGroup key={item.href} onNavigate={onNavigate} />
                ) : (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    onNavigate={onNavigate}
                  />
                ),
              )}
            </nav>
          </div>
        )}

        {canSeeFaxPortal && (
          <div className={canSeeOperations ? "mt-8" : undefined}>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#b9b2a8]">
              Sales
            </p>

            <FaxPortalGroup onNavigate={onNavigate} />
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
                  onNavigate={onNavigate}
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
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>
    </>
  );
}

/** The fixed sidebar for large screens; smaller screens use MobileSidebar. */
export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col self-start bg-[#111827] text-white lg:flex">
      <SidebarBody />
    </aside>
  );
}
