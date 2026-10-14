// features/fax-portal/hooks/use-intake.ts

import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getFaxPdf,
  getIntakeDetail,
  getIntakeQueue,
  markReferralViewed,
  updateIntake,
} from "@/features/fax-portal/api/fax-portal-api";
import { FAX_PORTAL_POLL_MS } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import type {
  IntakeDetail,
  IntakeQueue,
  IntakeTab,
  IntakeUpdate,
  IntakeUpdateResponse,
} from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

export function useIntakeQueue(tab: IntakeTab, page: number) {
  return useQuery<IntakeQueue, Error>({
    queryKey: ["fax-portal", "intake", "queue", tab, page],

    queryFn: async () => {
      try {
        return await getIntakeQueue(tab, page);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the intake queue.");
      }
    },

    refetchInterval: FAX_PORTAL_POLL_MS,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useIntakeDetail(referralId: number | null) {
  return useQuery<IntakeDetail, Error>({
    queryKey: ["fax-portal", "intake", "detail", referralId],
    enabled: referralId !== null,

    queryFn: async () => {
      try {
        return await getIntakeDetail(referralId as number);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load this referral.");
      }
    },

    // Edits are made by the reviewer in the form; never overwrite them
    // behind their back with a background refetch.
    staleTime: Infinity,
    refetchOnMount: "always",
  });
}

/**
 * Opening a referral clears its NEW tag and is recorded in the audit log.
 * Quietly refreshes the queue, board and sidebar badges afterwards.
 */
export function useMarkViewed() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (referralId) => {
      await markReferralViewed(referralId);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["fax-portal", "intake", "queue"],
      });
      void queryClient.invalidateQueries({ queryKey: ["fax-portal", "board"] });
      void queryClient.invalidateQueries({ queryKey: ["fax-portal", "counts"] });
    },
  });
}

export function useUpdateIntake(referralId: number) {
  const queryClient = useQueryClient();

  return useMutation<IntakeUpdateResponse, Error, IntakeUpdate>({
    mutationFn: async (body) => {
      try {
        return await updateIntake(referralId, body);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to save your changes. Please try again.",
        );
      }
    },

    onSuccess: () => {
      // Pick up the new row_version and saved values, so the next save or
      // release is not rejected as a stale edit.
      void queryClient.invalidateQueries({
        queryKey: ["fax-portal", "intake", "detail", referralId],
      });
      void queryClient.invalidateQueries({ queryKey: ["fax-portal", "board"] });
    },

    onError: (error) => {
      toast.error(error.message);

      // A conflict means the card changed under us: reload the latest.
      void queryClient.invalidateQueries({
        queryKey: ["fax-portal", "intake", "detail", referralId],
      });
    },
  });
}

/**
 * Loads the fax PDF through the backend and exposes it as a temporary blob
 * URL. Each load is an audited view, so it is never served from the cache.
 */
export function useFaxPdf(faxId: number, referralId: number) {
  const query = useQuery<Blob, Error>({
    queryKey: ["fax-portal", "pdf", faxId, referralId],

    queryFn: async () => {
      try {
        return await getFaxPdf(faxId, referralId);
      } catch (error) {
        throw normalizeApiError(error, "Unable to load the fax PDF.");
      }
    },

    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const [url, setUrl] = useState<string | null>(null);
  const blob = query.data;

  useEffect(() => {
    if (!blob) {
      return;
    }

    // The blob URL is an external browser resource: create it here and
    // revoke it in the cleanup (which also keeps this correct when React
    // runs the effect twice in development).
    const objectUrl = URL.createObjectURL(blob);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [blob]);

  return {
    url,
    isLoading: query.isPending || (query.isSuccess && url === null),
    error: query.error,
    retry: () => void query.refetch(),
  };
}
