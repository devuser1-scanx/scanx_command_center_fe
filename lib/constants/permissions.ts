import type { Permission } from "@/features/auth/types/auth-types";

export const PERMISSIONS = {
  APPOINTMENTS_UPDATE: "appointments.update" as Permission,
} as const;
