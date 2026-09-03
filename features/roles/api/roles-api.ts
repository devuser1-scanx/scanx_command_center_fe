// features/roles/api/roles-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export type Role = {
  id: number;
  code: string;
  name: string;
};

export async function listRoles(): Promise<Role[]> {
  return apiClient.get<Role[]>(API_ENDPOINTS.roles.list);
}
