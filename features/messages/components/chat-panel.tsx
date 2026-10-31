// features/messages/components/chat-panel.tsx

"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, LoaderCircle, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import {
  conversationTitle,
  formatMessageTime,
} from "@/features/messages/components/messages-format";
import { useMessagesActions } from "@/features/messages/hooks/use-messages-actions";
import { useConversationMessages } from "@/features/messages/hooks/use-messages-queries";
import type { Conversation } from "@/features/messages/types/messages-types";
import { cn } from "@/lib/utils";

/** What shows where a conversation would be, before one is picked. */
export function NoConversationSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-[#777777]">
      <MessageSquare className="size-10 text-[#c9c0ad]" />
      <p className="text-sm">Select a conversation to start</p>
    </div>
  );
}

type ChatPanelProps = {
  conversation: Conversation;
  canSend: boolean;
  /** Small screens: back to the list. */
  onBack: () => void;
};

export function ChatPanel({ conversation, canSend, onBack }: ChatPanelProps) {
  const messagesQuery = useConversationMessages(conversation.id);
  const { reply, markRead } = useMessagesActions();

  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const messages = messagesQuery.data?.items;
  const unread = conversation.unread_count;

  // Opening a conversation, or a patient writing while it is open, reads it.
  useEffect(() => {
    if (unread > 0) {
      markRead.mutate(conversation.id);
    }
    // `markRead` changes identity every render; only the unread count matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, unread]);

  // A new conversation starts at its newest message.
  useEffect(() => {
    stickToBottomRef.current = true;
  }, [conversation.id]);

  // New messages scroll into view, unless the person scrolled up to read.
  useEffect(() => {
    const area = areaRef.current;

    if (area && stickToBottomRef.current) {
      area.scrollTop = area.scrollHeight;
    }
  }, [messages]);

  function handleScroll() {
    const area = areaRef.current;

    if (area) {
      stickToBottomRef.current =
        area.scrollHeight - area.scrollTop - area.clientHeight < 100;
    }
  }

  async function send() {
    const body = draft.trim();

    if (!body || reply.isPending) {
      return;
    }

    try {
      await reply.mutateAsync({ conversationId: conversation.id, body });
      setDraft("");
      stickToBottomRef.current = true;
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-[#e4ddd0] bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-md p-1.5 text-[#8b6f47] hover:bg-[#f5f1e8] md:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>

        <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[#2d2d2d]">
          {conversationTitle(conversation)}
        </h3>
      </header>

      <div
        ref={areaRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#f5f1e8] p-4"
      >
        {messagesQuery.isLoading ? (
          <p className="text-center text-sm text-[#777777]">Loading messages…</p>
        ) : null}

        {messagesQuery.isError ? (
          <p role="alert" className="text-center text-sm font-semibold text-[#cc3333]">
            {messagesQuery.error.message}
          </p>
        ) : null}

        {messages && messages.length === 0 ? (
          <p className="text-center text-sm text-[#777777]">No messages yet.</p>
        ) : null}

        {messages?.map((message) => {
          const outbound = message.direction === "outbound";

          return (
            <div
              key={message.id}
              className={cn("flex flex-col", outbound ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm break-words whitespace-pre-wrap sm:max-w-[70%]",
                  outbound
                    ? "rounded-br-sm bg-[#8b6f47] text-white"
                    : "rounded-bl-sm border border-[#e4ddd0] bg-white text-[#2d2d2d]",
                )}
              >
                {message.body || (message.media_url ? "[Media]" : "")}
              </div>

              <p className="mt-1 text-[10px] text-[#777777]">
                {outbound
                  ? `Sent by ${message.sent_by || "staff"} · ${formatMessageTime(message.created_at)}`
                  : `Patient · ${formatMessageTime(message.created_at)}`}
              </p>
            </div>
          );
        })}
      </div>

      {canSend ? (
        <div className="flex items-end gap-2 border-t border-[#e4ddd0] bg-white p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={reply.isPending}
            rows={2}
            maxLength={1600}
            placeholder="Type a reply…"
            aria-label="Reply"
            className="max-h-32 min-h-12 flex-1 resize-none rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm text-[#2d2d2d] outline-none placeholder:text-[#aaaaaa] focus:border-[#8b6f47] disabled:bg-[#f5f5f5]"
          />

          <button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || reply.isPending}
            aria-label="Send reply"
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#8b6f47] text-white transition hover:bg-[#6f5636] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reply.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
