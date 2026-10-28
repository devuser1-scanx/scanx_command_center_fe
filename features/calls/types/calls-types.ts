// features/calls/types/calls-types.ts

/** One call in the production call log (GET /calls/recent and friends). */
export type CallLog = {
  id: number;
  appointment_id: string | null;
  staff_phone: string | null;
  patient_number: string | null;
  direction: string;
  call_sid: string | null;
  status: string | null;
  duration: number | null;
  created_at: string | null;
  updated_at: string | null;

  first_name?: string | null;
  last_name?: string | null;
  patient_name?: string | null;
  display_name: string;
  is_known_patient: boolean;
  is_missed: boolean;

  email?: string | null;
  appointment_type?: string | null;
  clinic_id?: number | null;
  location?: string | null;
  calendar?: string | null;
  clinic_name?: string | null;
};

export type CallsResponse = {
  count: number;
  results: CallLog[];
};

export type CallsSummary = {
  /** The clinic days the numbers cover (YYYY-MM-DD). */
  start_date: string;
  end_date: string;
  total_calls: number;
  outgoing_calls: number;
  incoming_calls: number;
  missed_calls: number;
  completed_calls: number;
  failed_or_busy_calls: number;
  no_answer_calls: number;
  average_duration_seconds: number;
  recent_calls: CallLog[];
  missed_calls_list: CallLog[];
};

export type CallsSummaryQuery = {
  /** YYYY-MM-DD. Both unset: today. */
  startDate?: string;
  endDate?: string;
};

export type CallPatient = {
  appointment_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  appointment_type: string | null;
  category: string | null;
  appointment_datetime: string | null;
  date: string | null;
  time: string | null;
  clinic_id: number | null;
  location: string | null;
  calendar: string | null;
  clinic_name: string | null;
  clinic_city: string | null;
};

export type CallPatientSearchResponse = {
  query: string;
  count: number;
  results: CallPatient[];
};

export type CallPatientHistoryResponse = {
  phone: string;
  history: CallLog[];
};

/** What the browser needs to start a call (POST /calls/dial). */
export type DialResponse = {
  /**
   * Command Center's record of the call. Sent to Twilio as `CcCallId` so the
   * call can be tied to it.
   */
  call_id: number;
  /** A short-lived Twilio Voice SDK token for the Web Dialer's TwiML App. */
  token: string;
  /** The number to dial, already validated by the server (E.164). */
  to: string;
};

/** A message on the live-updates socket. */
export type CallEvent = {
  type: string;
};
