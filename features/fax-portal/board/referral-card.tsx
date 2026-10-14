// features/fax-portal/board/referral-card.tsx

"use client";

import type { DragEvent, KeyboardEvent } from "react";

import {
  CHIP_CLASSES,
  COLUMN_META,
  MAX_CALL_ATTEMPTS,
  formatAge,
  formatWhen,
  getCardChip,
  showsAttempts,
} from "@/features/fax-portal/board/board-meta";
import type { BoardCard } from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type ReferralCardProps = {
  card: BoardCard;
  now: number;
  isDragging: boolean;
  isMoving: boolean;
  canReassign: boolean;
  onOpen: (card: BoardCard) => void;
  onReassign: (card: BoardCard) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, card: BoardCard) => void;
  onDragEnd: () => void;
};

function AttemptDots({ attempts }: { attempts: BoardCard["attempts"] }) {
  return (
    <span
      className="inline-flex gap-[3px]"
      aria-label={`${attempts.filter((a) => a === "miss").length} of ${MAX_CALL_ATTEMPTS} qualifying calls made`}
    >
      {Array.from({ length: MAX_CALL_ATTEMPTS }, (_, index) => {
        const attempt = attempts[index];

        return (
          <span
            key={index}
            className={cn(
              "size-[9px] rounded-full",
              attempt === "miss"
                ? "bg-[#c0392b]"
                : attempt === "other"
                  ? "bg-[#b7791f]"
                  : "bg-[#e3ddd2]",
            )}
          />
        );
      })}
    </span>
  );
}

function AssigneeBadge({
  card,
  canReassign,
  onReassign,
}: {
  card: BoardCard;
  canReassign: boolean;
  onReassign: (card: BoardCard) => void;
}) {
  const badgeClass = card.assignee
    ? "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f1e7d8] text-[9px] font-bold text-[#8b6a3e]"
    : "shrink-0 rounded-full bg-[#eef0f3] px-1.5 py-px text-[9px] font-semibold text-[#555b66]";

  const content = card.assignee ? card.assignee.initials : "Unassigned";

  if (!canReassign) {
    return (
      <span
        title={card.assignee ? `Assigned to ${card.assignee.name}` : undefined}
        className={cn("ml-auto mt-0.5", badgeClass)}
      >
        {content}
      </span>
    );
  }

  // Managers can click the badge to reassign the card.
  return (
    <button
      type="button"
      title={
        card.assignee
          ? `Assigned to ${card.assignee.name}. Click to reassign.`
          : "Unassigned. Click to assign."
      }
      onClick={(event) => {
        event.stopPropagation();
        onReassign(card);
      }}
      className={cn(
        "ml-auto mt-0.5 cursor-pointer ring-[#8b6f47] hover:ring-2",
        badgeClass,
      )}
    >
      {content}
    </button>
  );
}

export function ReferralCard({
  card,
  now,
  isDragging,
  isMoving,
  canReassign,
  onOpen,
  onReassign,
  onDragStart,
  onDragEnd,
}: ReferralCardProps) {
  const chip = getCardChip(card, now);
  const color = COLUMN_META[card.status].color;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && event.target === event.currentTarget) {
      onOpen(card);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={!isMoving}
      onClick={() => onOpen(card)}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => onDragStart(event, card)}
      onDragEnd={onDragEnd}
      style={{ borderLeftColor: color }}
      className={cn(
        "group relative flex cursor-grab flex-col gap-1 rounded-md border border-l-4 border-[#e6dfd3] bg-white px-2.5 py-2 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b6f47] active:cursor-grabbing",
        isDragging && "opacity-40",
        isMoving && "pointer-events-none opacity-50",
      )}
    >
      {card.is_new && (
        <span className="absolute -top-[7px] right-2 rounded-full bg-[#c0392b] px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-white">
          New
        </span>
      )}

      <div className="flex items-start gap-1.5 text-[13px] font-bold text-[#1f2329]">
        <span className="line-clamp-2 min-w-0 break-words" title={card.display_name}>
          {card.display_name}
        </span>

        <AssigneeBadge
          card={card}
          canReassign={canReassign}
          onReassign={onReassign}
        />
      </div>

      <div className="truncate text-[11px] text-[#6b6f78]">
        {card.exam_1
          ? card.exam_2
            ? `${card.exam_1} + ${card.exam_2}`
            : card.exam_1
          : "Exam not set"}
      </div>

      <div className="truncate text-[11px] text-[#6b6f78]">
        {[card.physician_name, card.clinic].filter(Boolean).join(" · ") ||
          "Referring provider not found"}
      </div>

      <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[#6b6f78]">
        {chip && (
          <span
            className={cn(
              "rounded-full px-[7px] py-px text-[10px] font-semibold whitespace-nowrap",
              CHIP_CLASSES[chip.tone],
            )}
          >
            {chip.label}
          </span>
        )}

        {showsAttempts(card.status) && <AttemptDots attempts={card.attempts} />}

        <span className="ml-auto whitespace-nowrap">
          {card.status === "appointment_booked" && card.booked_at
            ? formatWhen(card.booked_at)
            : formatAge(card.created_at, now)}
        </span>
      </div>

    </div>
  );
}
