// features/fax-portal/queue/call-queue.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCallQueue } from "@/features/fax-portal/hooks/use-call-queue";
import type {
  CallQueueItem,
  CallQueuePriority,
} from "@/features/fax-portal/types/fax-portal-types";
import { FAX_PORTAL_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

/** Where a row opens: the Referral Case, remembering it came from the queue. */
export function caseHref(referralId: number): string {
  return `${FAX_PORTAL_ROUTES.case}/${referralId}?from=queue`;
}

const CHIP: Record<CallQueuePriority, string> = {
  callback: "bg-[#ede7f7] text-[#6b46c1]",
  reply: "bg-[#ddf4ef] text-[#0f766e]",
  overdue: "bg-[#fbe5e2] text-[#c0392b]",
  new: "bg-[#e3ecfb] text-[#2f5d9b]",
  later: "bg-[#fcf1dc] text-[#b7791f]",
};

/** (214) 555-0187 for US numbers, otherwise as it is on the card. */
function formatPhone(item: CallQueueItem): string {
  const digits = (item.phone_e164 ?? "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return item.phone ?? item.phone_e164 ?? "No phone";
}

/** 22m, 1h, 3d: how long ago the referral arrived. */
function ageLabel(receivedAt: string, now: number): string {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(receivedAt).getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)}h`;
  }

  return `${Math.floor(minutes / (60 * 24))}d`;
}

const HEADERS = [
  "Priority",
  "Patient",
  "Phone",
  "Exam requested",
  "Referring provider",
  "Age",
  "Attempts",
  "Last result",
  "Next action",
];

export function CallQueue() {
  const router = useRouter();
  const queue = useCallQueue();
  const [now, setNow] = useState(() => Date.now());

  // Keeps the ages right between refreshes.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(interval);
  }, []);

  const items = queue.data?.items ?? [];
  const first = items.find((item) => item.priority !== "later");

  function startCalling() {
    if (!first) {
      toast.info("Nothing to call right now.");

      return;
    }

    router.push(caseHref(first.referral_id));
  }

  return (
    <div className="rounded-lg border border-[#e6dfd3] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0ebe2] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1f2329]">My Call Queue</h2>

          <p className="mt-1 text-xs text-[#6b6f78]">
            Sorted by who to call next: callbacks due, overdue follow-ups, then
            new referrals oldest first. Contact hours 9:00 to 19:00 patient
            time.
          </p>
        </div>

        <Button
          type="button"
          className="bg-[#1e8a4c] text-white hover:bg-[#19753f]"
          title="Opens the first referral in the queue"
          onClick={startCalling}
        >
          Start calling (power dial)
        </Button>
      </div>

      {queue.isPending ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-16 text-sm text-[#6f5636]"
        >
          <div className="size-5 animate-spin rounded-full border-2 border-[#dddddd] border-t-[#8b6f47]" />
          Loading your queue…
        </div>
      ) : queue.isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-[#c0392b]">
          <p>{queue.error.message}</p>

          <Button variant="outline" onClick={() => void queue.refetch()}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold text-[#1f2329]">
            Your queue is clear.
          </p>

          <p className="mt-1 text-xs text-[#6b6f78]">
            Referrals assigned to you appear here when a call is due.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
                {HEADERS.map((header) => (
                  <th key={header} className="px-5 py-3 font-semibold">
                    {header}
                  </th>
                ))}

                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.referral_id}
                  className={cn(
                    "border-t border-[#f0ebe2] text-[#2d2d2d]",
                    item.priority === "reply" && "bg-[#fdf6e8]",
                  )}
                >
                  <td className="px-5 py-2.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
                        CHIP[item.priority],
                      )}
                    >
                      {item.priority_label}
                    </span>
                  </td>

                  <td className="px-5 py-2.5 font-semibold">
                    {item.patient_name}
                  </td>

                  <td className="px-5 py-2.5 font-mono text-xs whitespace-nowrap">
                    {formatPhone(item)}
                  </td>

                  <td className="px-5 py-2.5">{item.exam ?? "—"}</td>

                  <td className="px-5 py-2.5">{item.provider ?? "—"}</td>

                  <td className="px-5 py-2.5 whitespace-nowrap">
                    {ageLabel(item.received_at, now)}
                  </td>

                  <td className="px-5 py-2.5 whitespace-nowrap">
                    {item.attempts} / {item.attempt_limit}
                  </td>

                  <td className="px-5 py-2.5">{item.last_result ?? "—"}</td>

                  <td className="px-5 py-2.5 whitespace-nowrap">
                    {item.next_action}
                  </td>

                  <td className="px-5 py-2.5 text-right">
                    <Link
                      href={caseHref(item.referral_id)}
                      className="inline-flex h-7 items-center rounded-md bg-[#1e8a4c] px-3 text-xs font-semibold whitespace-nowrap text-white hover:bg-[#19753f]"
                    >
                      Open &amp; call
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="border-t border-[#f0ebe2] px-5 py-3 text-[11px] text-[#6b6f78] italic">
        Sales agents see minimum-necessary fields only. The original fax is not
        visible from this screen.
      </p>
    </div>
  );
}
