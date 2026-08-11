// features/patients/api/patients-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { TimelineAppointment } from "@/features/dashboard/admin/timeline-utils";

type Tone = TimelineAppointment["tone"];

export type PatientSummary = {
  phone: string | null;
  patient: string;
  appointmentCount: number;
  latestAppointmentId: string;
  latestClinicName: string;
  latestExam: string;
  latestTime: string;
  latestStatus: string;
  latestTone: Tone;
};

export type VisitSummary = {
  appointmentId: string;
  date: string;
  time: string;
  clinicName: string;
  exam: string;
  status: string;
  tone: Tone;
  price: number | null;
  amountPaid: number | null;
  paid: boolean | null;
};

export type PatientIntake = {
  dob: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  reason: string | null;
  reasonOther: string | null;
  examDate: string | null;
  physicianName: string | null;
  physicianEmail: string | null;
  physicianFaxNo: string | null;
  doctorOrderValue: string | null;
  bloodPressureSys: number | null;
  bloodPressureDia: number | null;
  smsConsentValue: string | null;
  hippaResponse: string | null;
  acceptTerms: string | null;
};

export type CheckinInfo = {
  status: string | null;
  checkinTime: string | null;
  location: string | null;
};

export type FormStatusItem = {
  source: string;
  formType: string | null;
  status: string | null;
  sentAt: string | null;
  submittedAt: string | null;
};

export type MessageItem = {
  direction: string | null;
  channel: string | null;
  body: string | null;
  status: string | null;
  timestamp: string | null;
};

export type CallLogItem = {
  direction: string;
  status: string | null;
  duration: number | null;
  createdAt: string | null;
};

export type ReportItem = {
  fileName: string | null;
  deliveryLink: string | null;
  linkExpiresAt: string | null;
  accessed: boolean | null;
  createdAt: string | null;
};

export type UploadItem = {
  fileName: string | null;
  fileType: string | null;
  uploadedAt: string | null;
  verified: boolean | null;
};

export type PaymentInfo = {
  price: number | null;
  amountPaid: number | null;
  paid: boolean | null;
  paymentLink: string | null;
};

export type PatientProfile = {
  patient: string;
  phone: string | null;
  email: string | null;
  visits: VisitSummary[];
  selectedAppointmentId: string;
  intake: PatientIntake | null;
  checkin: CheckinInfo | null;
  forms: FormStatusItem[];
  messages: MessageItem[];
  callLogs: CallLogItem[];
  reports: ReportItem[];
  uploads: UploadItem[];
  payment: PaymentInfo;
};

type ApiPatientSummary = {
  phone: string | null;
  patient: string;
  appointment_count: number;
  latest_appointment_id: string;
  latest_clinic_name: string;
  latest_exam: string;
  latest_time: string;
  latest_status: string;
  latest_tone: Tone;
};

type ApiPatientSearchResponse = {
  items: ApiPatientSummary[];
};

type ApiVisitSummary = {
  appointment_id: string;
  date: string;
  time: string;
  clinic_name: string;
  exam: string;
  status: string;
  tone: Tone;
  price: number | null;
  amount_paid: number | null;
  paid: boolean | null;
};

type ApiPatientIntake = {
  dob: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  reason: string | null;
  reason_other: string | null;
  exam_date: string | null;
  physician_name: string | null;
  physician_email: string | null;
  physician_fax_no: string | null;
  doctor_order_value: string | null;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  sms_consent_value: string | null;
  hippa_response: string | null;
  accept_terms: string | null;
};

type ApiCheckinInfo = {
  status: string | null;
  checkin_time: string | null;
  location: string | null;
};

type ApiFormStatusItem = {
  source: string;
  form_type: string | null;
  status: string | null;
  sent_at: string | null;
  submitted_at: string | null;
};

type ApiMessageItem = {
  direction: string | null;
  channel: string | null;
  body: string | null;
  status: string | null;
  timestamp: string | null;
};

type ApiCallLogItem = {
  direction: string;
  status: string | null;
  duration: number | null;
  created_at: string | null;
};

type ApiReportItem = {
  file_name: string | null;
  delivery_link: string | null;
  link_expires_at: string | null;
  accessed: boolean | null;
  created_at: string | null;
};

type ApiUploadItem = {
  file_name: string | null;
  file_type: string | null;
  uploaded_at: string | null;
  verified: boolean | null;
};

type ApiPaymentInfo = {
  price: number | null;
  amount_paid: number | null;
  paid: boolean | null;
  payment_link: string | null;
};

type ApiPatientProfileResponse = {
  patient: string;
  phone: string | null;
  email: string | null;
  visits: ApiVisitSummary[];
  selected_appointment_id: string;
  intake: ApiPatientIntake | null;
  checkin: ApiCheckinInfo | null;
  forms: ApiFormStatusItem[];
  messages: ApiMessageItem[];
  call_logs: ApiCallLogItem[];
  reports: ApiReportItem[];
  uploads: ApiUploadItem[];
  payment: ApiPaymentInfo;
};

function mapPatientSummary(item: ApiPatientSummary): PatientSummary {
  return {
    phone: item.phone,
    patient: item.patient,
    appointmentCount: item.appointment_count,
    latestAppointmentId: item.latest_appointment_id,
    latestClinicName: item.latest_clinic_name,
    latestExam: item.latest_exam,
    latestTime: item.latest_time,
    latestStatus: item.latest_status,
    latestTone: item.latest_tone,
  };
}

function mapVisitSummary(item: ApiVisitSummary): VisitSummary {
  return {
    appointmentId: item.appointment_id,
    date: item.date,
    time: item.time,
    clinicName: item.clinic_name,
    exam: item.exam,
    status: item.status,
    tone: item.tone,
    price: item.price,
    amountPaid: item.amount_paid,
    paid: item.paid,
  };
}

function mapIntake(item: ApiPatientIntake): PatientIntake {
  return {
    dob: item.dob,
    gender: item.gender,
    height: item.height,
    weight: item.weight,
    reason: item.reason,
    reasonOther: item.reason_other,
    examDate: item.exam_date,
    physicianName: item.physician_name,
    physicianEmail: item.physician_email,
    physicianFaxNo: item.physician_fax_no,
    doctorOrderValue: item.doctor_order_value,
    bloodPressureSys: item.blood_pressure_sys,
    bloodPressureDia: item.blood_pressure_dia,
    smsConsentValue: item.sms_consent_value,
    hippaResponse: item.hippa_response,
    acceptTerms: item.accept_terms,
  };
}

function mapCheckin(item: ApiCheckinInfo): CheckinInfo {
  return {
    status: item.status,
    checkinTime: item.checkin_time,
    location: item.location,
  };
}

function mapFormStatus(item: ApiFormStatusItem): FormStatusItem {
  return {
    source: item.source,
    formType: item.form_type,
    status: item.status,
    sentAt: item.sent_at,
    submittedAt: item.submitted_at,
  };
}

function mapMessage(item: ApiMessageItem): MessageItem {
  return {
    direction: item.direction,
    channel: item.channel,
    body: item.body,
    status: item.status,
    timestamp: item.timestamp,
  };
}

function mapCallLog(item: ApiCallLogItem): CallLogItem {
  return {
    direction: item.direction,
    status: item.status,
    duration: item.duration,
    createdAt: item.created_at,
  };
}

function mapReport(item: ApiReportItem): ReportItem {
  return {
    fileName: item.file_name,
    deliveryLink: item.delivery_link,
    linkExpiresAt: item.link_expires_at,
    accessed: item.accessed,
    createdAt: item.created_at,
  };
}

function mapUpload(item: ApiUploadItem): UploadItem {
  return {
    fileName: item.file_name,
    fileType: item.file_type,
    uploadedAt: item.uploaded_at,
    verified: item.verified,
  };
}

function mapPayment(item: ApiPaymentInfo): PaymentInfo {
  return {
    price: item.price,
    amountPaid: item.amount_paid,
    paid: item.paid,
    paymentLink: item.payment_link,
  };
}

function mapPatientProfile(
  item: ApiPatientProfileResponse,
): PatientProfile {
  return {
    patient: item.patient,
    phone: item.phone,
    email: item.email,
    visits: item.visits.map(mapVisitSummary),
    selectedAppointmentId: item.selected_appointment_id,
    intake: item.intake ? mapIntake(item.intake) : null,
    checkin: item.checkin ? mapCheckin(item.checkin) : null,
    forms: item.forms.map(mapFormStatus),
    messages: item.messages.map(mapMessage),
    callLogs: item.call_logs.map(mapCallLog),
    reports: item.reports.map(mapReport),
    uploads: item.uploads.map(mapUpload),
    payment: mapPayment(item.payment),
  };
}

export async function searchPatients(params: {
  q?: string;
  date?: string;
}): Promise<PatientSummary[]> {
  const query = new URLSearchParams();

  if (params.q) {
    query.set("q", params.q);
  }

  if (params.date) {
    query.set("date", params.date);
  }

  const queryString = query.toString();

  const response = await apiClient.get<ApiPatientSearchResponse>(
    queryString
      ? `${API_ENDPOINTS.patients.search}?${queryString}`
      : API_ENDPOINTS.patients.search,
  );

  return response.items.map(mapPatientSummary);
}

export async function getPatientProfile(
  appointmentId: string,
): Promise<PatientProfile> {
  const response = await apiClient.get<ApiPatientProfileResponse>(
    API_ENDPOINTS.patients.detail(appointmentId),
  );

  return mapPatientProfile(response);
}
