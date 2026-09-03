// features/users/hooks/use-users-list.ts

import { useQuery } from "@tanstack/react-query";

import { listUsers, type UserList } from "@/features/users/api/users-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useUsersList(params: {
  search?: string;
  limit: number;
  offset: number;
}) {
  return useQuery<UserList, Error>({
    queryKey: [
      "users",
      "list",
      params.search ?? null,
      params.limit,
      params.offset,
    ] as const,

    queryFn: async () => {
      try {
        return await listUsers(params);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load users.");
      }
    },

    staleTime: 15_000,
  });
}
