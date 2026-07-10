"use client";

import type { UserRole } from "@/features/auth/types/auth-types";
import { useAuthStore } from "@/lib/auth/auth-store";

export function useRole() {
  const role = useAuthStore((state) => state.user?.role ?? null);

  function hasRole(requiredRole: UserRole): boolean {
    return role === requiredRole;
  }

  function hasAnyRole(requiredRoles: UserRole[]): boolean {
    return role !== null && requiredRoles.includes(role);
  }

  return {
    role,
    hasRole,
    hasAnyRole,
  };
}
