// features/calls/components/calls-page-header.tsx

"use client";

import type { ReactNode } from "react";

import { useCallsLive } from "@/features/calls/calls-section";
import { cn } from "@/lib/utils";

type CallsPageHeaderProps = {
  title: string;
  subtitle: string;
  /** Extra controls on the right, next to the live indicator. */
  actions?: ReactNode;
};

export function CallsPageHeader({ title, subtitle, actions }: CallsPageHeaderProps) {
  const live = useCallsLive();

  return (
    <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">{title}</h2>
        <p className="mt-1 text-sm text-[#777777]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            live ? "bg-[#e6f7ed] text-[#16803c]" : "bg-[#efeae0] text-[#6b6459]",
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              live ? "bg-[#16803c]" : "bg-[#9a9285]",
            )}
          />
          {live ? "Live connected" : "Live disconnected"}
        </span>
      </div>
    </section>
  );
}
