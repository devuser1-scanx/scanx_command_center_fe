// features/fax-portal/api/fax-portal-api.ts

import { apiClient, apiRequestBlob } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AcuityAppointmentType,
  AvailableTime,
  BookingInfo,
  CallQueue,
  DirectBookResponse,
  CallResultInput,
  CallResultResponse,
  CaseDetail,
  DialCallResponse,
  CaseUpdate,
  MessageTemplate,
  ReferralSearchItem,
  SendMessageResponse,
  AcuityCalendar,
  AcuitySyncStatus,
  BoardQuery,
  BoardResponse,
  FaxPortalAgent,
  FaxPortalCounts,
  IntakeDetail,
  IntakeQueue,
  IntakeTab,
  IntakeUpdate,
  IntakeUpdateResponse,
  MoveReferralInput,
  MoveReferralResponse,
} from "@/features/fax-portal/types/fax-portal-types";
import { INTAKE_QUEUE_PAGE_SIZE } from "@/features/fax-portal/types/fax-portal-types";

export async function getBoard(
  query: BoardQuery,
  since?: string,
): Promise<BoardResponse> {
  const params = new URLSearchParams();

  params.set("assignee", query.assignee);

  const search = query.q.trim();

  if (search) {
    params.set("q", search);
  }

  if (query.showOlder.length > 0) {
    params.set("show_older", query.showOlder.join(","));
  }

  // The poll timestamp goes in a header, not the query string: a URL that
  // changes on every poll makes the browser repeat its CORS preflight
  // (an extra OPTIONS request) each time, while a stable URL is checked once
  // and remembered.
  return apiClient.get<BoardResponse>(
    `${API_ENDPOINTS.faxPortal.board}?${params.toString()}`,
    since ? { headers: { "X-Board-Since": since } } : {},
  );
}

export async function moveReferral(
  input: MoveReferralInput,
): Promise<MoveReferralResponse> {
  return apiClient.post<MoveReferralResponse>(
    API_ENDPOINTS.faxPortal.moveReferral(input.referralId),
    {
      to_status: input.toStatus,
      row_version: input.rowVersion,
      source: input.source,
      reason: input.reason,
      note: input.note,
      acuity_appointment_id: input.acuityAppointmentId,
      confirmed: input.confirmed ?? false,
    },
  );
}

export async function assignReferral(input: {
  referralId: number;
  assignedUserId: number | null;
  rowVersion: number;
}): Promise<{
  id: number;
  assigned_user_id: number | null;
  row_version: number;
}> {
  return apiClient.post(
    API_ENDPOINTS.faxPortal.assignReferral(input.referralId),
    {
      assigned_user_id: input.assignedUserId,
      row_version: input.rowVersion,
    },
  );
}

export async function getFaxPortalAgents(): Promise<FaxPortalAgent[]> {
  return apiClient.get<FaxPortalAgent[]>(API_ENDPOINTS.faxPortal.agents);
}

export async function getFaxPortalCounts(): Promise<FaxPortalCounts> {
  return apiClient.get<FaxPortalCounts>(API_ENDPOINTS.faxPortal.counts);
}

// ---------------------------------------------------------------------
// Intake Review
// ---------------------------------------------------------------------

export async function getIntakeQueue(
  tab: IntakeTab,
  page: number,
): Promise<IntakeQueue> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(INTAKE_QUEUE_PAGE_SIZE),
  });

  if (tab === "duplicates") {
    params.set("duplicates_only", "true");
  }

  return apiClient.get<IntakeQueue>(
    `${API_ENDPOINTS.faxPortal.intakeQueue}?${params.toString()}`,
  );
}

export async function getIntakeDetail(
  referralId: number,
): Promise<IntakeDetail> {
  return apiClient.get<IntakeDetail>(
    API_ENDPOINTS.faxPortal.intakeDetail(referralId),
  );
}

export async function markReferralViewed(
  referralId: number,
): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.faxPortal.markViewed(referralId));
}

export async function updateIntake(
  referralId: number,
  body: IntakeUpdate,
): Promise<IntakeUpdateResponse> {
  return apiClient.patch<IntakeUpdateResponse>(
    API_ENDPOINTS.faxPortal.intakeDetail(referralId),
    body,
  );
}

/**
 * Fetches the fax PDF through the backend (authenticated, role-checked,
 * audited). The bucket itself is never exposed to the browser.
 */
export async function getFaxPdf(
  faxId: number,
  referralId: number,
): Promise<Blob> {
  return apiRequestBlob(
    `${API_ENDPOINTS.faxPortal.faxPdf(faxId)}?referral_id=${referralId}`,
  );
}

export async function getAcuityCalendars(): Promise<AcuityCalendar[]> {
  return apiClient.get<AcuityCalendar[]>(
    API_ENDPOINTS.faxPortal.acuityCalendars,
  );
}

export async function getAcuityAppointmentTypes(
  calendarId: number | null,
): Promise<AcuityAppointmentType[]> {
  const query = calendarId === null ? "" : `?calendar_id=${calendarId}`;

  return apiClient.get<AcuityAppointmentType[]>(
    `${API_ENDPOINTS.faxPortal.acuityAppointmentTypes}${query}`,
  );
}

export async function getAcuityStatus(): Promise<AcuitySyncStatus> {
  return apiClient.get<AcuitySyncStatus>(API_ENDPOINTS.faxPortal.acuityStatus);
}

export async function refreshAcuity(): Promise<unknown> {
  return apiClient.post(API_ENDPOINTS.faxPortal.acuityRefresh);
}

// ---------------------------------------------------------------------
// Referral Case
// ---------------------------------------------------------------------

export async function searchReferrals(
  q: string,
): Promise<ReferralSearchItem[]> {
  const params = new URLSearchParams({ limit: "20" });

  if (q.trim()) {
    params.set("q", q.trim());
  }

  return apiClient.get<ReferralSearchItem[]>(
    `${API_ENDPOINTS.faxPortal.searchReferrals}?${params.toString()}`,
  );
}

export async function getCase(referralId: number): Promise<CaseDetail> {
  return apiClient.get<CaseDetail>(
    API_ENDPOINTS.faxPortal.caseDetail(referralId),
  );
}

export async function updateCase(
  referralId: number,
  body: CaseUpdate,
): Promise<IntakeUpdateResponse> {
  return apiClient.patch<IntakeUpdateResponse>(
    API_ENDPOINTS.faxPortal.caseDetail(referralId),
    body,
  );
}

export async function startCall(
  referralId: number,
): Promise<{ call_id: number; started_at: string }> {
  return apiClient.post(API_ENDPOINTS.faxPortal.startCall(referralId));
}

/** Click-to-call: logs the call and returns the token the browser connects with. */
export async function dialPatient(
  referralId: number,
): Promise<DialCallResponse> {
  return apiClient.post(API_ENDPOINTS.faxPortal.dialPatient(referralId));
}

/** The browser could not start the call: removes the call row. */
export async function abandonCall(callId: number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.faxPortal.abandonCall(callId));
}

export async function recordCallResult(
  input: CallResultInput,
): Promise<CallResultResponse> {
  return apiClient.post<CallResultResponse>(
    API_ENDPOINTS.faxPortal.callResult(input.callId),
    {
      result: input.result,
      other_reason: input.otherReason,
      counts_toward_limit: input.countsTowardLimit,
      notes: input.notes,
      callback_at: input.callbackAt,
      next_action_at: input.nextActionAt,
      acuity_appointment_id: input.acuityAppointmentId,
    },
  );
}

export async function markDoNotCall(
  referralId: number,
): Promise<{ status: string; row_version: number }> {
  return apiClient.post(API_ENDPOINTS.faxPortal.doNotCall(referralId));
}

export async function getMessageTemplates(
  referralId: number,
): Promise<MessageTemplate[]> {
  return apiClient.get<MessageTemplate[]>(
    API_ENDPOINTS.faxPortal.messageTemplates(referralId),
  );
}

export async function sendMessage(
  referralId: number,
  body: string,
  templateCode: string | null,
): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>(
    API_ENDPOINTS.faxPortal.sendMessage(referralId),
    { body, template_code: templateCode },
  );
}

/** The signed-in user's call queue, in the order to call them. */
export async function getCallQueue(): Promise<CallQueue> {
  return apiClient.get<CallQueue>(API_ENDPOINTS.faxPortal.callQueue);
}

/** Days in `month` (YYYY-MM) with open times for the referral's exam and clinic. */
export async function getDirectBookingDates(
  referralId: number,
  month: string,
): Promise<string[]> {
  return apiClient.get<string[]>(
    API_ENDPOINTS.faxPortal.directBookingDates(referralId, month),
  );
}

export async function getDirectBookingTimes(
  referralId: number,
  date: string,
): Promise<AvailableTime[]> {
  return apiClient.get<AvailableTime[]>(
    API_ENDPOINTS.faxPortal.directBookingTimes(referralId, date),
  );
}

/** Books the appointment in Acuity itself and marks the referral booked. */
export async function directBook(
  referralId: number,
  body: { time: string; email: string | null },
): Promise<DirectBookResponse> {
  return apiClient.post<DirectBookResponse>(
    API_ENDPOINTS.faxPortal.directBook(referralId),
    body,
  );
}

export async function getBookingInfo(
  referralId: number,
): Promise<BookingInfo> {
  return apiClient.get<BookingInfo>(
    API_ENDPOINTS.faxPortal.bookingInfo(referralId),
  );
}
