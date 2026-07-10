"use client";

import type { Permission } from "@/features/auth/types/auth-types";
import {
  hasAnyPermission,
  hasEveryPermission,
  hasPermission,
} from "@/features/auth/utils/permission-check";
import { useAuthStore } from "@/lib/auth/auth-store";

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  return {
    hasPermission: (permission: Permission) =>
      hasPermission(user, permission),

    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(user, permissions),

    hasEveryPermission: (permissions: Permission[]) =>
      hasEveryPermission(user, permissions),
  };
}
