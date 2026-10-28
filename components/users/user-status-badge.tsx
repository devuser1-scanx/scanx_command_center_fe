// components/users/user-status-badge.tsx

import type { CommandCenterUser } from "@/features/users/api/users-api";
import { cn } from "@/lib/utils";

/** True while the account is locked after too many failed sign-ins. */
export function isUserLocked(user: Pick<CommandCenterUser, "lockedUntil">) {
  return (
    user.lockedUntil !== null && new Date(user.lockedUntil).getTime() > Date.now()
  );
}

const badgeClasses =
  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase whitespace-nowrap";

/** Active / Inactive, plus Locked and the pending-first-login note when they apply. */
export function UserStatusBadge({ user }: { user: CommandCenterUser }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          badgeClasses,
          user.isActive
            ? "bg-[#e5f3ea] text-[#2f7d5c]"
            : "bg-[#f3e5e5] text-[#a4372f]",
        )}
      >
        {user.isActive ? "Active" : "Inactive"}
      </span>

      {isUserLocked(user) ? (
        <span className={cn(badgeClasses, "bg-[#fbf0dc] text-[#9a6a12]")}>
          Locked
        </span>
      ) : null}

      {user.mustChangePassword ? (
        <span className="text-[10px] font-semibold uppercase text-[#999999]">
          Pending first login
        </span>
      ) : null}
    </span>
  );
}
