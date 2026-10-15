// features/fax-portal/board/board-column.tsx

"use client";

import type { DragEvent } from "react";

import { COLUMN_META } from "@/features/fax-portal/board/board-meta";
import { ReferralCard } from "@/features/fax-portal/board/referral-card";
import type {
  BoardCard,
  BoardColumn as BoardColumnData,
  ReferralStatusCode,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type BoardColumnProps = {
  column: BoardColumnData;
  now: number;
  draggingId: number | null;
  movingId: number | null;
  isDropTarget: boolean;
  canReassign: boolean;
  onOpenCard: (card: BoardCard) => void;
  onReassign: (card: BoardCard) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, card: BoardCard) => void;
  onDragEnd: () => void;
  onDragOverColumn: (code: ReferralStatusCode) => void;
  onDragLeaveColumn: (code: ReferralStatusCode) => void;
  onDropOnColumn: (code: ReferralStatusCode) => void;
  onToggleOlder: (code: ReferralStatusCode) => void;
};

export function BoardColumn({
  column,
  now,
  draggingId,
  movingId,
  isDropTarget,
  canReassign,
  onOpenCard,
  onReassign,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropOnColumn,
  onToggleOlder,
}: BoardColumnProps) {
  const meta = COLUMN_META[column.code];

  return (
    <section
      aria-label={column.label}
      onDragOver={(event) => {
        if (draggingId === null) {
          return;
        }

        event.preventDefault();
        onDragOverColumn(column.code);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDragLeaveColumn(column.code);
        }
      }}
      onDrop={(event) => {
        if (draggingId === null) {
          return;
        }

        event.preventDefault();
        onDropOnColumn(column.code);
      }}
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-lg border bg-[#faf8f4] p-2.5",
        isDropTarget
          ? "border-dashed border-[#8b6f47] bg-[#f1e7d8]"
          : "border-[#e6dfd3]",
      )}
    >
      <header className="flex items-center gap-1.5 text-xs font-bold text-[#1f2329]">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />

        <div className="min-w-0">
          <div className="truncate">{column.label}</div>

          {meta.subtitle && (
            <div className="truncate text-[10.5px] font-normal text-[#6b6f78]">
              {meta.subtitle}
            </div>
          )}
        </div>

        <span className="ml-auto text-[11px] font-semibold text-[#6b6f78]">
          {column.visible_count}
        </span>
      </header>

      {column.cards.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#e6dfd3] px-1.5 py-3.5 text-center text-[11px] text-[#6b6f78]">
          Drop a card here
        </div>
      ) : (
        column.cards.map((card) => (
          <ReferralCard
            key={card.id}
            card={card}
            now={now}
            isDragging={draggingId === card.id}
            isMoving={movingId === card.id}
            canReassign={canReassign}
            onOpen={onOpenCard}
            onReassign={onReassign}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))
      )}

      {column.truncated && (
        <p className="text-center text-[10.5px] text-[#6b6f78]">
          Showing the newest {column.cards.length} of {column.visible_count}.
          Use search to find others.
        </p>
      )}

      {(column.hidden_count > 0 || column.showing_older) && (
        <button
          type="button"
          onClick={() => onToggleOlder(column.code)}
          className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#6f5636] hover:bg-[#f1e7d8]"
        >
          {column.showing_older
            ? "Hide older"
            : `Show ${column.hidden_count} older`}
        </button>
      )}
    </section>
  );
}
