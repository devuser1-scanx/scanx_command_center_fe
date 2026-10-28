// features/calls/calls-history-view.tsx

"use client";

import { RefreshCcw } from "lucide-react";

import { CallRow } from "@/features/calls/components/call-row";
import { CallsPageHeader } from "@/features/calls/components/calls-page-header";
import { useMissedCalls, useRecentCalls } from "@/features/calls/hooks/use-calls-queries";
import { cn } from "@/lib/utils";

export function CallsHistoryView() {
  const recentQuery = useRecentCalls(50);
  const missedQuery = useMissedCalls(50);

  const recent = recentQuery.data?.results ?? [];
  const missed = missedQuery.data?.results ?? [];

  const refreshing = recentQuery.isFetching || missedQuery.isFetching;

  function refresh() {
    void recentQuery.refetch();
    void missedQuery.refetch();
  }

  const refreshButton = (
    <button
      type="button"
      onClick={refresh}
      aria-label="Refresh"
      className="rounded-md border border-[#dddddd] bg-white p-2 text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
    >
      <RefreshCcw className={cn("size-4", refreshing && "animate-spin")} />
    </button>
  );

  return (
    <div className="space-y-5">
      <CallsPageHeader
        title="Call history"
        subtitle="Recent calls, missed calls and follow-up status."
        actions={refreshButton}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Recent calls</h3>
          <p className="text-sm text-[#777777]">Latest inbound and outbound activity.</p>

          {recentQuery.isLoading && (
            <p className="mt-4 text-sm text-[#777777]">Loading calls…</p>
          )}

          {recentQuery.isError && (
            <p role="alert" className="mt-4 text-sm text-[#c0392b]">
              {recentQuery.error.message}
            </p>
          )}

          {recentQuery.isSuccess && recent.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
              No recent calls found.
            </p>
          )}

          <div className="mt-4 space-y-2">
            {recent.map((call) => (
              <CallRow key={call.id} call={call} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Missed calls</h3>
          <p className="text-sm text-[#777777]">
            Known patients are shown by name. Unknown callers show only a number.
          </p>

          {missedQuery.isLoading && (
            <p className="mt-4 text-sm text-[#777777]">Loading calls…</p>
          )}

          {missedQuery.isError && (
            <p role="alert" className="mt-4 text-sm text-[#c0392b]">
              {missedQuery.error.message}
            </p>
          )}

          {missedQuery.isSuccess && missed.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
              No missed calls found.
            </p>
          )}

          <div className="mt-4 space-y-2">
            {missed.map((call) => (
              <CallRow key={call.id} call={call} missed />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
