// features/fax-portal/hooks/use-case.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  abandonCall,
  dialPatient,
  getBookingInfo,
  getCase,
  getMessageTemplates,
  markDoNotCall,
  recordCallResult,
  searchReferrals,
  sendMessage,
  startCall,
  updateCase,
} from "@/features/fax-portal/api/fax-portal-api";
import { FAX_PORTAL_POLL_MS } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import type {
  BookingInfo,
  CallResultInput,
  CallResultResponse,
  CaseDetail,
  CaseUpdate,
  DialCallResponse,
  IntakeUpdateResponse,
  MessageTemplate,
  ReferralSearchItem,
  SendMessageResponse,
} from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

const LIVE_CALL_POLL_MS = 3_000;

export const caseQueryKey =(referralId: number) =>
  ["fax-portal", "case", referralId] as const;

/**
 * The Referral Case, refreshed every 15 s so calls, texts and moves made by
 * others show up. Edits in the booking form are held locally, so a refresh
 * never overwrites what is being typed.
 */
export function useCase(referralId: number) {
  return useQuery<CaseDetail, Error>({
    queryKey: caseQueryKey(referralId),

    queryFn: async () => {
      try {
        return await getCase(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load this referral.");
      }
    },

    // Faster while a Twilio call is live, so ringing / answered / no answer
    // shows up as it happens.
    refetchInterval: (query) =>
      query.state.data?.open_call_source === "twilio"
        ? LIVE_CALL_POLL_MS
        : FAX_PORTAL_POLL_MS,
    staleTime: 0,
  });
}

/** After any change on a case: the case itself, the board and the badges. */
export function useRefreshCase(referralId: number) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: caseQueryKey(referralId) });
    void queryClient.invalidateQueries({ queryKey: ["fax-portal", "board"] });
    void queryClient.invalidateQueries({ queryKey: ["fax-portal", "counts"] });
    void queryClient.invalidateQueries({ queryKey: ["fax-portal", "booking", referralId] });
  };
}

export function useUpdateCase(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<IntakeUpdateResponse, Error, CaseUpdate>({
    mutationFn: async (body) => {
      try {
        return await updateCase(referralId, body);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to save your changes. Please try again.",
        );
      }
    },

    onSuccess: refresh,

    onError: (error) => {
      toast.error(error.message);
      // A conflict means someone else changed it: show the latest.
      refresh();
    },
  });
}

export function useStartCall(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<{ call_id: number; started_at: string }, Error>({
    mutationFn: async () => {
      try {
        return await startCall(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to start the call.");
      }
    },

    onSuccess: refresh,

    onError: (error) => {
      toast.error(error.message);
      refresh();
    },
  });
}

/** Click-to-call: logs the call and returns the token the browser connects with. */
export function useDialPatient(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<DialCallResponse, Error>({
    mutationFn: async () => {
      try {
        return await dialPatient(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to start the call.");
      }
    },

    onSuccess: refresh,

    onError: (error) => {
      toast.error(error.message);
      refresh();
    },
  });
}

/** The browser could not start a call it was given: removes the call row. */
export function useAbandonCall(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<void, Error, number>({
    mutationFn: async (callId) => {
      try {
        await abandonCall(callId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to cancel the call.");
      }
    },

    onSettled: refresh,
  });
}

export function useRecordCallResult(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<CallResultResponse, Error, CallResultInput>({
    mutationFn: async (input) => {
      try {
        return await recordCallResult(input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to record the call result. Please try again.",
        );
      }
    },

    onSuccess: refresh,

    onError: (error) => {
      toast.error(error.message);
      refresh();
    },
  });
}

export function useDoNotCall(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<{ status: string; row_version: number }, Error>({
    mutationFn: async () => {
      try {
        return await markDoNotCall(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to block this number.");
      }
    },

    onSuccess: () => {
      toast.success("This number is now blocked for calls and texts.");
      refresh();
    },

    onError: (error) => toast.error(error.message),
  });
}

export function useMessageTemplates(referralId: number) {
  return useQuery<MessageTemplate[], Error>({
    queryKey: ["fax-portal", "templates", referralId],

    queryFn: async () => {
      try {
        return await getMessageTemplates(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the message templates.");
      }
    },

    // The wording depends on the booking details: refetched when they change.
    staleTime: 30_000,
  });
}

export function useSendMessage(referralId: number) {
  const refresh = useRefreshCase(referralId);

  return useMutation<
    SendMessageResponse,
    Error,
    { body: string; templateCode: string | null }
  >({
    mutationFn: async ({ body, templateCode }) => {
      try {
        return await sendMessage(referralId, body, templateCode);
      } catch (error) {
        throw normalizeApiError(error, "Unable to send the text message.");
      }
    },

    onSuccess: refresh,

    onError: (error) => {
      toast.error(error.message);
      // The attempt (or an opt-out it revealed) is on the case now.
      refresh();
    },
  });
}

export function useBookingInfo(referralId: number, enabled = true) {
  return useQuery<BookingInfo, Error>({
    queryKey: ["fax-portal", "booking", referralId],
    enabled,

    queryFn: async () => {
      try {
        return await getBookingInfo(referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the booking details.");
      }
    },

    staleTime: 0,
  });
}

export function useReferralSearch(q: string) {
  return useQuery<ReferralSearchItem[], Error>({
    queryKey: ["fax-portal", "search", q.trim()],

    queryFn: async () => {
      try {
        return await searchReferrals(q);
      } catch (error) {
        throw normalizeApiError(error, "Unable to search referrals.");
      }
    },

    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}
