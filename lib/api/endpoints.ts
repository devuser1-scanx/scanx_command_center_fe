// lib/api/endpoints.ts

export const API_ENDPOINTS = {
  health: "/health",
  ready: "/ready",

  auth: {
    login: "/auth/login",
    token: "/auth/token",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    changePassword: "/auth/change-password",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  users: {
    list: "/users",
    create: "/users",

    detail: (userId: string) =>
      `/users/${encodeURIComponent(userId)}`,

    activate: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/activate`,

    deactivate: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/deactivate`,

    resetPassword: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/reset-password`,

    assignRole: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/roles`,

    assignClinic: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/clinics`,
  },

  roles: {
    list: "/roles",
    create: "/roles",

    detail: (roleId: string) =>
      `/roles/${encodeURIComponent(roleId)}`,

    permissions: (roleId: string) =>
      `/roles/${encodeURIComponent(roleId)}/permissions`,
  },

  permissions: {
    list: "/permissions",
  },

  clinics: {
    list: "/clinics",
    create: "/clinics",

    detail: (clinicId: string) =>
      `/clinics/${encodeURIComponent(clinicId)}`,
  },

  appointments: {
    list: "/appointments",

    detail: (appointmentId: string) =>
      `/appointments/${encodeURIComponent(
        appointmentId,
      )}`,
  },

  patients: {
    search: "/patients/search",

    detail: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}`,

    sendFax: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/fax`,

    faxReportLookup: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/fax/report`,

    sendMail: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/mail`,

    sendSms: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/sms`,

    smsPrefill: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/sms/prefill`,
  },

  dashboard: {
    summary: "/dashboard/summary",
    timeline: "/dashboard/timeline",
    actionItems: "/dashboard/action-items",
  },
} as const;