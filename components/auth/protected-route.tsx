"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AUTHENTICATED_ROUTES,
  PUBLIC_ROUTES,
} from "@/lib/constants/routes";
import type {
  Permission,
  UserRole,
} from "@/features/auth/types/auth-types";
import {
  hasEveryPermission,
} from "@/features/auth/utils/permission-check";
import { useAuthStore } from "@/lib/auth/auth-store";


type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  const hasAllowedRole =
    !allowedRoles ||
    (user !== null && allowedRoles.includes(user.role));

  const hasRequiredPermissions =
    requiredPermissions.length === 0 ||
    hasEveryPermission(user, requiredPermissions);

  const isActiveUser =
    user !== null &&
    user.is_active &&
    user.status === "active";

  const isAllowed =
    isAuthenticated &&
    isActiveUser &&
    hasAllowedRole &&
    hasRequiredPermissions;

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`${PUBLIC_ROUTES.login}?next=${next}`);
      return;
    }

    if (
      user.must_change_password &&
      pathname !== AUTHENTICATED_ROUTES.changePassword
    ) {
      router.replace(
        AUTHENTICATED_ROUTES.changePassword,
      );

      return;
    }

    if (!isAllowed) {
      router.replace(PUBLIC_ROUTES.unauthorized);
    }
  }, [
    isAllowed,
    isAuthenticated,
    isInitialized,
    pathname,
    router,
    user,
  ]);

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  if (!isAllowed) {
    return <AuthLoadingScreen />;
  }

  return children;
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3"
      >
        <div className="size-8 animate-spin rounded-full border-4 border-[#dddddd] border-t-[#8b6f47]" />
        <p className="text-sm text-[#6f5636]">
          Verifying your access...
        </p>
      </div>
    </main>
  );
}
