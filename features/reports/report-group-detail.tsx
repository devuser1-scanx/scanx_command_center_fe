// features/reports/report-group-detail.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

import { useReportGroupFiles } from "@/features/reports/hooks/use-report-group-files";
import { fetchReportFileBlob } from "@/features/reports/api/reports-api";
import { ReportPreviewDialog } from "@/features/reports/report-preview-dialog";

function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return "—";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

type ReportGroupDetailProps = {
  groupId: string;
};

export function ReportGroupDetail({ groupId }: ReportGroupDetailProps) {
  const filesQuery = useReportGroupFiles(groupId);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  const previewFile = filesQuery.data?.files.find(
    (file) => file.id === previewFileId,
  );

  async function handleDownload(fileId: string, fileName: string) {
    setDownloadingFileId(fileId);

    try {
      const blob = await fetchReportFileBlob(groupId, fileId, "attachment");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingFileId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/reports"
          className="text-sm font-semibold text-[#8b6f47] hover:underline"
        >
          ← Back to reports
        </Link>
      </div>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">
          {filesQuery.data?.groupName ?? "Report folder"}
        </h2>

        <p className="mt-1 text-sm text-[#777777]">
          {filesQuery.data && (
            <>
              {filesQuery.data.files.length}{" "}
              {filesQuery.data.files.length === 1 ? "file" : "files"}
            </>
          )}
        </p>

        {filesQuery.isLoading && (
          <p className="mt-4 text-sm text-[#777777]">Loading…</p>
        )}

        {filesQuery.isError && (
          <p className="mt-4 text-sm font-semibold text-[#cc3333]">
            {filesQuery.error.message}
          </p>
        )}

        {filesQuery.data && filesQuery.data.files.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4ddd0] text-xs font-semibold uppercase tracking-wide text-[#999999]">
                  <th className="py-2 pr-4">File name</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Last updated</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e4ddd0]">
                {filesQuery.data.files.map((file) => (
                  <tr key={file.id}>
                    <td className="py-3 pr-4 font-semibold text-[#2d2d2d]">
                      {file.fileName}
                    </td>

                    <td className="py-3 pr-4 text-[#555555]">
                      {formatBytes(file.sizeBytes)}
                    </td>

                    <td className="py-3 pr-4 text-[#555555]">
                      {file.updatedAt
                        ? new Date(file.updatedAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewFileId(file.id)}
                          className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
                        >
                          Preview
                        </button>

                        <button
                          type="button"
                          disabled={downloadingFileId === file.id}
                          onClick={() =>
                            handleDownload(file.id, file.fileName)
                          }
                          className="rounded-md bg-[#2d2d2d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {downloadingFileId === file.id
                            ? "Downloading…"
                            : "Download"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ReportPreviewDialog
        groupId={groupId}
        fileId={previewFileId}
        fileName={previewFile?.fileName ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFileId(null);
          }
        }}
      />
    </div>
  );
}
