// features/fax-portal/case/message-panel.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatWhen } from "@/features/fax-portal/board/board-meta";
import {
  useMessageTemplates,
  useSendMessage,
} from "@/features/fax-portal/hooks/use-case";
import type {
  CaseDetail,
  CaseMessage,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 1600;
const PLACEHOLDER = /\{(\w+)\}/g;

const STATUS_LABEL: Record<string, string> = {
  queued: "Sending",
  accepted: "Sending",
  sending: "Sending",
  scheduled: "Scheduled",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  undelivered: "Not delivered",
  failed: "Failed",
  received: "Received",
};

function Bubble({ message }: { message: CaseMessage }) {
  const outbound = message.direction === "outbound";
  const failed = message.status === "failed" || message.status === "undelivered";

  return (
    <div
      className={cn(
        "flex max-w-[88%] flex-col gap-0.5",
        outbound ? "items-end self-end" : "items-start self-start",
      )}
    >
      <div
        className={cn(
          "px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
          outbound
            ? "rounded-[10px_10px_2px_10px] bg-[#e3eefb] text-[#1f2329]"
            : "rounded-[10px_10px_10px_2px] bg-[#eef0f3] text-[#1f2329]",
          failed && "bg-[#fbe5e2]",
        )}
      >
        {message.body}
      </div>

      <div
        className={cn(
          "text-[10px]",
          failed ? "text-[#c0392b]" : "text-[#6b6f78]",
        )}
      >
        {[
          outbound ? (STATUS_LABEL[message.status] ?? message.status) : null,
          message.channel.toUpperCase(),
          formatWhen(message.created_at),
          outbound ? message.user_name : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        {failed && message.error_message ? ` · ${message.error_message}` : ""}
      </div>
    </div>
  );
}

export function MessagePanel({ detail }: { detail: CaseDetail }) {
  const templates = useMessageTemplates(detail.id);
  const send = useSendMessage(detail.id);

  const [templateCode, setTemplateCode] = useState("");
  const [body, setBody] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const messageCount = detail.messages.length;

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messageCount]);

  const chosen = templates.data?.find((t) => t.code === templateCode);
  const unfilled = Array.from(body.matchAll(PLACEHOLDER)).map((m) => m[1]);
  const blocked = !detail.can_text ? detail.text_blocked_reason : null;
  const canSend =
    detail.can_text &&
    body.trim().length > 0 &&
    unfilled.length === 0 &&
    !send.isPending;

  function chooseTemplate(code: string) {
    setTemplateCode(code);

    const template = templates.data?.find((t) => t.code === code);

    if (template) {
      setBody(template.body);

      if (template.missing.length > 0) {
        toast.info(
          `Fill in: ${template.missing.map((name) => `{${name}}`).join(", ")}`,
        );
      }
    }
  }

  async function handleSend() {
    try {
      await send.mutateAsync({
        body: body.trim(),
        templateCode: templateCode || null,
      });

      toast.success("Text message sent.");
      setBody("");
      setTemplateCode("");
    } catch {
      // The hook already showed the reason.
    }
  }

  return (
    <div className="rounded-lg border border-[#e6dfd3] bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-[#1f2329]">Text messages</h3>

      <div className="flex flex-col gap-2 rounded-md border border-[#e6dfd3] p-2.5">
        <div
          ref={listRef}
          aria-label="Messages"
          className="flex max-h-72 min-h-16 flex-col gap-2 overflow-y-auto pr-1"
        >
          {detail.messages.length === 0 ? (
            <p className="py-3 text-center text-xs text-[#6b6f78]">
              No messages yet.
            </p>
          ) : (
            detail.messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))
          )}
        </div>

        {(detail.sms_opted_out || detail.do_not_call) && (
          <p className="rounded-md bg-[#fbe5e2] px-2.5 py-1.5 text-[11px] font-semibold text-[#c0392b]">
            {detail.do_not_call
              ? "This number is on the do-not-call list."
              : "The patient has opted out of texts (replied STOP)."}
          </p>
        )}

        <label
          htmlFor="message-template"
          className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]"
        >
          Template
        </label>

        <select
          id="message-template"
          value={templateCode}
          disabled={!detail.can_text || templates.isPending}
          onChange={(event) => chooseTemplate(event.target.value)}
          className="w-full rounded-md border border-[#e6dfd3] bg-white px-2 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47] disabled:bg-[#f5f1e8]"
        >
          <option value="">Write my own message</option>

          {(templates.data ?? []).map((template) => (
            <option key={template.code} value={template.code}>
              {template.label}
            </option>
          ))}
        </select>

        <textarea
          aria-label="Message"
          value={body}
          maxLength={MAX_LENGTH}
          disabled={!detail.can_text}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            detail.can_text
              ? "Type a message, or pick a template above"
              : (blocked ?? "")
          }
          className="min-h-20 w-full resize-y rounded-md border border-[#e6dfd3] bg-white px-2 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47] disabled:bg-[#f5f1e8]"
        />

        {unfilled.length > 0 && (
          <p className="text-[11px] text-[#b7791f]">
            Fill in {unfilled.map((name) => `{${name}}`).join(", ")} before
            sending.
            {chosen?.missing.includes("booking_link") &&
              " The booking link needs Exam 1 (and its Acuity booking page)."}
          </p>
        )}

        {blocked && (
          <p
            role="status"
            className="rounded-md bg-[#fcf1dc] px-2.5 py-1.5 text-[11px] text-[#b7791f]"
          >
            {blocked}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" disabled={!canSend} onClick={() => void handleSend()}>
            {send.isPending ? "Sending…" : "Send text"}
          </Button>

          <span className="text-[11px] text-[#6b6f78]">
            Sent as RCS with SMS fallback · no texts 9 PM to 8 AM (clinic time)
            · {body.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
