// features/calls/calls-dashboard-view.tsx

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  RefreshCcw,
  Timer,
} from "lucide-react";

import { CallRow } from "@/features/calls/components/call-row";
import { CallStatCard } from "@/features/calls/components/call-stat-card";
import { CallsPageHeader } from "@/features/calls/components/calls-page-header";
import { formatDuration } from "@/features/calls/components/calls-format";
import { useCallsSummary } from "@/features/calls/hooks/use-calls-queries";
import { cn } from "@/lib/utils";

type FilterMode = "today" | "single" | "range";

const MODES: Array<{ mode: FilterMode; label: string }> = [
  { mode: "today", label: "Today" },
  { mode: "single", label: "Single day" },
  { mode: "range", label: "Date range" },
];

const dateInputClasses =
  "rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]";

export function CallsDashboardView() {
  const [mode, setMode] = useState<FilterMode>("today");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const query = useMemo(() => {
    if (mode === "single") {
      return { startDate: singleDate || undefined, endDate: singleDate || undefined };
    }

    if (mode === "range") {
      return {
        startDate: startDate || undefined,
        endDate: endDate || startDate || undefined,
      };
    }

    return {};
  }, [mode, singleDate, startDate, endDate]);

  const summaryQuery = useCallsSummary(query);
  const summary = summaryQuery.data;

  const rangeLabel =
    mode === "today"
      ? "Today"
      : mode === "single"
        ? singleDate || "Selected day"
        : startDate && endDate
          ? `${startDate} to ${endDate}`
          : startDate
            ? `${startDate} onwards`
            : "Date range";

  return (
    <div className="space-y-5">
      <CallsPageHeader
        title="Calls"
        subtitle="Live overview of ScanX calling activity."
      />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-[#2d2d2d]">Call summary</h3>
          <p className="text-sm text-[#777777]">Showing: {rangeLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full bg-[#efeae0] p-1">
            {MODES.map((item) => (
              <button
                key={item.mode}
                type="button"
                onClick={() => setMode(item.mode)}
                aria-pressed={mode === item.mode}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  mode === item.mode
                    ? "bg-[#8b6f47] text-white"
                    : "text-[#6b6459] hover:bg-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === "single" && (
            <input
              type="date"
              aria-label="Date"
              value={singleDate}
              onChange={(event) => setSingleDate(event.target.value)}
              className={dateInputClasses}
            />
          )}

          {mode === "range" && (
            <>
              <input
                type="date"
                aria-label="From"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={dateInputClasses}
              />
              <input
                type="date"
                aria-label="To"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={dateInputClasses}
              />
            </>
          )}

          <button
            type="button"
            onClick={() => void summaryQuery.refetch()}
            aria-label="Refresh"
            className="rounded-md border border-[#dddddd] bg-white p-2 text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
          >
            <RefreshCcw
              className={cn("size-4", summaryQuery.isFetching && "animate-spin")}
            />
          </button>
        </div>
      </section>

      {summaryQuery.isLoading && (
        <p className="text-sm text-[#777777]">Loading the call summary…</p>
      )}

      {summaryQuery.isError && (
        <p
          role="alert"
          className="rounded-xl border border-[#f3c9c4] bg-[#fff7f6] p-4 text-sm text-[#c0392b]"
        >
          {summaryQuery.error.message}
        </p>
      )}

      {summary && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CallStatCard
              title="Total calls"
              value={summary.total_calls}
              subtitle="All calls in the period"
              icon={<Phone className="size-5" />}
            />
            <CallStatCard
              title="Outgoing calls"
              value={summary.outgoing_calls}
              subtitle="Calls made by staff"
              icon={<PhoneOutgoing className="size-5" />}
            />
            <CallStatCard
              title="Incoming calls"
              value={summary.incoming_calls}
              subtitle="Calls received"
              icon={<PhoneIncoming className="size-5" />}
            />
            <CallStatCard
              title="Missed calls"
              value={summary.missed_calls}
              subtitle="Needs follow-up"
              icon={<PhoneMissed className="size-5" />}
              tone={summary.missed_calls > 0 ? "danger" : "default"}
            />
            <CallStatCard
              title="Completed calls"
              value={summary.completed_calls}
              subtitle="Successfully completed"
              icon={<CheckCircle className="size-5" />}
            />
            <CallStatCard
              title="Failed / busy"
              value={summary.failed_or_busy_calls}
              subtitle="Failed or busy calls"
              icon={<AlertTriangle className="size-5" />}
              tone={summary.failed_or_busy_calls > 0 ? "warning" : "default"}
            />
            <CallStatCard
              title="No answer"
              value={summary.no_answer_calls}
              subtitle="Patient did not answer"
              icon={<PhoneMissed className="size-5" />}
              tone={summary.no_answer_calls > 0 ? "warning" : "default"}
            />
            <CallStatCard
              title="Average duration"
              value={formatDuration(summary.average_duration_seconds)}
              subtitle="Average call length"
              icon={<Timer className="size-5" />}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[#2d2d2d]">Missed calls</h3>
              <p className="text-sm text-[#777777]">
                Known patients show their name. Unknown callers show only a number.
              </p>

              <div className="mt-4 space-y-2">
                {summary.missed_calls_list.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
                    No missed calls for this period.
                  </p>
                )}

                {summary.missed_calls_list.map((call) => (
                  <CallRow key={call.id} call={call} missed />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[#2d2d2d]">Recent call activity</h3>
              <p className="text-sm text-[#777777]">Latest calls from this period.</p>

              <div className="mt-4 space-y-2">
                {summary.recent_calls.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
                    No recent calls for this period.
                  </p>
                )}

                {summary.recent_calls.map((call) => (
                  <CallRow key={call.id} call={call} />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
