// features/dashboard/admin/dashboard-stats.tsx

"use client";

import { useMemo } from "react";

import { useDashboardSummary } from "@/features/dashboard/admin/hooks/use-dashboard-summary";

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBadgeClass(tone: string) {
  switch (tone) {
    case "green":
      return "bg-[#e6f7ed] text-[#16803c]";

    case "red":
      return "bg-[#ffeeee] text-[#cc3333]";

    case "orange":
      return "bg-[#fff2df] text-[#b45309]";

    case "blue":
    default:
      return "bg-[#eaf1ff] text-[#2563eb]";
  }
}

export function DashboardStats() {
  const date = useMemo(() => todayIsoDate(), []);
  const summaryQuery = useDashboardSummary(date);

  if (summaryQuery.isLoading) {
    return (
      <p className="text-sm text-[#777777]">
        Loading today&apos;s summary…
      </p>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <p className="text-sm font-semibold text-[#cc3333]">
        {summaryQuery.error?.message ??
          "Unable to load today's summary."}
      </p>
    );
  }

  const summary = summaryQuery.data;

  const stats = [
    { label: "Today", value: summary.today, tone: "blue" },
    {
      label: "Confirmed",
      value: summary.confirmed,
      tone: "green",
    },
    {
      label: "Checked-In",
      value: summary.checkedIn,
      tone: "green",
    },
    { label: "Late", value: summary.late, tone: "red" },
    {
      label: "Report Pending",
      value: summary.reportPending,
      tone: "orange",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 3xl:gap-3">
      {stats.map((item) => (
        <span
          key={item.label}
          className={`rounded-full px-3 py-1.5 text-xs font-bold 3xl:px-4 3xl:py-2 3xl:text-sm 5xl:text-base ${getBadgeClass(item.tone)}`}
        >
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}
