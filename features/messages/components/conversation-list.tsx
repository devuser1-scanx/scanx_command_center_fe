// features/messages/components/conversation-list.tsx

"use client";

import { Search, Trash2 } from "lucide-react";

import {
  conversationTitle,
  formatMessageTime,
} from "@/features/messages/components/messages-format";
import type { Conversation } from "@/features/messages/types/messages-types";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  search: string;
  loading: boolean;
  error: string | null;
  canDelete: boolean;
  onSearch: (value: string) => void;
  onSelect: (conversationId: string) => void;
  onDelete: (conversation: Conversation) => void;
};

/** The patients' conversations, newest first, with a name / number search. */
export function ConversationList({
  conversations,
  activeId,
  search,
  loading,
  error,
  canDelete,
  onSearch,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const term = search.trim().toLowerCase();

  const visible = term
    ? conversations.filter(
        (conversation) =>
          (conversation.patient_phone || conversation.id)
            .toLowerCase()
            .includes(term) ||
          (conversation.patient_name ?? "").toLowerCase().includes(term),
      )
    : conversations;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[#e4ddd0] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#aaaaaa]" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by name or phone"
            aria-label="Search conversations"
            className="h-10 w-full rounded-md border border-[#dddddd] bg-white pr-3 pl-9 text-sm text-[#2d2d2d] outline-none placeholder:text-[#aaaaaa] focus:border-[#8b6f47]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-5 text-center text-sm text-[#777777]">
            Loading conversations…
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="p-5 text-center text-sm font-semibold text-[#cc3333]">
            {error}
          </p>
        ) : null}

        {!loading && !error && visible.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#777777]">
            No conversations found.
          </p>
        ) : null}

        <ul>
          {visible.map((conversation) => {
            const active = conversation.id === activeId;

            return (
              <li key={conversation.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "block w-full border-b border-l-4 border-b-[#e4ddd0] px-4 py-3 text-left transition-colors",
                    active
                      ? "border-l-[#8b6f47] bg-[#faf6ef]"
                      : "border-l-transparent hover:bg-[#f5f1e8]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm text-[#2d2d2d]",
                        conversation.unread_count > 0 ? "font-bold" : "font-semibold",
                      )}
                    >
                      {conversationTitle(conversation)}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#777777]">
                      {formatMessageTime(conversation.last_message_at)}
                    </span>
                  </span>

                  <span className="mt-1 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-[#777777]">
                      {conversation.last_message ?? ""}
                    </span>

                    {conversation.unread_count > 0 ? (
                      <span
                        aria-label={`${conversation.unread_count} unread`}
                        className="min-w-5 shrink-0 rounded-full bg-[#8b6f47] px-1.5 py-0.5 text-center text-[10px] leading-none font-bold text-white"
                      >
                        {conversation.unread_count}
                      </span>
                    ) : null}
                  </span>
                </button>

                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(conversation)}
                    aria-label={`Delete conversation with ${conversationTitle(conversation)}`}
                    title="Delete conversation"
                    className="absolute top-2 right-2 hidden rounded-md p-1.5 text-[#999999] transition hover:bg-[#f3e5e5] hover:text-[#a4372f] focus-visible:flex group-hover:flex"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
