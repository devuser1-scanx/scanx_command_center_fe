// features/calls/api/calls-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CallPatientHistoryResponse,
  CallPatientSearchResponse,
  CallsResponse,
  CallsSummary,
  CallsSummaryQuery,
  DialResponse,
} from "@/features/calls/types/calls-types";

export function getCallsSummary({
  startDate,
  endDate,
}: CallsSummaryQuery = {}): Promise<CallsSummary> {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("start_date", startDate);
  }

  if (endDate) {
    params.set("end_date", endDate);
  }

  const query = params.toString();

  return apiClient.get<CallsSummary>(
    query
      ? `${API_ENDPOINTS.calls.summary}?${query}`
      : API_ENDPOINTS.calls.summary,
  );
}

export function getRecentCalls(limit = 50): Promise<CallsResponse> {
  return apiClient.get<CallsResponse>(
    `${API_ENDPOINTS.calls.recent}?limit=${limit}`,
  );
}

export function getMissedCalls(limit = 50): Promise<CallsResponse> {
  return apiClient.get<CallsResponse>(
    `${API_ENDPOINTS.calls.missed}?limit=${limit}`,
  );
}

export function searchCallPatients(
  query: string,
): Promise<CallPatientSearchResponse> {
  return apiClient.get<CallPatientSearchResponse>(
    `${API_ENDPOINTS.calls.searchPatients}?q=${encodeURIComponent(query)}`,
  );
}

export function getPatientCallHistory(
  phone: string,
): Promise<CallPatientHistoryResponse> {
  return apiClient.get<CallPatientHistoryResponse>(
    `${API_ENDPOINTS.calls.patientCallHistory}?phone=${encodeURIComponent(phone)}`,
  );
}

/**
 * Logs a call to be placed and returns what the browser connects with: a
 * short-lived Twilio token, the call id and the validated number (needs
 * calls.create). Twilio then asks the Web Dialer service what to do with the
 * call, as it does for the standalone dialer.
 */
export function dialCall(
  number: string,
  appointmentId?: string,
): Promise<DialResponse> {
  return apiClient.post<DialResponse>(API_ENDPOINTS.calls.dial, {
    number,
    appointment_id: appointmentId ?? null,
  });
}

/**
 * The browser's call is over. `reachedTwilio` is false when it never got that
 * far (microphone refused, no connection); `durationS` is how long it lasted.
 */
export function endCall(
  callId: number,
  reachedTwilio: boolean,
  durationS: number,
): Promise<void> {
  return apiClient.post<void>(API_ENDPOINTS.calls.ended(callId), {
    reached_twilio: reachedTwilio,
    duration_s: durationS,
  });
}
