// features/reports/report-preview-dialog.tsx

"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchReportFileBlob } from "@/features/reports/api/reports-api";

type ReportPreviewDialogProps = {
  groupId: string;
  fileId: string | null;
  fileName: string;
  onOpenChange: (open: boolean) => void;
};

export function ReportPreviewDialog({
  groupId,
  fileId,
  fileName,
  onOpenChange,
}: ReportPreviewDialogProps) {
  const previewQuery = useQuery<Blob, Error>({
    queryKey: ["reports", "preview-blob", groupId, fileId] as const,

    queryFn: async () => {
      try {
        return await fetchReportFileBlob(groupId, fileId as string, "inline");
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("Unable to load the preview.");
      }
    },

    enabled: Boolean(fileId),
    staleTime: 60_000,
  });

  const blob = previewQuery.data;

  const objectUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return (
    <Dialog
      open={Boolean(fileId)}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[64rem] max-w-[92vw] h-[80vh] max-h-[92vh] min-w-[420px] min-h-[300px] resize overflow-auto p-0 sm:p-0">
        <DialogHeader className="border-b border-[#e4ddd0] px-5 py-4">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
        </DialogHeader>

        <div className="h-[calc(100%-4.5rem)] px-5 pb-5">
          {previewQuery.isLoading && (
            <div className="flex h-full items-center justify-center text-sm text-[#777777]">
              Loading preview…
            </div>
          )}

          {previewQuery.isError && (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-[#cc3333]">
              {previewQuery.error.message}
            </div>
          )}

          {objectUrl && !previewQuery.isError && (
            <iframe
              src={objectUrl}
              title={fileName}
              className="h-full w-full rounded-lg border border-[#e4ddd0]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
