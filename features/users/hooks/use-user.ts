// features/users/hooks/use-user.ts

import { useQuery } from "@tanstack/react-query";

import { getUser, type CommandCenterUser } from "@/features/users/api/users-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useUser(userId: number) {
  return useQuery<CommandCenterUser, Error>({
    queryKey: ["users", "detail", userId] as const,

    queryFn: async () => {
      try {
        return await getUser(userId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the user.");
      }
    },

    staleTime: 15_000,
  });
}
