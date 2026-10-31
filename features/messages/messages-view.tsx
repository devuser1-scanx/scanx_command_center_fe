// features/messages/messages-view.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, MessageSquarePlus, PhoneMissed, Send } from "lucide-react";

import { ConfirmDialog } from "@/components/users/confirm-dialog";
import { ChatPanel, NoConversationSelected } from "@/features/messages/components/chat-panel";
import { ConversationList } from "@/features/messages/components/conversation-list";
import { conversationTitle } from "@/features/messages/components/messages-format";
import {
  GenericSalesCardDialog,
  MissedCallCardDialog,
  NewConversationDialog,
  RcsCardDialog,
} from "@/features/messages/components/message-dialogs";
import { useMessagesActions } from "@/features/messages/hooks/use-messages-actions";
import { useConversations } from "@/features/messages/hooks/use-messages-queries";
import type { Conversation } from "@/features/messages/types/messages-types";
import { usePermission } from "@/hooks/use-permission";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { cn } from "@/lib/utils";

type OpenDialog = "new" | "rcs" | "missed" | "generic" | null;

const toolbarButton =
  "inline-flex items-center gap-2 rounded-md border border-[#dddddd] bg-white px-3 py-2 text-xs font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]";

/**
 * The Patient Inbox: the patients' conversations on the left, the open one on
 * the right (one at a time on small screens). It shows the same conversations
 * as the standalone Inbox - they are shared - and refreshes every few seconds.
 */
export function MessagesView() {
  const { hasPermission } = usePermission();
  const canSend = hasPermission(PERMISSIONS.MESSAGES_SEND);

  const conversationsQuery = useConversations();
  const { remove } = useMessagesActions();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [toDelete, setToDelete] = useState<Conversation | null>(null);

  const conversations = conversationsQuery.data?.items;
  const active =
    conversations?.find((conversation) => conversation.id === activeId) ?? null;

  function handleSent(conversationId: string) {
    setDialog(null);
    setActiveId(conversationId);
    toast.success("Message sent.");
  }

  async function confirmDelete() {
    if (!toDelete) {
      return;
    }

    try {
      await remove.mutateAsync(toDelete.id);

      if (activeId === toDelete.id) {
        setActiveId(null);
      }

      toast.success("Conversation deleted.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-[#2d2d2d]">Messages</h2>
          <p className="mt-1 text-sm text-[#777777]">
            Patient text conversations, shared with the Patient Inbox.
          </p>
        </div>

        {canSend ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDialog("new")}
              className="inline-flex items-center gap-2 rounded-md bg-[#8b6f47] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6f5636]"
            >
              <MessageSquarePlus className="size-4" />
              New conversation
            </button>
            <button type="button" onClick={() => setDialog("rcs")} className={toolbarButton}>
              <Send className="size-4" />
              RCS card
            </button>
            <button type="button" onClick={() => setDialog("missed")} className={toolbarButton}>
              <PhoneMissed className="size-4" />
              Missed call card
            </button>
            <button type="button" onClick={() => setDialog("generic")} className={toolbarButton}>
              <CalendarPlus className="size-4" />
              Generic sales card
            </button>
          </div>
        ) : null}
      </section>

      <section className="flex h-[calc(100dvh-16rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-[#e4ddd0] bg-white shadow-sm">
        <div
          className={cn(
            "min-h-0 w-full shrink-0 border-r border-[#e4ddd0] md:block md:w-80",
            active ? "hidden" : "block",
          )}
        >
          <ConversationList
            conversations={conversations ?? []}
            activeId={activeId}
            search={search}
            loading={conversationsQuery.isLoading}
            error={conversationsQuery.isError ? conversationsQuery.error.message : null}
            canDelete={canSend}
            onSearch={setSearch}
            onSelect={setActiveId}
            onDelete={setToDelete}
          />
        </div>

        <div className={cn("min-h-0 min-w-0 flex-1", active ? "block" : "hidden md:block")}>
          {active ? (
            <ChatPanel
              key={active.id}
              conversation={active}
              canSend={canSend}
              onBack={() => setActiveId(null)}
            />
          ) : (
            <NoConversationSelected />
          )}
        </div>
      </section>

      {dialog === "new" ? (
        <NewConversationDialog onClose={() => setDialog(null)} onSent={handleSent} />
      ) : null}
      {dialog === "rcs" ? (
        <RcsCardDialog onClose={() => setDialog(null)} onSent={handleSent} />
      ) : null}
      {dialog === "missed" ? (
        <MissedCallCardDialog onClose={() => setDialog(null)} onSent={handleSent} />
      ) : null}
      {dialog === "generic" ? (
        <GenericSalesCardDialog onClose={() => setDialog(null)} onSent={handleSent} />
      ) : null}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this conversation?"
        description={
          toDelete
            ? `The whole conversation with ${conversationTitle(toDelete)} will be deleted for everyone, including in the standalone Patient Inbox. This can't be undone.`
            : ""
        }
        confirmLabel="Delete conversation"
        destructive
        pending={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
