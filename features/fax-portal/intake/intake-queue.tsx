// features/fax-portal/intake/intake-queue.tsx

"use client";

import { formatAge } from "@/features/fax-portal/board/board-meta";
import type {
  IntakeQueueItem,
  IntakeTab,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type IntakeQueueProps = {
  items: IntakeQueueItem[];
  selectedId: number | null;
  tab: IntakeTab;
  now: number;
  onSelect: (id: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function Pager({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: Pick<
  IntakeQueueProps,
  "page" | "pageSize" | "total" | "totalPages" | "onPageChange"
>) {
  if (total <= pageSize) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Queue pages"
      className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[#6b6f78]"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-[#e6dfd3] bg-white px-2.5 py-1 font-semibold text-[#2d2d2d] transition-colors hover:bg-[#f5f1e8] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹ Prev
      </button>

      <span aria-live="polite" className="text-center">
        {first}–{last} of {total}
        <span className="block text-[10px]">
          Page {page} of {totalPages}
        </span>
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-[#e6dfd3] bg-white px-2.5 py-1 font-semibold text-[#2d2d2d] transition-colors hover:bg-[#f5f1e8] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next ›
      </button>
    </nav>
  );
}

/** Faxes waiting for review: NEW (never opened) first, then newest. */
export function IntakeQueue({
  items,
  selectedId,
  tab,
  now,
  onSelect,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: IntakeQueueProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#e6dfd3] bg-white px-4 py-10 text-center text-sm text-[#6b6f78]">
        {tab === "duplicates"
          ? "No possible duplicates are waiting."
          : "Nothing is waiting for review."}
      </div>
    );
  }

  return (
    <>
    <ul className="flex flex-col gap-2" aria-label="Faxes waiting for review">
      {items.map((item) => {
        const isSelected = item.id === selectedId;

        return (
          <li key={item.id}>
            <button
              type="button"
              aria-current={isSelected ? "true" : undefined}
              onClick={() => onSelect(item.id)}
              className={cn(
                "relative flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-[#8b6f47] bg-[#f1e7d8]"
                  : "border-[#e6dfd3] bg-white hover:bg-[#faf8f4]",
              )}
            >
              {item.is_new && (
                <span className="absolute -top-[7px] right-2 rounded-full bg-[#c0392b] px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-white">
                  New
                </span>
              )}

              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#1f2329]">
                <span className="line-clamp-2 min-w-0 break-words">
                  {item.display_name}
                </span>

                {item.assignee && (
                  <span
                    title={`Assigned to ${item.assignee.name}`}
                    className="ml-auto inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f1e7d8] text-[9px] font-bold text-[#8b6a3e]"
                  >
                    {item.assignee.initials}
                  </span>
                )}
              </span>

              <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6b6f78]">
                {item.is_urgent && (
                  <span className="rounded-full bg-[#fbe5e2] px-[7px] py-px text-[10px] font-semibold text-[#c0392b]">
                    Urgent
                  </span>
                )}

                {item.possible_duplicate && (
                  <span className="rounded-full bg-[#eee9fb] px-[7px] py-px text-[10px] font-semibold text-[#6b4fc8]">
                    Possible duplicate
                  </span>
                )}

                {item.page_count ? <span>{item.page_count} pp</span> : null}

                <span className="ml-auto whitespace-nowrap">
                  {formatAge(item.created_at, now)} ago
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>

    <Pager
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
    </>
  );
}
