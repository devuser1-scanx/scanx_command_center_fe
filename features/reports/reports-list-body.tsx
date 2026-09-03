// features/reports/reports-list-body.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useReportGroups } from "@/features/reports/hooks/use-report-groups";

const PAGE_SIZE = 20;

const SOURCE_LABELS: Record<string, string> = {
  tricefy: "Tricefy",
  fibroscan: "FibroScan",
};

function formatUpdatedAt(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type ReportsListBodyProps = {
  initialSearch: string;
  initialPage: number;
};

export function ReportsListBody({
  initialSearch,
  initialPage,
}: ReportsListBodyProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialSearch);

  const reportsQuery = useReportGroups({
    search: initialSearch || undefined,
    page: initialPage,
    pageSize: PAGE_SIZE,
  });

  function pushParams(search: string, page: number) {
    const query = new URLSearchParams();

    if (search) {
      query.set("q", search);
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();

    router.push(
      queryString ? `/reports?${queryString}` : "/reports",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushParams(inputValue.trim(), 1);
  }

  function handleClear() {
    setInputValue("");
    pushParams("", 1);
  }

  const total = reportsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = reportsQuery.data?.page ?? initialPage;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">Reports</h2>

        <p className="mt-1 text-sm text-[#777777]">
          Browse ultrasound and FibroScan reports from the reports bucket.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap gap-2"
        >
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search reports by patient / folder name"
            className="min-w-0 flex-1 rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
          />

          <button
            type="submit"
            className="rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
          >
            Search
          </button>

          {initialSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            {initialSearch
              ? `Results for "${initialSearch}"`
              : "All reports"}
          </h3>

          {reportsQuery.data && (
            <p className="text-sm text-[#777777]">
              {total} {total === 1 ? "report" : "reports"}
            </p>
          )}
        </div>

        {reportsQuery.isLoading && (
          <p className="mt-4 text-sm text-[#777777]">Loading…</p>
        )}

        {reportsQuery.isError && (
          <p className="mt-4 text-sm font-semibold text-[#cc3333]">
            {reportsQuery.error.message}
          </p>
        )}

        {reportsQuery.data && reportsQuery.data.items.length === 0 && (
          <p className="mt-4 text-sm text-[#777777]">No reports found.</p>
        )}

        {reportsQuery.data && reportsQuery.data.items.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4ddd0] text-xs font-semibold uppercase tracking-wide text-[#999999]">
                  <th className="py-2 pr-4">Folder</th>
                  <th className="py-2 pr-4">Bucket</th>
                  <th className="py-2 pr-4">Files</th>
                  <th className="py-2 pr-4">Last updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e4ddd0]">
                {reportsQuery.data.items.map((group) => (
                  <tr
                    key={group.id}
                    className="transition hover:bg-[#fbfaf7]"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/reports/${encodeURIComponent(group.id)}`}
                        className="font-semibold text-[#2d2d2d] hover:text-[#8b6f47]"
                      >
                        {group.name}
                      </Link>
                    </td>

                    <td className="py-3 pr-4 text-[#555555]">
                      {SOURCE_LABELS[group.source] ?? group.source}
                    </td>

                    <td className="py-3 pr-4 text-[#555555]">
                      {group.fileCount}
                    </td>

                    <td className="py-3 pr-4 text-[#555555]">
                      {formatUpdatedAt(group.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportsQuery.data && total > 0 && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-xs text-[#999999]">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => pushParams(initialSearch, currentPage - 1)}
                className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => pushParams(initialSearch, currentPage + 1)}
                className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
