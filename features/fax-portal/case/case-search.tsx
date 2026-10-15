// features/fax-portal/case/case-search.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { LAST_CASE_KEY } from "@/features/fax-portal/case/case-page";
import { formatAge } from "@/features/fax-portal/board/board-meta";
import { useReferralSearch } from "@/features/fax-portal/hooks/use-case";
import { faxPortalCaseRoute } from "@/lib/constants/routes";

function readLastCase(): number | null {
  try {
    const id = Number(window.localStorage.getItem(LAST_CASE_KEY));

    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * The Referral Case page with no referral chosen: search by patient name or
 * phone, or jump back to the case last opened on this device.
 */
export function CaseSearch() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  // Read once on the client; the search page renders only after sign-in.
  const [lastCase] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readLastCase(),
  );

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(input), 300);

    return () => clearTimeout(timeout);
  }, [input]);

  const results = useReferralSearch(query);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="rounded-lg border border-[#e6dfd3] bg-white px-5 py-4">
        <h2 className="text-xl font-bold text-[#1f2329]">Referral Case</h2>

        <p className="mt-0.5 text-xs text-[#6b6f78]">
          Pick a referral to work it: call the patient, send a text and book the
          appointment. You can also open one from the Referral Board or My Call
          Queue.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="search"
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search by patient name or phone"
            aria-label="Search referrals by patient name or phone"
            className="min-w-64 flex-1 rounded-full border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none placeholder:text-[#777777] focus:border-[#8b6f47]"
          />

          {lastCase !== null && (
            <Link
              href={faxPortalCaseRoute(lastCase)}
              className="inline-flex h-9 items-center rounded-md border border-[#e4ddd0] bg-white px-3 text-sm font-medium text-[#2d2d2d] hover:bg-[#f5f1e8]"
            >
              Continue with the last referral (#{lastCase})
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#e6dfd3] bg-white p-2">
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
          {query.trim() ? "Matching referrals" : "Recently updated"}
        </div>

        {results.isPending ? (
          <p role="status" className="px-3 py-6 text-center text-sm text-[#6f5636]">
            Searching…
          </p>
        ) : results.isError ? (
          <p className="px-3 py-6 text-center text-sm text-[#c0392b]">
            {results.error.message}
          </p>
        ) : (results.data ?? []).length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-[#6b6f78]">
            No referrals found.
          </p>
        ) : (
          <ul>
            {(results.data ?? []).map((item) => (
              <li key={item.id}>
                <Link
                  href={faxPortalCaseRoute(item.id)}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-3 py-2.5 hover:bg-[#faf8f4]"
                >
                  <span className="text-sm font-bold text-[#1f2329]">
                    {item.display_name}
                  </span>

                  <span className="font-mono text-xs text-[#6b6f78]">
                    {item.phone ?? "No phone"}
                  </span>

                  <span className="rounded-full bg-[#eef0f3] px-2 py-0.5 text-[10px] font-semibold text-[#555b66]">
                    {item.status_label}
                  </span>

                  <span className="ml-auto text-[11px] text-[#6b6f78]">
                    {item.assignee ? `${item.assignee.initials} · ` : ""}
                    {formatAge(item.created_at)} ago
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
