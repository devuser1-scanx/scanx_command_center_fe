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

type UpdateTokensPayload = {
  accessToken: string;
  refreshToken?: string | null;
};

type AuthStore = {
  /**
   * Currently authenticated user.
   */
  user: AuthUser | null;

  /**
   * Tokens are also reflected in the store so React components can react
   * to authentication changes.
   *
   * The access token remains memory-only.
   */
  accessToken: string | null;
  refreshToken: string | null;

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
   * Store the user and tokens after a successful login.
   */
  setSession: (payload: SetSessionPayload) => void;

  /**
   * Update the current user without replacing tokens.
   */
  setUser: (user: AuthUser | null) => void;

  /**
   * Replace tokens after a successful refresh request.
   */
  updateTokens: (payload: UpdateTokensPayload) => void;

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
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setSession: ({ user, tokens }) => {
    tokenManager.setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    set({
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
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

  updateTokens: ({
    accessToken,
    refreshToken,
  }) => {
    tokenManager.setTokens({
      accessToken,
      refreshToken,
    });

    set((state) => ({
      accessToken,
      refreshToken:
        refreshToken !== undefined
          ? refreshToken
          : state.refreshToken,
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
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));