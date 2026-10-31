// features/messages/hooks/use-messages-queries.ts

import { useQuery } from "@tanstack/react-query";

import {
  getConversationMessages,
  getConversations,
  getInboxCatalog,
} from "@/features/messages/api/messages-api";
import type {
  ConversationsResponse,
  InboxCatalog,
  InboxMessagesResponse,
} from "@/features/messages/types/messages-types";
import { normalizeApiError } from "@/lib/api/api-error";

/** Every Messages query starts with this key, so one invalidation refreshes them all. */
export const MESSAGES_QUERY_KEY = ["messages"] as const;

/** How often the open inbox checks for new messages (the standalone inbox does the same). */
const POLL_MS = 5_000;

export function useConversations() {
  return useQuery<ConversationsResponse, Error>({
    queryKey: [...MESSAGES_QUERY_KEY, "conversations"],
    refetchInterval: POLL_MS,

    queryFn: async () => {
      try {
        return await getConversations();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load conversations.");
      }
    },
  });
}

/** The open conversation's messages; runs only while one is selected. */
export function useConversationMessages(conversationId: string | null) {
  return useQuery<InboxMessagesResponse, Error>({
    queryKey: [...MESSAGES_QUERY_KEY, "messages", conversationId],
    enabled: conversationId !== null,
    refetchInterval: POLL_MS,

    queryFn: async () => {
      try {
        return await getConversationMessages(conversationId ?? "");
      } catch (error) {
        throw normalizeApiError(error, "Unable to load messages.");
      }
    },
  });
}

/** The exam, language and title choices of the card forms. */
export function useInboxCatalog() {
  return useQuery<InboxCatalog, Error>({
    queryKey: [...MESSAGES_QUERY_KEY, "catalog"],
    staleTime: 60 * 60 * 1000,

    queryFn: async () => {
      try {
        return await getInboxCatalog();
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the card options.");
      }
    },
  });
}
