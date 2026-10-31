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
    sessionPolicy: "/auth/session-policy",
    changePassword: "/auth/change-password",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  users: {
    list: "/users",
    create: "/users",

    detail: (userId: string) =>
      `/users/${encodeURIComponent(userId)}`,

    status: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/status`,

    unlock: (userId: string) =>
      `/users/${encodeURIComponent(userId)}/unlock`,

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

    manualCheckIn: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/manual-check-in`,

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

    reportLink: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/report-link`,

    rescheduleLink: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/reschedule-link`,

    pcpFormLink: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/pcp-form-link`,

    scrotalFormLink: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/scrotal-form-link`,

    transvagFormLink: (patientId: string) =>
      `/patients/${encodeURIComponent(patientId)}/transvag-form-link`,
  },

  reports: {
    groups: "/reports/groups",

    groupFiles: (groupId: string) =>
      `/reports/groups/${encodeURIComponent(groupId)}/files`,

    fileContent: (groupId: string, fileId: string, mode: "inline" | "attachment") =>
      `/reports/groups/${encodeURIComponent(groupId)}/files/${encodeURIComponent(fileId)}/content?mode=${mode}`,
  },

  faxPortal: {
    board: "/fax-portal/board",
    counts: "/fax-portal/counts",
    agents: "/fax-portal/agents",

    moveReferral: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/move`,

    assignReferral: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/assign`,

    intakeQueue: "/fax-portal/intake/queue",
    callQueue: "/fax-portal/queue",

    intakeDetail: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/intake`,

    markViewed: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/viewed`,

    faxPdf: (faxId: number) => `/fax-portal/faxes/${faxId}/pdf`,

    searchReferrals: "/fax-portal/referrals/search",

    caseDetail: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/case`,

    startCall: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/calls`,

    dialPatient: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/calls/dial`,

    abandonCall: (callId: number) => `/fax-portal/calls/${callId}/abandon`,

    callResult: (callId: number) => `/fax-portal/calls/${callId}/result`,

    doNotCall: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/do-not-call`,

    messageTemplates: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/message-templates`,

    sendMessage: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/messages`,

    bookingInfo: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/booking`,

    directBookingDates: (referralId: number, month: string) =>
      `/fax-portal/referrals/${referralId}/direct-booking/dates?month=${month}`,

    directBookingTimes: (referralId: number, date: string) =>
      `/fax-portal/referrals/${referralId}/direct-booking/times?date=${date}`,

    faxBack: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/fax-back`,

    directBook: (referralId: number) =>
      `/fax-portal/referrals/${referralId}/direct-booking`,

    acuityCalendars: "/fax-portal/acuity/calendars",
    acuityAppointmentTypes: "/fax-portal/acuity/appointment-types",
    acuityStatus: "/fax-portal/acuity/status",
    acuityRefresh: "/fax-portal/acuity/refresh",
  },

  dashboard: {
    summary: "/dashboard/summary",
    timeline: "/dashboard/timeline",
    actionItems: "/dashboard/action-items",
  },

  /** The Calls module (the Web Dialer). */
  calls: {
    summary: "/calls/summary",
    recent: "/calls/recent",
    missed: "/calls/missed",
    searchPatients: "/calls/patients/search",
    patientCallHistory: "/calls/patients/call-history",
    dial: "/calls/dial",

    ended: (callId: number) => `/calls/${callId}/ended`,
  },

  /** The Messages module (the Patient Inbox). */
  inbox: {
    conversations: "/inbox/conversations",
    newConversation: "/inbox/conversations/new",
    catalog: "/inbox/catalog",
    sendRcsCard: "/inbox/send-rcs-card",
    sendMissedCallCard: "/inbox/send-missed-call-card",
    sendGenericSalesCard: "/inbox/send-generic-sales-card",

    conversation: (conversationId: string) =>
      `/inbox/conversations/${encodeURIComponent(conversationId)}`,

    messages: (conversationId: string) =>
      `/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,

    read: (conversationId: string) =>
      `/inbox/conversations/${encodeURIComponent(conversationId)}/read`,

    reply: (conversationId: string) =>
      `/inbox/conversations/${encodeURIComponent(conversationId)}/reply`,
  },
} as const;