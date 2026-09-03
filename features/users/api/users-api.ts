// features/users/api/users-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export type UserRoleItem = {
  id: number;
  code: string;
  name: string;
};

export type CommandCenterUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: UserRoleItem[];
};

export type UserList = {
  items: CommandCenterUser[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleCodes: string[];
};

type ApiUserRoleItem = {
  id: number;
  code: string;
  name: string;
};

type ApiCommandCenterUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
  roles: ApiUserRoleItem[];
};

type ApiUserList = {
  items: ApiCommandCenterUser[];
  total: number;
  limit: number;
  offset: number;
};

function mapUser(item: ApiCommandCenterUser): CommandCenterUser {
  return {
    id: item.id,
    email: item.email,
    firstName: item.first_name,
    lastName: item.last_name,
    phone: item.phone,
    isActive: item.is_active,
    mustChangePassword: item.must_change_password,
    lastLoginAt: item.last_login_at,
    createdAt: item.created_at,
    roles: item.roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
    })),
  };
}

export async function listUsers(params: {
  search?: string;
  limit: number;
  offset: number;
}): Promise<UserList> {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));

  const response = await apiClient.get<ApiUserList>(
    `${API_ENDPOINTS.users.list}?${query.toString()}`,
  );

  return {
    items: response.items.map(mapUser),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

export async function createUser(
  input: CreateUserInput,
): Promise<CommandCenterUser> {
  const response = await apiClient.post<ApiCommandCenterUser>(
    API_ENDPOINTS.users.create,
    {
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || undefined,
      role_codes: input.roleCodes,
    },
  );

  return mapUser(response);
}
