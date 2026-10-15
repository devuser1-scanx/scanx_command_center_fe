// features/fax-portal/intake/fax-pdf-viewer.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStoredNumber } from "@/hooks/use-stored-number";
import { useFaxPdf } from "@/features/fax-portal/hooks/use-intake";
import { ResizeHandle } from "@/features/fax-portal/intake/resize-handle";
import type { IntakeFax } from "@/features/fax-portal/types/fax-portal-types";

/** What the viewer needs of a fax; the Referral Case has no document list. */
export type ViewerFax = Pick<IntakeFax, "id" | "job_id" | "page_count"> & {
  documents?: IntakeFax["documents"];
};
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 360;
const MAX_HEIGHT = 2400;
const HEIGHT_STEP = 60;

type FaxPdfViewerProps = {
  fax: ViewerFax;
  referralId: number;
  /**
   * True while the column splitter is being dragged. The PDF is an iframe
   * and would swallow the mouse events, so it is made click-through meanwhile.
   */
  suspendPointer?: boolean;
};

/**
 * The original fax. The PDF is fetched through the backend (authenticated and
 * audited) and shown from a temporary in-memory URL; nothing public, nothing
 * cached.
 *
 * It can be made larger: drag the bar under the PDF (or use the arrow keys on
 * it) to change its height, drag the splitter beside it to change its width,
 * or open it full screen. The chosen height is remembered on this device.
 */
export function FaxPdfViewer({
  fax,
  referralId,
  suspendPointer = false,
}: FaxPdfViewerProps) {
  const pdf = useFaxPdf(fax.id, referralId);
  const [page, setPage] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

  // 0 means "automatic": tall relative to the window, until the user resizes.
  const [storedHeight, setStoredHeight] = useStoredNumber(
    "fax-portal.intake.pdf-height",
    0,
    { min: 0, max: MAX_HEIGHT },
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const documents = fax.documents ?? [];
  const jumpTargets = documents.filter(
    (document) => document.page_start !== null,
  );

  // Open on the referral page when Comprehend found one.
  const referralPage =
    documents.find(
      (document) =>
        document.doc_type?.toLowerCase() === "referral" &&
        document.page_start !== null,
    )?.page_start ?? null;

  const activePage = page ?? referralPage;

  function currentHeight(): number {
    return storedHeight > 0
      ? storedHeight
      : (frameRef.current?.getBoundingClientRect().height ?? 700);
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col bg-white p-4",
        isFullscreen
          ? "fixed inset-0 z-[90] rounded-none"
          : "rounded-lg border border-[#e6dfd3]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-[#1f2329]">
          Original fax
          {fax.page_count ? ` · ${fax.page_count} pages` : ""}
        </h3>

        <span
          title={fax.job_id}
          className="ml-auto rounded-full bg-[#eef0f3] px-2.5 py-0.5 text-[11px] font-semibold text-[#555b66]"
        >
          Job {fax.job_id.slice(0, 8)}
        </span>

        <Button
          type="button"
          variant="outline"
          size="xs"
          aria-pressed={isFullscreen}
          onClick={() => setIsFullscreen((current) => !current)}
          title={isFullscreen ? "Exit full screen (Esc)" : "Full screen"}
        >
          {isFullscreen ? (
            <Minimize2 aria-hidden />
          ) : (
            <Maximize2 aria-hidden />
          )}
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </Button>
      </div>

      {jumpTargets.length > 0 && (
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          aria-label="Jump to a document"
        >
          {jumpTargets.map((document) => {
            const target = document.page_start as number;
            const isActive = activePage === target;

            return (
              <button
                key={document.idx}
                type="button"
                onClick={() => setPage(target)}
                title={document.name ?? undefined}
                className={cn(
                  "max-w-[220px] truncate rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                  isActive
                    ? "border-[#8b6f47] bg-[#f1e7d8] text-[#6f5636]"
                    : "border-[#e6dfd3] bg-white text-[#555b66] hover:bg-[#f5f1e8]",
                )}
              >
                {document.doc_type ?? document.name ?? "Document"} · p.{target}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={frameRef}
        style={
          isFullscreen || storedHeight === 0
            ? undefined
            : { height: `${storedHeight}px` }
        }
        className={cn(
          "flex items-stretch justify-center rounded-md bg-[#e9e5de]",
          isFullscreen
            ? "min-h-0 flex-1"
            : storedHeight === 0 && "h-[78vh] min-h-[480px]",
        )}
      >
        {pdf.isLoading && !pdf.error ? (
          <div
            role="status"
            className="flex flex-1 items-center justify-center gap-3 text-sm text-[#6f5636]"
          >
            <div className="size-5 animate-spin rounded-full border-2 border-[#dddddd] border-t-[#8b6f47]" />
            Loading the fax…
          </div>
        ) : pdf.error || !pdf.url ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-[#6b6f78]">
            <p className="max-w-xs">
              {pdf.error?.message ?? "The fax PDF is not available."}
            </p>

            <Button variant="outline" size="sm" onClick={pdf.retry}>
              Try again
            </Button>
          </div>
        ) : (
          <iframe
            // A new key per page makes the browser's PDF viewer jump there.
            key={activePage ?? "start"}
            title="Original fax"
            src={activePage ? `${pdf.url}#page=${activePage}` : pdf.url}
            className={cn(
              "h-full w-full rounded-md border-0",
              (isDraggingHeight || suspendPointer) && "pointer-events-none",
            )}
          />
        )}
      </div>

      {!isFullscreen && (
        <ResizeHandle
          orientation="horizontal"
          label="Resize the fax height"
          className="mt-1 h-3 w-full"
          onResizeStart={() => {
            dragStartHeight.current = currentHeight();
            setIsDraggingHeight(true);
          }}
          onResize={(delta) =>
            setStoredHeight(
              Math.max(MIN_HEIGHT, dragStartHeight.current + delta),
            )
          }
          onResizeEnd={() => setIsDraggingHeight(false)}
          onStep={(direction) =>
            setStoredHeight(
              Math.max(MIN_HEIGHT, currentHeight() + direction * HEIGHT_STEP),
            )
          }
        />
      )}
    </div>
  );
}
