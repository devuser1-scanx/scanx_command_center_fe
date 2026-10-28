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
  /** Set while the account is locked after too many failed sign-ins. */
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  roles: UserRoleItem[];
};

export type UpdateUserInput = {
  firstName: string;
  lastName: string;
  /** An empty string clears the phone number. */
  phone: string;
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
  locked_until: string | null;
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
    lockedUntil: item.locked_until,
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

export async function getUser(userId: number): Promise<CommandCenterUser> {
  const response = await apiClient.get<ApiCommandCenterUser>(
    API_ENDPOINTS.users.detail(String(userId)),
  );

  return mapUser(response);
}

export async function updateUser(
  userId: number,
  input: UpdateUserInput,
): Promise<CommandCenterUser> {
  const response = await apiClient.patch<ApiCommandCenterUser>(
    API_ENDPOINTS.users.detail(String(userId)),
    {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    },
  );

  return mapUser(response);
}

export async function setUserStatus(
  userId: number,
  isActive: boolean,
): Promise<CommandCenterUser> {
  const response = await apiClient.put<ApiCommandCenterUser>(
    API_ENDPOINTS.users.status(String(userId)),
    { is_active: isActive },
  );

  return mapUser(response);
}

export async function assignUserRoles(
  userId: number,
  roleCodes: string[],
): Promise<CommandCenterUser> {
  const response = await apiClient.put<ApiCommandCenterUser>(
    API_ENDPOINTS.users.assignRole(String(userId)),
    { role_codes: roleCodes },
  );

  return mapUser(response);
}

export async function unlockUser(userId: number): Promise<CommandCenterUser> {
  const response = await apiClient.post<ApiCommandCenterUser>(
    API_ENDPOINTS.users.unlock(String(userId)),
  );

  return mapUser(response);
}

/** Emails the user a new temporary password (they must change it at sign-in). */
export function resetUserPassword(userId: number): Promise<void> {
  return apiClient.post<void>(API_ENDPOINTS.users.resetPassword(String(userId)));
}

export function deleteUser(userId: number): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.users.detail(String(userId)));
}
