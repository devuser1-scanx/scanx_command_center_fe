// features/fax-portal/types/fax-portal-types.ts

/**
 * Shapes returned by the /fax-portal/* endpoints (snake_case, as sent by
 * the backend - app/schemas/fax_portal.py).
 */

export type ReferralStatusCode =
  | "review_required"
  | "ready_for_contact"
  | "follow_up_due"
  | "callback_requested"
  | "fax_provider_name_pending"
  | "didnt_respond"
  | "appointment_booked"
  | "not_referral"
  | "declined"
  | "exception";

export type BoardAssignee = {
  user_id: number;
  name: string;
  initials: string;
};

export type BoardCard = {
  id: number;
  row_version: number;
  status: ReferralStatusCode;
  status_changed_at: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  clinic: string | null;
  exam_1: string | null;
  exam_2: string | null;
  physician_name: string | null;
  is_new: boolean;
  is_urgent: boolean;
  possible_duplicate: boolean;
  assignee: BoardAssignee | null;
  qualifying_call_count: number;
  total_call_count: number;
  /** One entry per call placed, oldest first. */
  attempts: Array<"miss" | "other">;
  callback_at: string | null;
  next_action_at: string | null;
  due_at: string | null;
  booked_at: string | null;
  booked_source: string | null;
};

export type BoardColumn = {
  code: ReferralStatusCode;
  label: string;
  board_order: number;
  is_open: boolean;
  hide_after_days: number | null;
  visible_count: number;
  hidden_count: number;
  showing_older: boolean;
  truncated: boolean;
  cards: BoardCard[];
};

export type BoardSummary = {
  received_today: number;
  review: number;
  overdue: number;
  booked_today: number;
  fax_provider: number;
};

export type BoardResponse = {
  changed: boolean;
  server_time: string;
  summary: BoardSummary | null;
  columns: BoardColumn[];
};

export type BoardAssigneeFilter = "all" | "me" | "unassigned";

export type BoardQuery = {
  assignee: BoardAssigneeFilter;
  q: string;
  showOlder: ReferralStatusCode[];
};

export type MoveReferralInput = {
  referralId: number;
  toStatus: ReferralStatusCode;
  rowVersion: number;
  source: "button" | "drag";
  reason?: string;
  note?: string;
  acuityAppointmentId?: string;
  confirmed?: boolean;
};

export type MoveReferralResponse = {
  id: number;
  from_status: ReferralStatusCode;
  to_status: ReferralStatusCode;
  row_version: number;
};

export type FaxPortalAgent = {
  user_id: number;
  name: string;
  initials: string;
  accepting_new: boolean;
};

export type FaxPortalCounts = {
  call_queue: number;
  intake_review: number;
};

// ---------------------------------------------------------------------
// Intake Review
// ---------------------------------------------------------------------

export type IntakeQueueItem = {
  id: number;
  fax_id: number;
  display_name: string;
  created_at: string;
  is_new: boolean;
  is_urgent: boolean;
  possible_duplicate: boolean;
  page_count: number | null;
  assignee: BoardAssignee | null;
};

export type IntakeQueue = {
  /** Whole-queue counts for the tabs, whichever tab or page is showing. */
  waiting_count: number;
  duplicate_count: number;
  /** Pagination of the chosen tab. */
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: IntakeQueueItem[];
};

export const INTAKE_QUEUE_PAGE_SIZE = 10;

export type IntakeTab = "waiting" | "duplicates";

export type IntakeDocument = {
  idx: number;
  name: string | null;
  doc_type: string | null;
  page_start: number | null;
  page_end: number | null;
};

export type IntakeFax = {
  id: number;
  job_id: string;
  page_count: number | null;
  received_at: string;
  originating_number: string | null;
  summary: string | null;
  has_pdf: boolean;
  documents: IntakeDocument[];
};

export type IntakeFields = {
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  phone: string | null;
  gender: string | null;
  email: string | null;
  physician_name: string | null;
  physician_fax_no: string | null;
  physician_email: string | null;
};

export type ClinicChoice = {
  acuity_calendar_id: number;
  name: string;
};

export type ExamChoice = {
  acuity_appointment_type_id: number;
  name: string;
  fax_text: string | null;
};

export type IntakeSuggestions = {
  clinic: (ClinicChoice & { reason: string }) | null;
  exam_1: ExamChoice | null;
  exam_2: ExamChoice | null;
};

export type IntakeDetail = {
  id: number;
  row_version: number;
  status: ReferralStatusCode;
  is_new: boolean;
  is_urgent: boolean;
  duplicate_of_referral_id: number | null;
  fields: IntakeFields;
  clinic: ClinicChoice | null;
  exam_1: ExamChoice | null;
  exam_2: ExamChoice | null;
  suggestions: IntakeSuggestions;
  fax: IntakeFax;
};

/** Only the keys present are changed; an explicit null clears a value. */
export type IntakeUpdate = {
  row_version: number;
  first_name?: string | null;
  last_name?: string | null;
  dob?: string | null;
  phone?: string | null;
  gender?: string | null;
  physician_name?: string | null;
  physician_fax_no?: string | null;
  acuity_calendar_id?: number | null;
  exam_1_id?: number | null;
  exam_1_fax_text?: string | null;
  exam_2_id?: number | null;
  exam_2_fax_text?: string | null;
};

export type IntakeUpdateResponse = {
  id: number;
  row_version: number;
  changed_fields: string[];
};

export type AcuityCalendar = {
  acuity_calendar_id: number;
  name: string;
  location: string | null;
  timezone: string | null;
};

export type AcuityAppointmentType = {
  acuity_appointment_type_id: number;
  name: string;
  category: string | null;
  duration_min: number | null;
  price: string | null;
  available_at_calendar: boolean;
};

export type AcuitySyncStatus = {
  last_run_at: string | null;
  last_status: string | null;
  last_error: string | null;
  calendars: number;
  appointment_types: number;
};

// ---------------------------------------------------------------------
// Referral Case
// ---------------------------------------------------------------------

export const CALL_LIMIT = 5;

export type CaseFields = IntakeFields & {
  reason: string | null;
  reason_other: string | null;
};

export type CaseFax = {
  id: number;
  job_id: string;
  page_count: number | null;
  received_at: string;
  has_pdf: boolean;
};

export type CaseOutreach = {
  qualifying_call_count: number;
  total_call_count: number;
  call_limit: number;
  last_contact_at: string | null;
  next_action_at: string | null;
  next_action_type: string | null;
  callback_at: string | null;
};

export type CallResultCode =
  | "booked"
  | "no_answer"
  | "voicemail"
  | "busy"
  | "failed"
  | "callback_requested"
  | "declined"
  | "wrong_number"
  | "other";

export type CallResultOption = {
  code: CallResultCode;
  label: string;
  counts_toward_limit_default: boolean;
};

export type CaseCall = {
  id: number;
  started_at: string;
  user_name: string | null;
  result: CallResultCode | null;
  result_label: string | null;
  counts_toward_limit: boolean;
  attempt_number: number | null;
  other_reason: string | null;
  notes: string | null;
  twilio_status: string | null;
  duration_s: number | null;
  source: "twilio" | "manual";
};

export type CaseMessage = {
  id: number;
  direction: "outbound" | "inbound";
  channel: "rcs" | "sms";
  body: string;
  status: string;
  status_at: string;
  created_at: string;
  user_name: string | null;
  template_code: string | null;
  error_message: string | null;
};

export type TimelineEvent = {
  at: string;
  kind: "status" | "call" | "message" | "edit" | "system";
  title: string;
  detail: string | null;
  actor: string | null;
};

/** Click-to-call: the call row, and the token the browser connects with. */
export type DialCallResponse = {
  call_id: number;
  started_at: string;
  token: string;
};

export type CaseDetail = {
  id: number;
  row_version: number;
  status: ReferralStatusCode;
  status_label: string;
  is_open: boolean;
  created_at: string;
  fields: CaseFields;
  clinic: ClinicChoice | null;
  exam_1: ExamChoice | null;
  exam_2: ExamChoice | null;
  assignee: BoardAssignee | null;
  fax: CaseFax;
  outreach: CaseOutreach;
  phone_e164: string | null;
  sms_opted_out: boolean;
  do_not_call: boolean;
  can_call: boolean;
  call_blocked_reason: string | null;
  can_text: boolean;
  text_blocked_reason: string | null;
  open_call_id: number | null;
  open_call_source: "twilio" | "manual" | null;
  /** Twilio's progress on the open call, e.g. "ringing" or "patient:no-answer". */
  open_call_status: string | null;
  /** The result Twilio's report suggests; the agent still picks. */
  suggested_result: CallResultCode | null;
  call_service_connected: boolean;
  /** Whether the viewer can use Call patient (also needs their own phone). */
  can_dial: boolean;
  dial_blocked_reason: string | null;
  result_options: CallResultOption[];
  calls: CaseCall[];
  messages: CaseMessage[];
  timeline: TimelineEvent[];
};

/** Case edits reuse the intake update shape, plus the reason fields. */
export type CaseUpdate = IntakeUpdate & {
  email?: string | null;
  physician_email?: string | null;
  reason?: string | null;
  reason_other?: string | null;
};

export type CallResultInput = {
  callId: number;
  result: CallResultCode;
  otherReason?: string;
  countsTowardLimit?: boolean;
  notes?: string;
  callbackAt?: string;
  nextActionAt?: string;
  acuityAppointmentId?: string;
};

export type CallResultResponse = {
  call_id: number;
  status: ReferralStatusCode;
  row_version: number;
  qualifying_call_count: number;
  counts_toward_limit: boolean;
  moved_to: ReferralStatusCode | null;
  call_limit_reached: boolean;
};

export type MessageTemplate = {
  code: string;
  label: string;
  language: string;
  body: string;
  missing: string[];
};

export type SendMessageResponse = {
  message_id: number;
  status: string;
  channel: "rcs" | "sms";
};

export type BookingMatch = {
  appointment_id: string;
  first_name: string | null;
  last_name: string | null;
  appointment_type: string | null;
  date: string | null;
  time: string | null;
  canceled: boolean;
  already_linked: boolean;
};

export type BookingInfo = {
  booking_link: string | null;
  booking_link_blocked_reason: string | null;
  matches: BookingMatch[];
  matches_unavailable: string | null;
};

export type ReferralSearchItem = {
  id: number;
  display_name: string;
  phone: string | null;
  status: ReferralStatusCode;
  status_label: string;
  created_at: string;
  assignee: BoardAssignee | null;
};
