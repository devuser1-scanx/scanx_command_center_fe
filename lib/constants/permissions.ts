// lib/constants/permissions.ts

export const PERMISSIONS = {
  APPOINTMENTS_UPDATE: "appointments.update",
  CALLS_CREATE: "calls.create",
  MESSAGES_SEND: "messages.send",
} as const;

/**
 * The permission that gates each sidebar module. The backend grants these
 * to roles in the database (migration 0019); a role sees a module when it
 * holds the module's permission, and Admin holds all of them.
 *
 * Roles: Sales Agent has Dashboard, Messages, Calls, Reports, Patients and
 * FAX Portal; Sonographer has Dashboard, Messages, Calls, Reports and
 * Patients; Admin has everything, including the Administration section
 * (Users, Roles, Clinics, Notifications, Settings), which is
 * gated by the admin role itself.
 */
export const MODULE_PERMISSIONS = {
  dashboard: "dashboard.view",
  messages: "messages.view",
  calls: "calls.view",
  reports: "reports.view",
  patients: "patients.search",
  faxPortal: "fax_portal.access",
} as const;
