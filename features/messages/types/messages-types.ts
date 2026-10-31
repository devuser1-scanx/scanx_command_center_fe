// features/messages/types/messages-types.ts

export type Conversation = {
  /** The patient's number without the "+" - the conversation's key. */
  id: string;
  patient_phone: string;
  patient_name: string | null;
  business_phone: string | null;
  status: string;
  assigned_to: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string | null;
  unread_count: number;
};

export type ConversationsResponse = {
  items: Conversation[];
};

export type InboxMessage = {
  id: string;
  sid: string | null;
  direction: "inbound" | "outbound" | string;
  body: string;
  from_number: string | null;
  to_number: string | null;
  status: string | null;
  created_at: string | null;
  sent_by: string | null;
  type: string | null;
  media_url: string | null;
  meta: Record<string, unknown> | null;
};

export type InboxMessagesResponse = {
  items: InboxMessage[];
};

export type SendResponse = {
  conversation_id: string;
  sid: string;
};

export type CatalogOption = {
  value: string;
  label: string;
};

export type InboxCatalog = {
  rcs_exams: CatalogOption[];
  generic_sales_exams: CatalogOption[];
  languages: CatalogOption[];
  titles: string[];
};

export type RcsCardInput = {
  exam: string;
  title: string;
  patientName: string;
  doctorName: string;
  patientPhone: string;
};
