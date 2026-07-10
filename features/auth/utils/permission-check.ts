import type {
  AuthUser,
  Permission,
} from "@/features/auth/types/auth-types";

export function hasPermission(
  user: AuthUser | null,
  permission: Permission,
): boolean {
  if (!user || !user.is_active || user.status !== "active") {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: AuthUser | null,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) =>
    hasPermission(user, permission),
  );
}

export function hasEveryPermission(
  user: AuthUser | null,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) =>
    hasPermission(user, permission),
  );
}
