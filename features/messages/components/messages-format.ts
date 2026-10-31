// features/messages/components/messages-format.ts

import type { Conversation } from "@/features/messages/types/messages-types";

/** "just now", "5m ago", the time today, or the date - as the standalone inbox shows it. */
export function formatMessageTime(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff = Date.now() - date.getTime();

  if (diff < 60_000) {
    return "just now";
  }

  if (diff < 3_600_000) {
    return `${Math.floor(diff / 60_000)}m ago`;
  }

  if (diff < 86_400_000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** "Pat Doe · +14695550187", or just the number for someone who is not a patient. */
export function conversationTitle(
  conversation: Pick<Conversation, "patient_name" | "patient_phone" | "id">,
): string {
  const phone = conversation.patient_phone || conversation.id;

  return conversation.patient_name
    ? `${conversation.patient_name} · ${phone}`
    : phone;
}
