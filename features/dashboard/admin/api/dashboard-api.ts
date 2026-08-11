// features/dashboard/admin/api/dashboard-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { TimelineAppointment } from "@/features/dashboard/admin/timeline-by-appointment";

export type Clinic = {
  id: number;
  name: string;
  city: string | null;
  timezone: string | null;
};

export type TimelineAppointmentApiResponse = {
  id: string;
  patient: string;
  exam: string;
  time: string;
  status: string;
  tone: TimelineAppointment["tone"];
  duration_minutes: number;
};

type DashboardTimelineApiResponse = {
  clinic_id: number | null;
  date: string;
  appointments: TimelineAppointmentApiResponse[];
};

export type DashboardSummary = {
  date: string;
  today: number;
  confirmed: number;
  checkedIn: number;
  late: number;
  reportPending: number;
};

type DashboardSummaryApiResponse = {
  date: string;
  today: number;
  confirmed: number;
  checked_in: number;
  late: number;
  report_pending: number;
};

export function mapTimelineAppointment(
  appointment: TimelineAppointmentApiResponse,
): TimelineAppointment {
  return {
    id: appointment.id,
    patient: appointment.patient,
    exam: appointment.exam,
    time: appointment.time,
    status: appointment.status,
    tone: appointment.tone,
    durationMinutes: appointment.duration_minutes,
  };
}

export async function getClinics(): Promise<Clinic[]> {
  return apiClient.get<Clinic[]>(API_ENDPOINTS.clinics.list);
}

export async function getDashboardTimeline(params: {
  clinicId: number | null;
  date: string;
}): Promise<TimelineAppointment[]> {
  const query = new URLSearchParams();

  if (params.clinicId !== null) {
    query.set("clinic_id", String(params.clinicId));
  }

  query.set("date", params.date);

  const response =
    await apiClient.get<DashboardTimelineApiResponse>(
      `${API_ENDPOINTS.dashboard.timeline}?${query.toString()}`,
    );

  return response.appointments.map(mapTimelineAppointment);
}

export async function getDashboardSummary(
  date: string,
): Promise<DashboardSummary> {
  const query = new URLSearchParams({ date });

  const response =
    await apiClient.get<DashboardSummaryApiResponse>(
      `${API_ENDPOINTS.dashboard.summary}?${query.toString()}`,
    );

  return {
    date: response.date,
    today: response.today,
    confirmed: response.confirmed,
    checkedIn: response.checked_in,
    late: response.late,
    reportPending: response.report_pending,
  };
}
