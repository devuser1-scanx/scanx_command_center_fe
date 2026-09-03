// components/auth/auth-initializer.tsx

"use client";

import { useEffect, type ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/lib/auth/auth-store";

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
      /**
       * No session cookie, or an expired/invalid one - either way there
       * is nothing to restore.
       */
      clearAuth();
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
