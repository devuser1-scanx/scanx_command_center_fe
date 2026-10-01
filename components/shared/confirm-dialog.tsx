"use client";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  isPending?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pendingLabel = "Working…",
  isPending = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-[#2d2d2d]"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm leading-6 text-[#666666]"
        >
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
