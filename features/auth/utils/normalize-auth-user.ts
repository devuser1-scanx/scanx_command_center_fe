import type {
  AuthUser,
  BackendClinicAccess,
  CurrentUserResponse,
  UserRole,
} from "@/features/auth/types/auth-types";
import { ApiError } from "@/lib/api/api-error";

const SUPPORTED_ROLES: UserRole[] = [
  "admin",
  "front_desk",
  "sonographer",
  "sales",
];

function normalizeRoleCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function getPrimaryRole(
  response: CurrentUserResponse,
): UserRole {
  const roleCodes = response.roles.map((role) =>
    normalizeRoleCode(role.code),
  );

  /**
   * Role priority matters when a user has multiple roles.
   */
  const rolePriority: UserRole[] = [
    "admin",
    "front_desk",
    "sonographer",
    "sales",
  ];

  const matchedRole = rolePriority.find((role) =>
    roleCodes.includes(role),
  );

  if (!matchedRole) {
    throw new ApiError({
      message:
        "Your account does not have a supported Command Center role.",
      status: 403,
      code: "SUPPORTED_ROLE_MISSING",
      details: response.roles,
    });
  }

  return matchedRole;
}

function getClinicId(
  access: BackendClinicAccess,
): number | string | null {
  if (access.clinic_id !== undefined) {
    return access.clinic_id;
  }

  if (access.clinic?.id !== undefined) {
    return access.clinic.id;
  }

  if (access.id !== undefined) {
    return access.id;
  }

  return null;
}

export function normalizeAuthUser(
  response: CurrentUserResponse,
): AuthUser {
  const clinicIds = response.clinic_access
    .map(getClinicId)
    .filter(
      (
        clinicId,
      ): clinicId is number | string =>
        clinicId !== null,
    );

  return {
    id: response.id,
    email: response.email,
    first_name: response.first_name,
    last_name: response.last_name,
    full_name: [
      response.first_name,
      response.last_name,
    ]
      .filter(Boolean)
      .join(" "),
    phone: response.phone ?? null,

    role: getPrimaryRole(response),
    roles: response.roles,

    permissions: Array.isArray(response.permissions)
      ? response.permissions
      : [],

    status: response.is_active
      ? "active"
      : "inactive",

    is_active: response.is_active,

    must_change_password:
      response.must_change_password,

    last_login_at:
      response.last_login_at ?? null,

    clinic_id: clinicIds[0] ?? null,
    clinic_ids: clinicIds,
    clinic_access:
      response.clinic_access ?? [],
  };
}