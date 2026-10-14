// features/fax-portal/hooks/use-acuity.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAcuityAppointmentTypes,
  getAcuityCalendars,
  getAcuityStatus,
  refreshAcuity,
} from "@/features/fax-portal/api/fax-portal-api";
import type {
  AcuityAppointmentType,
  AcuityCalendar,
  AcuitySyncStatus,
} from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

/**
 * Clinics (Acuity calendars) and exams (appointment types) come from the
 * copy synced into our database, never from Acuity directly.
 */
export function useAcuityCalendars() {
  return useQuery<AcuityCalendar[], Error>({
    queryKey: ["fax-portal", "acuity", "calendars"],

    queryFn: async () => {
      try {
        return await getAcuityCalendars();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the clinics.");
      }
    },

    staleTime: 5 * 60 * 1000,
  });
}

export function useAcuityAppointmentTypes(calendarId: number | null) {
  return useQuery<AcuityAppointmentType[], Error>({
    queryKey: ["fax-portal", "acuity", "types", calendarId],

    queryFn: async () => {
      try {
        return await getAcuityAppointmentTypes(calendarId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the exams.");
      }
    },

    staleTime: 5 * 60 * 1000,
  });
}

export function useAcuityStatus() {
  return useQuery<AcuitySyncStatus, Error>({
    queryKey: ["fax-portal", "acuity", "status"],

    queryFn: async () => {
      try {
        return await getAcuityStatus();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the Acuity sync status.");
      }
    },

    staleTime: 60 * 1000,
  });
}

export function useRefreshAcuity() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error>({
    mutationFn: async () => {
      try {
        return await refreshAcuity();
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to refresh from Acuity. Please try again.",
        );
      }
    },

    onSuccess: () => {
      toast.success("Clinics and exams refreshed from Acuity.");
      void queryClient.invalidateQueries({
        queryKey: ["fax-portal", "acuity"],
      });
      // Suggestions depend on the lists, so reload the open referral too.
      void queryClient.invalidateQueries({
        queryKey: ["fax-portal", "intake", "detail"],
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
