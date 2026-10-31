// features/messages/hooks/use-messages-actions.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteConversation,
  markConversationRead,
  replyToConversation,
  sendGenericSalesCard,
  sendMissedCallCard,
  sendRcsCard,
  startConversation,
} from "@/features/messages/api/messages-api";
import { MESSAGES_QUERY_KEY } from "@/features/messages/hooks/use-messages-queries";
import type {
  RcsCardInput,
  SendResponse,
} from "@/features/messages/types/messages-types";
import { normalizeApiError } from "@/lib/api/api-error";

/** Every change refreshes the conversation list and the open conversation. */
export function useMessagesActions() {
  const queryClient = useQueryClient();

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
  }

  const start = useMutation<
    SendResponse,
    Error,
    { phone: string; message: string }
  >({
    mutationFn: async ({ phone, message }) => {
      try {
        return await startConversation(phone, message);
      } catch (error) {
        throw normalizeApiError(error, "Failed to send the message.");
      }
    },
    onSuccess: refresh,
  });

  const reply = useMutation<
    SendResponse,
    Error,
    { conversationId: string; body: string }
  >({
    mutationFn: async ({ conversationId, body }) => {
      try {
        return await replyToConversation(conversationId, body);
      } catch (error) {
        throw normalizeApiError(error, "Failed to send the message.");
      }
    },
    onSuccess: refresh,
  });

  const rcsCard = useMutation<SendResponse, Error, RcsCardInput>({
    mutationFn: async (input) => {
      try {
        return await sendRcsCard(input);
      } catch (error) {
        throw normalizeApiError(error, "Failed to send the card.");
      }
    },
    onSuccess: refresh,
  });

  const missedCallCard = useMutation<
    SendResponse,
    Error,
    { phone: string; language: string }
  >({
    mutationFn: async ({ phone, language }) => {
      try {
        return await sendMissedCallCard(phone, language);
      } catch (error) {
        throw normalizeApiError(error, "Failed to send the card.");
      }
    },
    onSuccess: refresh,
  });

  const genericSalesCard = useMutation<
    SendResponse,
    Error,
    { phone: string; exam: string }
  >({
    mutationFn: async ({ phone, exam }) => {
      try {
        return await sendGenericSalesCard(exam, phone);
      } catch (error) {
        throw normalizeApiError(error, "Failed to send the card.");
      }
    },
    onSuccess: refresh,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        throw normalizeApiError(error, "Failed to delete the conversation.");
      }
    },
    onSuccess: refresh,
  });

  const markRead = useMutation<void, Error, string>({
    mutationFn: (conversationId) => markConversationRead(conversationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...MESSAGES_QUERY_KEY, "conversations"],
      }),
  });

  return {
    start,
    reply,
    rcsCard,
    missedCallCard,
    genericSalesCard,
    remove,
    markRead,
  };
}
