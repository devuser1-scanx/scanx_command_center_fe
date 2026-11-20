export const queryKeys = {
  patients: {
    all: ["patients"] as const,
    profile: (appointmentId: string) =>
      ["patients", "profile", appointmentId] as const,
    imageInvoice: (appointmentId: string) =>
      ["patients", "image-invoice", appointmentId] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
  },
} as const;
