"use client";

import { useAuthStore } from "@/lib/auth/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  return {
    user,
    isAuthenticated,
    isInitialized,
  };
}
