// features/fax-portal/case/prefill-link-dialog.tsx

"use client";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePrefillLinkDraft,
  useSendPrefillLink,
} from "@/features/fax-portal/hooks/use-case";

type PrefillLinkDialogProps = {
  referralId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Confirms texting the patient a personal link. Opening it takes them to the
 * Acuity booking page for their exam and clinic with their details already
 * filled in, so they only choose a date and time.
 */
export function PrefillLinkDialog({
  referralId,
  open,
  onOpenChange,
}: PrefillLinkDialogProps) {
  const draft = usePrefillLinkDraft(referralId, open);
  const send = useSendPrefillLink(referralId);

  async function handleSend() {
    try {
      await send.mutateAsync();
      toast.success("The booking link was texted to the patient.");
      onOpenChange(false);
    } catch {
      // The hook already showed the reason.
    }
  }

  const blocked = draft.data?.blocked_reason ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send prefill link to patient</DialogTitle>
        </DialogHeader>

        {draft.isPending ? (
          <p role="status" className="py-6 text-center text-sm text-[#6f5636]">
            Preparing the text…
          </p>
        ) : draft.isError ? (
          <p role="alert" className="py-4 text-center text-sm text-[#c0392b]">
            {draft.error.message}
          </p>
        ) : (
          <div className="space-y-3 text-sm text-[#2d2d2d]">
            <p>
              {draft.data.as_card
                ? "The patient gets this as a card with a Book Appointment button."
                : "The patient gets this text."}{" "}
              The button opens the Acuity booking page with their details
              already filled in, and they pick a date and time. The link
              expires in 7 days.
            </p>

            <p className="whitespace-pre-wrap rounded-md border border-[#e4ddd0] bg-[#faf8f3] p-3 text-xs leading-relaxed">
              {draft.data.message}
            </p>

            {blocked && (
              <p
                role="alert"
                className="rounded-md bg-[#fcf1dc] px-3 py-2 text-xs text-[#b7791f]"
              >
                {blocked}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={send.isPending}
            className="rounded-md border border-[#e4ddd0] px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#f5f1e8] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={send.isPending || !draft.data || blocked !== null}
            className="rounded-md bg-[#2f6fc0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#265a9e] disabled:pointer-events-none disabled:opacity-50"
          >
            {send.isPending ? "Sending…" : "Send link"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
