// features/fax-portal/board/referral-board.tsx

"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { BoardColumn } from "@/features/fax-portal/board/board-column";
import {
  ReassignDialog,
  TextPromptDialog,
} from "@/features/fax-portal/board/board-dialogs";
import { useBoard } from "@/features/fax-portal/hooks/use-board";
import {
  useAssignReferral,
  useFaxPortalAgents,
  useMoveReferral,
} from "@/features/fax-portal/hooks/use-referral-actions";
import type {
  BoardAssigneeFilter,
  BoardCard,
  ReferralStatusCode,
} from "@/features/fax-portal/types/fax-portal-types";
import { useAuthStore } from "@/lib/auth/auth-store";
import {
  faxPortalCaseRoute,
  faxPortalIntakeRoute,
} from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

type DialogState =
  | { kind: "not_referral"; card: BoardCard }
  | { kind: "booked"; card: BoardCard }
  | { kind: "fax_pending"; card: BoardCard }
  | { kind: "reopen"; card: BoardCard; to: ReferralStatusCode }
  | { kind: "reassign"; card: BoardCard }
  | null;

const ASSIGNEE_TABS: Array<{ value: BoardAssigneeFilter; label: string }> = [
  { value: "all", label: "All agents" },
  { value: "me", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
];

const WORKING_STATUSES: ReferralStatusCode[] = [
  "ready_for_contact",
  "follow_up_due",
  "callback_requested",
];

function SummaryPill({
  count,
  label,
  className,
}: {
  count: number;
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        className,
      )}
    >
      {count} {label}
    </span>
  );
}

export function ReferralBoard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === "admin";

  const [assignee, setAssignee] = useState<BoardAssigneeFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showOlder, setShowOlder] = useState<ReferralStatusCode[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overColumn, setOverColumn] = useState<ReferralStatusCode | null>(
    null,
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [now, setNow] = useState(() => Date.now());

  // Wait for a pause in typing before asking the server again.
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Keeps relative times ("4m", "Due now") ticking between polls.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(interval);
  }, []);

  const board = useBoard({ assignee, q: search, showOlder });
  const moveMutation = useMoveReferral();
  const assignMutation = useAssignReferral();
  const agents = useFaxPortalAgents(dialog?.kind === "reassign");

  const columns = useMemo(
    () =>
      (board.data?.columns ?? []).filter(
        // Exception only gets a column when it has something in it.
        (column) => column.code !== "exception" || column.visible_count > 0,
      ),
    [board.data],
  );

  const movingId = moveMutation.isPending
    ? (moveMutation.variables?.referralId ?? null)
    : null;

  function findCard(id: number): BoardCard | undefined {
    for (const column of columns) {
      const card = column.cards.find((candidate) => candidate.id === id);

      if (card) {
        return card;
      }
    }

    return undefined;
  }

  function openCard(card: BoardCard) {
    router.push(
      card.status === "review_required"
        ? faxPortalIntakeRoute(card.id)
        : faxPortalCaseRoute(card.id),
    );
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, card: BoardCard) {
    setDraggingId(card.id);
    event.dataTransfer.effectAllowed = "move";

    try {
      event.dataTransfer.setData("text/plain", String(card.id));
    } catch {
      // Some browsers refuse; the dragging id in state is what we use.
    }
  }

  function endDrag() {
    setDraggingId(null);
    setOverColumn(null);
  }

  function runMove(
    card: BoardCard,
    toStatus: ReferralStatusCode,
    extra: {
      reason?: string;
      note?: string;
      acuityAppointmentId?: string;
      confirmed?: boolean;
    } = {},
  ) {
    moveMutation.mutate(
      {
        referralId: card.id,
        toStatus,
        rowVersion: card.row_version,
        source: "drag",
        ...extra,
      },
      { onSuccess: () => setDialog(null) },
    );
  }

  /**
   * A drag is the same action as the matching button, with the same checks:
   * the server enforces them all. Moves that need input open a dialog first;
   * the rest are sent straight away and the board refreshes either way, so a
   * refused drop snaps back with the reason shown.
   */
  function handleDrop(toStatus: ReferralStatusCode) {
    const card = draggingId === null ? undefined : findCard(draggingId);

    endDrag();

    if (!card || card.status === toStatus) {
      return;
    }

    const fromColumn = columns.find((column) => column.code === card.status);
    const fromClosed = fromColumn ? !fromColumn.is_open : false;

    if (toStatus === "not_referral" && card.status === "review_required") {
      setDialog({ kind: "not_referral", card });
    } else if (toStatus === "appointment_booked") {
      setDialog({ kind: "booked", card });
    } else if (toStatus === "fax_provider_name_pending") {
      setDialog({ kind: "fax_pending", card });
    } else if (
      fromClosed &&
      (WORKING_STATUSES.includes(toStatus) || toStatus === "review_required")
    ) {
      if (isManager) {
        setDialog({ kind: "reopen", card, to: toStatus });
      } else {
        toast.error("Only a manager can reopen a closed referral.");
      }
    } else {
      runMove(card, toStatus);
    }
  }

  function toggleOlder(code: ReferralStatusCode) {
    setShowOlder((current) =>
      current.includes(code)
        ? current.filter((candidate) => candidate !== code)
        : [...current, code],
    );
  }

  const summary = board.data?.summary;
  const patientName = (card: BoardCard) => card.display_name;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#e6dfd3] bg-white px-5 py-4">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#1f2329]">
              Referral Movement Board
            </h2>

            <p className="mt-0.5 text-xs text-[#6b6f78]">
              Every fax Comprehend processes lands in Review Required first.
              Newest cards are at the top of each column. Drag a card to
              another column to change its status.
            </p>
          </div>

          {summary && (
            <div className="ml-auto flex flex-wrap gap-1.5">
              <SummaryPill
                count={summary.received_today}
                label="Received today"
                className="bg-[#e3eefb] text-[#2f6fc0]"
              />
              <SummaryPill
                count={summary.review}
                label="Review"
                className="bg-[#fcf1dc] text-[#b7791f]"
              />
              <SummaryPill
                count={summary.overdue}
                label="Overdue"
                className="bg-[#fbe5e2] text-[#c0392b]"
              />
              <SummaryPill
                count={summary.booked_today}
                label="Booked today"
                className="bg-[#e2f4e9] text-[#1e8a4c]"
              />
              <SummaryPill
                count={summary.fax_provider}
                label="Fax provider"
                className="bg-[#eee9fb] text-[#6b4fc8]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#e6dfd3] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or phone"
            aria-label="Search referrals by name or phone"
            className="w-56 rounded-full border border-[#dddddd] bg-white px-3.5 py-1.5 text-xs text-[#2d2d2d] outline-none placeholder:text-[#777777] focus:border-[#8b6f47]"
          />

          <div className="flex gap-1" role="group" aria-label="Assignee filter">
            {ASSIGNEE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={assignee === tab.value}
                onClick={() => setAssignee(tab.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors",
                  assignee === tab.value
                    ? "border-[#22272f] bg-[#22272f] text-white"
                    : "border-[#e6dfd3] bg-white text-[#2d2d2d] hover:bg-[#f5f1e8]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {board.isPending ? (
          <div
            role="status"
            className="flex items-center justify-center gap-3 py-16 text-sm text-[#6f5636]"
          >
            <div className="size-5 animate-spin rounded-full border-2 border-[#dddddd] border-t-[#8b6f47]" />
            Loading referrals…
          </div>
        ) : board.isError && !board.data ? (
          <div className="flex flex-col items-center gap-3 py-16 text-sm text-[#c0392b]">
            <p>{board.error.message}</p>

            <Button variant="outline" onClick={() => void board.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div
            className="grid items-start gap-3 overflow-x-auto pb-1.5"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(170px, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <BoardColumn
                key={column.code}
                column={column}
                now={now}
                draggingId={draggingId}
                movingId={movingId}
                isDropTarget={
                  overColumn === column.code &&
                  draggingId !== null &&
                  findCard(draggingId)?.status !== column.code
                }
                canReassign={isManager}
                onOpenCard={openCard}
                onReassign={(card) => setDialog({ kind: "reassign", card })}
                onDragStart={handleDragStart}
                onDragEnd={endDrag}
                onDragOverColumn={setOverColumn}
                onDragLeaveColumn={(code) =>
                  setOverColumn((current) => (current === code ? null : current))
                }
                onDropOnColumn={handleDrop}
                onToggleOlder={toggleOlder}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6b6f78]">
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-sm bg-[#c0392b]" />
            Unsuccessful call (counts toward 5)
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-sm bg-[#b7791f]" />
            Callback / did not count
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-sm bg-[#e3ddd2]" />
            Attempt not yet made
          </span>
          <span className="inline-flex items-center gap-1">
            <b className="rounded-full bg-[#c0392b] px-1.5 text-[9px] font-extrabold text-white">
              NEW
            </b>
            Fax not opened yet
          </span>

          {board.dataUpdatedAt > 0 && (
            <span className="ml-auto">
              Updated {format(board.dataUpdatedAt, "h:mm:ss a")} · refreshes
              every 15 s
            </span>
          )}
        </div>
      </div>

      {dialog?.kind === "not_referral" && (
        <TextPromptDialog
          title="Not a referral"
          description={`Move ${patientName(dialog.card)} to Not Referrals.`}
          label="Why is this not a referral?"
          placeholder="e.g. Lab report, marketing fax"
          multiline
          maxLength={2000}
          confirmLabel="Mark as not a referral"
          isPending={moveMutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(reason) =>
            runMove(dialog.card, "not_referral", { reason })
          }
        />
      )}

      {dialog?.kind === "booked" && (
        <TextPromptDialog
          title="Appointment booked"
          description={`Which Acuity appointment did ${patientName(dialog.card)} book?`}
          label="Acuity appointment ID"
          placeholder="e.g. 1234567890"
          maxLength={50}
          confirmLabel="Mark as booked"
          isPending={moveMutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(acuityAppointmentId) =>
            runMove(dialog.card, "appointment_booked", {
              acuityAppointmentId,
            })
          }
        />
      )}

      {dialog?.kind === "reopen" && (
        <TextPromptDialog
          title="Reopen referral"
          description={`Reopen ${patientName(dialog.card)} and move it back to work.`}
          label="Why is it being reopened?"
          multiline
          maxLength={2000}
          confirmLabel="Reopen"
          isPending={moveMutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(note) => runMove(dialog.card, dialog.to, { note })}
        />
      )}

      <ConfirmDialog
        open={dialog?.kind === "fax_pending"}
        title="Move to Fax Provider Name Pending?"
        description={
          dialog?.kind === "fax_pending"
            ? `${patientName(dialog.card)} will leave the active call list. This normally happens automatically after the 5th unsuccessful call.`
            : ""
        }
        confirmLabel="Move"
        isPending={moveMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
        onConfirm={() => {
          if (dialog?.kind === "fax_pending") {
            runMove(dialog.card, "fax_provider_name_pending", {
              confirmed: true,
            });
          }
        }}
      />

      {dialog?.kind === "reassign" && (
        <ReassignDialog
          patientName={patientName(dialog.card)}
          currentUserId={dialog.card.assignee?.user_id ?? null}
          agents={agents.data ?? []}
          isLoadingAgents={agents.isPending}
          isPending={assignMutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(assignedUserId) =>
            assignMutation.mutate(
              {
                referralId: dialog.card.id,
                assignedUserId,
                rowVersion: dialog.card.row_version,
              },
              { onSuccess: () => setDialog(null) },
            )
          }
        />
      )}
    </div>
  );
}
