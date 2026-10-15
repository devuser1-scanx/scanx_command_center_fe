// features/fax-portal/intake/intake-review.tsx

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useStoredNumber } from "@/hooks/use-stored-number";
import { FaxPdfViewer } from "@/features/fax-portal/intake/fax-pdf-viewer";
import { IntakeForm } from "@/features/fax-portal/intake/intake-form";
import { IntakeQueue } from "@/features/fax-portal/intake/intake-queue";
import { ResizeHandle } from "@/features/fax-portal/intake/resize-handle";
import {
  useIntakeDetail,
  useIntakeQueue,
  useMarkViewed,
} from "@/features/fax-portal/hooks/use-intake";
import {
  INTAKE_QUEUE_PAGE_SIZE,
  type IntakeTab,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

// Beside the PDF, the form is never narrower than this.
const FORM_MIN_PX = 340;
const SPLITTER_PX = 14;

function parseReferralId(value: string | null): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

export function IntakeReview() {
  const searchParams = useSearchParams();
  const requestedId = parseReferralId(searchParams.get("referral"));

  const [tab, setTab] = useState<IntakeTab>("waiting");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Referrals released or rejected in this session; hidden straight away
  // instead of waiting for the next queue refresh.
  const [handled, setHandled] = useState<ReadonlySet<number>>(new Set());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(interval);
  }, []);

  const queue = useIntakeQueue(tab, page);

  // After releasing the last fax on a page, fall back to the last page that
  // still exists instead of showing an empty one.
  if (queue.data && page > queue.data.total_pages) {
    setPage(queue.data.total_pages);
  }

  const items = (queue.data?.items ?? []).filter((item) => !handled.has(item.id));

  // The fax opened by default is chosen once and then kept. The queue lists
  // NEW faxes first, so opening one moves it down the list; following "the
  // first item" would silently open (and mark as seen) every fax in turn.
  const [autoId, setAutoId] = useState<number | null>(null);
  const firstItemId = items[0]?.id ?? null;

  if (autoId === null ? firstItemId !== null : handled.has(autoId)) {
    setAutoId(firstItemId);
  }

  const effectiveId =
    (selectedId !== null && !handled.has(selectedId) ? selectedId : null) ??
    (requestedId !== null && !handled.has(requestedId) ? requestedId : null) ??
    autoId;

  const detail = useIntakeDetail(effectiveId);
  const markViewed = useMarkViewed();

  // Opening a referral clears its NEW tag and is logged: once per referral.
  const viewedRef = useRef<number | null>(null);
  const markViewedMutate = markViewed.mutate;

  useEffect(() => {
    if (effectiveId !== null && viewedRef.current !== effectiveId) {
      viewedRef.current = effectiveId;
      markViewedMutate(effectiveId);
    }
  }, [effectiveId, markViewedMutate]);

  function handleDone(referralId: number) {
    setHandled((current) => new Set(current).add(referralId));
    setSelectedId(null);
  }

  const waiting = queue.data?.waiting_count;
  const duplicates = queue.data?.duplicate_count;

  // Width of the PDF next to the form (wide screens). Remembered on this device.
  const [pdfWidthPct, setPdfWidthPct] = useStoredNumber(
    "fax-portal.intake.pdf-width-pct",
    52,
    { min: 30, max: 75 },
  );
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const splitRef = useRef<HTMLDivElement>(null);
  const dragStartPct = useRef(pdfWidthPct);

  /** The PDF may take up to 75% of the width, but never so much that the
   *  form beside it drops below FORM_MIN_PX. */
  function limitPct(pct: number): number {
    const width = splitRef.current?.getBoundingClientRect().width ?? 0;
    const max =
      width > 0
        ? Math.min(75, ((width - SPLITTER_PX - FORM_MIN_PX) / width) * 100)
        : 75;

    return Math.max(30, Math.min(pct, max));
  }

  function resizeWidth(deltaPx: number) {
    const width = splitRef.current?.getBoundingClientRect().width ?? 0;

    if (width > 0) {
      setPdfWidthPct(limitPct(dragStartPct.current + (deltaPx / width) * 100));
    }
  }

  const suggestionKey = detail.data
    ? JSON.stringify([
        detail.data.suggestions.clinic?.acuity_calendar_id,
        detail.data.suggestions.exam_1?.acuity_appointment_type_id,
        detail.data.suggestions.exam_2?.acuity_appointment_type_id,
      ])
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#e6dfd3] bg-white px-5 py-4">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#1f2329]">Intake Review</h2>

            <p className="mt-0.5 text-xs text-[#6b6f78]">
              Every fax Comprehend processes is checked here before Sales sees
              it. Every time a fax is opened it is logged.
            </p>
          </div>

          <div className="ml-auto flex gap-1" role="group" aria-label="Queue">
            {(
              [
                ["waiting", "Waiting", waiting],
                ["duplicates", "Possible duplicate", duplicates],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                aria-pressed={tab === value}
                onClick={() => {
                  setTab(value);
                  setPage(1);
                  setSelectedId(null);
                  setAutoId(null);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors",
                  tab === value
                    ? "border-[#22272f] bg-[#22272f] text-white"
                    : "border-[#e6dfd3] bg-white text-[#2d2d2d] hover:bg-[#f5f1e8]",
                )}
              >
                {label}
                {count !== undefined ? ` (${count})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside>
          {queue.isPending ? (
            <div
              role="status"
              className="py-10 text-center text-sm text-[#6f5636]"
            >
              Loading the queue…
            </div>
          ) : queue.isError && !queue.data ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-[#c0392b]">
              <p>{queue.error.message}</p>

              <Button variant="outline" onClick={() => void queue.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <IntakeQueue
              items={items}
              selectedId={effectiveId}
              tab={tab}
              now={now}
              onSelect={setSelectedId}
              page={queue.data?.page ?? page}
              pageSize={queue.data?.page_size ?? INTAKE_QUEUE_PAGE_SIZE}
              total={queue.data?.total ?? 0}
              totalPages={queue.data?.total_pages ?? 1}
              onPageChange={setPage}
            />
          )}
        </aside>

        <section aria-label="Selected fax" className="min-w-0">
          {effectiveId === null ? (
            <div className="rounded-lg border border-[#e6dfd3] bg-white px-6 py-16 text-center text-sm text-[#6b6f78]">
              {queue.isPending
                ? ""
                : "Select a fax from the queue to review it."}
            </div>
          ) : detail.isPending ? (
            <div
              role="status"
              className="rounded-lg border border-[#e6dfd3] bg-white px-6 py-16 text-center text-sm text-[#6f5636]"
            >
              Loading the referral…
            </div>
          ) : detail.isError || !detail.data ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-[#e6dfd3] bg-white px-6 py-16 text-center text-sm text-[#c0392b]">
              <p>{detail.error?.message ?? "Unable to load this referral."}</p>

              <Button variant="outline" onClick={() => void detail.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <div
              ref={splitRef}
              style={{ "--pdf-col": `${pdfWidthPct}%` } as CSSProperties}
              className="grid items-start gap-4 xl:grid-cols-[min(var(--pdf-col),calc(100%_-_354px))_14px_minmax(0,1fr)] xl:gap-0"
            >
              {/* The PDF keeps its own key so saving a correction does not
                  reload it (every PDF load is an audited view). */}
              <FaxPdfViewer
                key={detail.data.id}
                fax={detail.data.fax}
                referralId={detail.data.id}
                suspendPointer={isResizingWidth}
              />

              <ResizeHandle
                orientation="vertical"
                label="Resize the fax width"
                className="hidden self-stretch xl:flex"
                onResizeStart={() => {
                  dragStartPct.current = pdfWidthPct;
                  setIsResizingWidth(true);
                }}
                onResize={resizeWidth}
                onResizeEnd={() => setIsResizingWidth(false)}
                onStep={(direction) =>
                  setPdfWidthPct(limitPct(pdfWidthPct + direction * 3))
                }
              />

              <IntakeForm
                key={`${detail.data.id}:${detail.data.row_version}:${suggestionKey}`}
                detail={detail.data}
                onDone={handleDone}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
