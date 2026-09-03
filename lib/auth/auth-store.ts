// lib/auth/auth-store.ts

import { create } from "zustand";

import type {
  AuthUser,
  LoginResponse,
} from "@/features/auth/types/auth-types";
import { tokenManager } from "@/lib/auth/token-manager";

type SetSessionPayload = {
  user: AuthUser;
  tokens: LoginResponse;
};

type AuthStore = {
  /**
   * Currently authenticated user.
   */
  user: AuthUser | null;

  /**
   * Also reflected in the store so React components can react to
   * authentication changes.
   *
   * Memory-only, same as tokenManager - the refresh token never enters
   * JS at all, so there's nothing to mirror here for it.
   */
  accessToken: string | null;

  /**
   * True after a valid user session has been loaded.
   */
  isAuthenticated: boolean;

  /**
   * False while the application is checking whether an existing session
   * can be restored.
   */
  isInitialized: boolean;

  /**
   * Store the user and access token after a successful login.
   */
  setSession: (payload: SetSessionPayload) => void;

  /**
   * Update the current user without replacing tokens.
   */
  setUser: (user: AuthUser | null) => void;

  /**
   * Replace the access token after a successful refresh request.
   */
  updateAccessToken: (accessToken: string) => void;

  /**
   * Mark authentication initialization as complete.
   */
  setInitialized: (initialized: boolean) => void;

  /**
   * Clear all user and token state.
   */
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setSession: ({ user, tokens }) => {
    tokenManager.setTokens({
      accessToken: tokens.access_token,
    });

    set({
      user,
      accessToken: tokens.access_token,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
    });
  },

  updateAccessToken: (accessToken) => {
    tokenManager.setTokens({ accessToken });

    set((state) => ({
      accessToken,
      isAuthenticated: Boolean(state.user),
    }));
  },

  setInitialized: (initialized) => {
    set({
      isInitialized: initialized,
    });
  },

  clearAuth: () => {
    tokenManager.clearTokens();

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));
