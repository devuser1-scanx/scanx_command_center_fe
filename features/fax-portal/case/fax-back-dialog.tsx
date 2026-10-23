// features/fax-portal/case/fax-back-dialog.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFaxBackDraft,
  useSendFaxBack,
} from "@/features/fax-portal/hooks/use-case";
import type { FaxBackDraft } from "@/features/fax-portal/types/fax-portal-types";

/** WestFax's email-to-fax gateway: an email to <number>@westfax.com is faxed. */
const FAX_DOMAIN = "westfax.com";

/** Whatever was typed, as plain digits at the gateway: 9725550100@westfax.com. */
function toFaxAddress(value: string): string {
  let digits = value.replace(/\D/g, "");

  // A US number needs no leading country code.
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  return digits ? `${digits}@${FAX_DOMAIN}` : value.trim();
}

const LABEL = "text-xs font-semibold uppercase text-[#999999]";

const FIELD =
  "mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]";

type FaxBackDialogProps = {
  referralId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Faxes the referring physician that the patient could not be reached. Like the
 * patient profile's Send fax pop-up, nothing is final: the number, subject and
 * message (with the list of contact attempts) can all be changed before sending.
 */
export function FaxBackDialog({
  referralId,
  open,
  onOpenChange,
}: FaxBackDialogProps) {
  const draft = useFaxBackDraft(referralId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Fax the referring physician</DialogTitle>
        </DialogHeader>

        {draft.isPending ? (
          <p role="status" className="py-8 text-center text-sm text-[#6f5636]">
            Preparing the fax…
          </p>
        ) : draft.isError ? (
          <p role="alert" className="py-6 text-center text-sm text-[#c0392b]">
            {draft.error.message}
          </p>
        ) : (
          // Mounted once the draft has arrived, so the fields start from it.
          <FaxBackForm
            referralId={referralId}
            draft={draft.data}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FaxBackForm({
  referralId,
  draft,
  onClose,
}: {
  referralId: number;
  draft: FaxBackDraft;
  onClose: () => void;
}) {
  const send = useSendFaxBack(referralId);

  const [destination, setDestination] = useState(draft.destination_number);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  // The original fax goes with the message unless this is unticked.
  const [attachOriginal, setAttachOriginal] = useState(
    draft.original_fax_available,
  );
  // The usual next step once the physician has been told.
  const [markDidntRespond, setMarkDidntRespond] = useState(
    draft.can_mark_didnt_respond,
  );

  const digits = toFaxAddress(destination).replace(/@.*$/, "").replace(/\D/g, "");

  async function handleSend() {
    try {
      const result = await send.mutateAsync({
        destination_number: toFaxAddress(destination),
        subject,
        body,
        attach_original: attachOriginal,
        mark_didnt_respond: markDidntRespond,
      });

      toast.success(
        result.moved_to
          ? `Fax sent to ${result.destination_number}. The referral moved to Didn't Respond.`
          : `Fax sent to ${result.destination_number}.`,
      );
      onClose();
    } catch {
      // The hook already showed the reason.
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="fb-destination" className={LABEL}>
            Destination fax number
          </label>

          <input
            id="fb-destination"
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            // Tidied as soon as the field is left: digits only, plus @westfax.com.
            onBlur={() => setDestination(toFaxAddress(destination))}
            placeholder={`e.g. 9725550100@${FAX_DOMAIN}`}
            className={FIELD}
          />

          <p className="mt-1 text-[11px] text-[#6b6f78]">
            {draft.destination_source}
          </p>
        </div>

        <div>
          <label htmlFor="fb-subject" className={LABEL}>
            Subject
          </label>

          <input
            id="fb-subject"
            type="text"
            value={subject}
            maxLength={300}
            onChange={(event) => setSubject(event.target.value)}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="fb-body" className={LABEL}>
            Message
          </label>

          <textarea
            id="fb-body"
            value={body}
            rows={14}
            maxLength={20000}
            onChange={(event) => setBody(event.target.value)}
            className={`${FIELD} resize-y font-mono text-xs leading-relaxed`}
          />

          <p className="mt-1 text-[11px] text-[#6b6f78]">
            The attempts list shows when each call or text was made and the
            result, as &ldquo;Agent&rdquo;: no names and no message text.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-[#2d2d2d]">
          <input
            type="checkbox"
            checked={attachOriginal}
            disabled={!draft.original_fax_available}
            onChange={(event) => setAttachOriginal(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Attach the original fax (PDF)
            {!draft.original_fax_available && (
              <span className="block text-[11px] text-[#6b6f78]">
                The original fax PDF is not available for this referral.
              </span>
            )}
          </span>
        </label>

        {draft.can_mark_didnt_respond && (
          <label className="flex items-start gap-2 text-sm text-[#2d2d2d]">
            <input
              type="checkbox"
              checked={markDidntRespond}
              onChange={(event) => setMarkDidntRespond(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              After sending, move this referral to <strong>Didn&apos;t Respond</strong>
            </span>
          </label>
        )}
      </div>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={send.isPending}
          className="rounded-md border border-[#e4ddd0] px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#f5f1e8] disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={send.isPending || digits.length < 10 || !body.trim()}
          className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636] disabled:pointer-events-none disabled:opacity-50"
        >
          {send.isPending ? "Sending…" : "Send fax"}
        </button>
      </DialogFooter>
    </>
  );
}
