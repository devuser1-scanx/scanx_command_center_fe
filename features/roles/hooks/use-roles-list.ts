// features/roles/hooks/use-roles-list.ts

import { useQuery } from "@tanstack/react-query";

import { listRoles, type Role } from "@/features/roles/api/roles-api";
import { normalizeApiError } from "@/lib/api/api-error";

export function useRolesList() {
  return useQuery<Role[], Error>({
    queryKey: ["roles", "list"] as const,

    queryFn: async () => {
      try {
        return await listRoles();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load roles.");
      }
    },

    staleTime: 60_000,
  });
}
