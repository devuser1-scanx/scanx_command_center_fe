// features/messages/api/messages-api.ts

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ConversationsResponse,
  InboxCatalog,
  InboxMessagesResponse,
  RcsCardInput,
  SendResponse,
} from "@/features/messages/types/messages-types";

const { inbox } = API_ENDPOINTS;

export function getConversations(): Promise<ConversationsResponse> {
  return apiClient.get<ConversationsResponse>(inbox.conversations);
}

export function getConversationMessages(
  conversationId: string,
): Promise<InboxMessagesResponse> {
  return apiClient.get<InboxMessagesResponse>(inbox.messages(conversationId));
}

export function getInboxCatalog(): Promise<InboxCatalog> {
  return apiClient.get<InboxCatalog>(inbox.catalog);
}

/** Marks the conversation's unread messages as read. */
export function markConversationRead(conversationId: string): Promise<void> {
  return apiClient.post<void>(inbox.read(conversationId));
}

export function startConversation(
  toPhone: string,
  message: string,
): Promise<SendResponse> {
  return apiClient.post<SendResponse>(inbox.newConversation, {
    to_phone: toPhone,
    message,
  });
}

export function replyToConversation(
  conversationId: string,
  body: string,
): Promise<SendResponse> {
  return apiClient.post<SendResponse>(inbox.reply(conversationId), { body });
}

export function sendRcsCard(input: RcsCardInput): Promise<SendResponse> {
  return apiClient.post<SendResponse>(inbox.sendRcsCard, {
    exam: input.exam,
    title: input.title,
    patient_name: input.patientName,
    doctor_name: input.doctorName,
    patient_phone: input.patientPhone,
  });
}

export function sendMissedCallCard(
  patientPhone: string,
  language: string,
): Promise<SendResponse> {
  return apiClient.post<SendResponse>(inbox.sendMissedCallCard, {
    patient_phone: patientPhone,
    language,
  });
}

export function sendGenericSalesCard(
  exam: string,
  patientPhone: string,
): Promise<SendResponse> {
  return apiClient.post<SendResponse>(inbox.sendGenericSalesCard, {
    exam,
    patient_phone: patientPhone,
  });
}

export function deleteConversation(conversationId: string): Promise<void> {
  return apiClient.delete<void>(inbox.conversation(conversationId));
}
