// components/auth/auth-initializer.tsx

"use client";

import { useEffect, type ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/lib/auth/auth-store";
import { tokenManager } from "@/lib/auth/token-manager";

type AuthInitializerProps = {
  children: ReactNode;
};

export function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const currentUserQuery = useCurrentUser();

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const setInitialized = useAuthStore(
    (state) => state.setInitialized,
  );

  const clearAuth = useAuthStore(
    (state) => state.clearAuth,
  );

  useEffect(() => {
    if (currentUserQuery.isSuccess) {
      setUser(currentUserQuery.data);
      setInitialized(true);
      return;
    }

    if (currentUserQuery.isError) {
      clearAuth();
      return;
    }

    /**
     * No tokens means there is no session to restore.
     *
     * Mark initialization complete immediately so public pages such as
     * /login are not kept in a loading state.
     */
    const hasSessionToken =
      tokenManager.hasAccessToken() ||
      tokenManager.hasRefreshToken();

    if (!hasSessionToken) {
      setInitialized(true);
    }
  }, [
    currentUserQuery.data,
    currentUserQuery.isError,
    currentUserQuery.isSuccess,
    setUser,
    setInitialized,
    clearAuth,
  ]);

  return children;
}