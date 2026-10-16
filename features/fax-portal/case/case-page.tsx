// features/fax-portal/case/case-page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ReassignDialog } from "@/features/fax-portal/board/board-dialogs";
import { CallCard } from "@/features/fax-portal/case/call-card";
import { CaseHeader } from "@/features/fax-portal/case/case-header";
import { CaseTimeline } from "@/features/fax-portal/case/case-timeline";
import { MessagePanel } from "@/features/fax-portal/case/message-panel";
import { useCallQueue } from "@/features/fax-portal/hooks/use-call-queue";
import { useCase } from "@/features/fax-portal/hooks/use-case";
import {
  useAssignReferral,
  useFaxPortalAgents,
} from "@/features/fax-portal/hooks/use-referral-actions";
import { FaxPdfViewer } from "@/features/fax-portal/intake/fax-pdf-viewer";
import { caseHref } from "@/features/fax-portal/queue/call-queue";
import { useAuthStore } from "@/lib/auth/auth-store";
import { FAX_PORTAL_ROUTES } from "@/lib/constants/routes";

/** Remembered so the Referral Case page can offer to continue where you left off. */
export const LAST_CASE_KEY = "fax-portal.case.last";

export function CasePage({ referralId }: { referralId: number }) {
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === "admin";

  const caseQuery = useCase(referralId);
  const assign = useAssignReferral();

  // Opened from My Call Queue (power dial): offer the next referral to call.
  const fromQueue = useSearchParams().get("from") === "queue";
  const queue = useCallQueue(fromQueue);
  const nextInQueue = queue.data?.items.find(
    (item) => item.priority !== "later" && item.referral_id !== referralId,
  );

  const [showFax, setShowFax] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const agents = useFaxPortalAgents(showReassign);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_CASE_KEY, String(referralId));
    } catch {
      // Not remembered; nothing else depends on it.
    }
  }, [referralId]);

  const detail = caseQuery.data;

  if (caseQuery.isPending) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 py-24 text-sm text-[#6f5636]"
      >
        <div className="size-5 animate-spin rounded-full border-2 border-[#dddddd] border-t-[#8b6f47]" />
        Loading the referral…
      </div>
    );
  }

  if (caseQuery.isError || !detail) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-sm text-[#c0392b]">
        <p>{caseQuery.error?.message ?? "Unable to load this referral."}</p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void caseQuery.refetch()}>
            Try again
          </Button>

          <Link
            href={FAX_PORTAL_ROUTES.case}
            className="inline-flex h-9 items-center rounded-md border border-[#e4ddd0] bg-white px-3 text-sm font-medium text-[#2d2d2d] hover:bg-[#f5f1e8]"
          >
            Find another referral
          </Link>
        </div>
      </div>
    );
  }

  const patientName =
    [detail.fields.first_name, detail.fields.last_name]
      .filter(Boolean)
      .join(" ") || "the patient";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={FAX_PORTAL_ROUTES.board}
          className="text-xs font-semibold text-[#8b6f47] hover:underline"
        >
          ← Back to the board
        </Link>

        <Link
          href={FAX_PORTAL_ROUTES.case}
          className="text-xs font-semibold text-[#8b6f47] hover:underline"
        >
          Find another referral
        </Link>

        {fromQueue && (
          <>
            <Link
              href={FAX_PORTAL_ROUTES.queue}
              className="text-xs font-semibold text-[#8b6f47] hover:underline"
            >
              ← My call queue
            </Link>

            {nextInQueue ? (
              <Link
                href={caseHref(nextInQueue.referral_id)}
                className="inline-flex h-7 items-center rounded-md bg-[#1e8a4c] px-3 text-xs font-semibold text-white hover:bg-[#19753f]"
              >
                Next in queue: {nextInQueue.patient_name} →
              </Link>
            ) : (
              !queue.isPending && (
                <span className="text-xs text-[#6b6f78]">
                  Nothing else to call right now.
                </span>
              )
            )}
          </>
        )}

        {isManager && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="ml-auto"
            onClick={() => setShowReassign(true)}
          >
            Reassign
          </Button>
        )}
      </div>

      <CaseHeader
        key={`${detail.id}:${detail.row_version}`}
        detail={detail}
        onViewFax={() => setShowFax(true)}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <CallCard detail={detail} />

          <CaseTimeline events={detail.timeline} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <MessagePanel detail={detail} />
        </div>
      </div>

      {showFax && (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowFax(false);
            }
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-end bg-white"
              onClick={() => setShowFax(false)}
            >
              Close
            </Button>

            <FaxPdfViewer fax={detail.fax} referralId={detail.id} />
          </div>
        </div>
      )}

      {showReassign && (
        <ReassignDialog
          patientName={patientName}
          currentUserId={detail.assignee?.user_id ?? null}
          agents={agents.data ?? []}
          isLoadingAgents={agents.isPending}
          isPending={assign.isPending}
          onClose={() => setShowReassign(false)}
          onSubmit={(assignedUserId) =>
            assign.mutate(
              {
                referralId: detail.id,
                assignedUserId,
                rowVersion: detail.row_version,
              },
              { onSuccess: () => setShowReassign(false) },
            )
          }
        />
      )}
    </div>
  );
}
