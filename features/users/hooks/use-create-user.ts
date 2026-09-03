// features/users/hooks/use-create-user.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createUser,
  type CommandCenterUser,
  type CreateUserInput,
} from "@/features/users/api/users-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<CommandCenterUser, Error, CreateUserInput>({
    mutationFn: async (input) => {
      try {
        return await createUser(input);
      } catch (error) {
        throw normalizeApiError(error, "Unable to create the user.");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
