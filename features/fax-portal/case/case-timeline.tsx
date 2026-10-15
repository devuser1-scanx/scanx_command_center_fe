// features/fax-portal/case/case-timeline.tsx

import { format } from "date-fns";

import type { TimelineEvent } from "@/features/fax-portal/types/fax-portal-types";

const DOT: Record<TimelineEvent["kind"], string> = {
  status: "#1e8a4c",
  call: "#c0392b",
  message: "#2f6fc0",
  edit: "#b7791f",
  system: "#7a808c",
};

/** What happened on this referral, newest first. */
export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="rounded-lg border border-[#e6dfd3] bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-[#1f2329]">Activity</h3>

      {events.length === 0 ? (
        <p className="text-xs text-[#6b6f78]">Nothing has happened yet.</p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event, index) => (
            <li
              key={`${event.at}-${index}`}
              className="grid grid-cols-[84px_14px_minmax(0,1fr)] gap-2 pb-3 text-xs"
            >
              <time
                dateTime={event.at}
                className="text-right text-[11px] tabular-nums text-[#6b6f78]"
              >
                {format(new Date(event.at), "MMM d h:mm a")}
              </time>

              <span
                className="mt-1 size-2.5 justify-self-center rounded-full"
                style={{ backgroundColor: DOT[event.kind] }}
              />

              <div className="min-w-0">
                <span className="font-semibold text-[#1f2329]">
                  {event.title}
                </span>

                {event.actor && (
                  <span className="text-[#6b6f78]"> · {event.actor}</span>
                )}

                {event.detail && (
                  <div className="break-words text-[#6b6f78]">
                    {event.detail}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
