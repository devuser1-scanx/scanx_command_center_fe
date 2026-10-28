// features/calls/components/call-stat-card.tsx

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CallStatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "danger" | "warning";
};

export function CallStatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: CallStatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm",
        tone === "danger" && "border-[#f3c9c4]",
        tone === "warning" && "border-[#f0dcb8]",
        tone === "default" && "border-[#e4ddd0]",
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          tone === "danger" && "bg-[#fdeaea] text-[#c0392b]",
          tone === "warning" && "bg-[#fff4e5] text-[#b45f06]",
          tone === "default" && "bg-[#efeae0] text-[#6f5636]",
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-[#777777]">{title}</p>
        <p className="text-2xl font-bold text-[#2d2d2d]">{value}</p>
        <p className="truncate text-xs text-[#777777]">{subtitle}</p>
      </div>
    </div>
  );
}
