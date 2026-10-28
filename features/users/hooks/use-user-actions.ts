// features/users/hooks/use-user-actions.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignUserRoles,
  deleteUser,
  resetUserPassword,
  setUserStatus,
  unlockUser,
  updateUser,
  type CommandCenterUser,
  type UpdateUserInput,
} from "@/features/users/api/users-api";
import { normalizeApiError } from "@/lib/api/api-error";

/**
 * One mutation per change to an existing user. Each one refreshes the users
 * list and the user's own detail, so every screen shows the new state.
 */
export function useUserActions(userId: number) {
  const queryClient = useQueryClient();

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  const update = useMutation<CommandCenterUser, Error, UpdateUserInput>({
    mutationFn: async (input) => {
      try {
        return await updateUser(userId, input);
      } catch (error) {
        throw normalizeApiError(error, "Unable to save the changes.");
      }
    },
    onSuccess: refresh,
  });

  const setStatus = useMutation<CommandCenterUser, Error, boolean>({
    mutationFn: async (isActive) => {
      try {
        return await setUserStatus(userId, isActive);
      } catch (error) {
        throw normalizeApiError(error, "Unable to change the account status.");
      }
    },
    onSuccess: refresh,
  });

  const assignRoles = useMutation<CommandCenterUser, Error, string[]>({
    mutationFn: async (roleCodes) => {
      try {
        return await assignUserRoles(userId, roleCodes);
      } catch (error) {
        throw normalizeApiError(error, "Unable to update the roles.");
      }
    },
    onSuccess: refresh,
  });

  const unlock = useMutation<CommandCenterUser, Error, void>({
    mutationFn: async () => {
      try {
        return await unlockUser(userId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to unlock the account.");
      }
    },
    onSuccess: refresh,
  });

  const resetPassword = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await resetUserPassword(userId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to reset the password.");
      }
    },
    onSuccess: refresh,
  });

  const remove = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await deleteUser(userId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to delete the user.");
      }
    },
    onSuccess: () => {
      // The user no longer exists: drop its detail instead of refetching it.
      queryClient.removeQueries({ queryKey: ["users", "detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });

  return { update, setStatus, assignRoles, unlock, resetPassword, remove };
}
