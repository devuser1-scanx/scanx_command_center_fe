// features/fax-portal/hooks/use-referral-actions.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  assignReferral,
  getFaxPortalAgents,
  moveReferral,
} from "@/features/fax-portal/api/fax-portal-api";
import type {
  FaxPortalAgent,
  MoveReferralInput,
  MoveReferralResponse,
} from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

function useRefreshFaxPortal() {
  const queryClient = useQueryClient();

  // Board and sidebar badges both change after any card action.
  return () =>
    queryClient.invalidateQueries({ queryKey: ["fax-portal"] });
}

/**
 * Moves a card to another column (drag or button). Every status change goes
 * through the same backend rules; on a refusal the card was never moved
 * locally, so refreshing the board is what "snaps it back".
 */
export function useMoveReferral() {
  const refresh = useRefreshFaxPortal();

  return useMutation<MoveReferralResponse, Error, MoveReferralInput>({
    mutationFn: async (input) => {
      try {
        return await moveReferral(input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to move the referral. Please try again.",
        );
      }
    },

    onSuccess: () => {
      void refresh();
    },

    onError: (error) => {
      toast.error(error.message);
      void refresh();
    },
  });
}

export function useAssignReferral() {
  const refresh = useRefreshFaxPortal();

  return useMutation<
    unknown,
    Error,
    {
      referralId: number;
      assignedUserId: number | null;
      rowVersion: number;
    }
  >({
    mutationFn: async (input) => {
      try {
        return await assignReferral(input);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to reassign the referral. Please try again.",
        );
      }
    },

    onSuccess: () => {
      toast.success("Referral reassigned.");
      void refresh();
    },

    onError: (error) => {
      toast.error(error.message);
      void refresh();
    },
  });
}

export function useFaxPortalAgents(enabled = true) {
  return useQuery<FaxPortalAgent[], Error>({
    queryKey: ["fax-portal", "agents"],
    enabled,

    queryFn: async () => {
      try {
        return await getFaxPortalAgents();
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load the sales agents.",
        );
      }
    },

    staleTime: 5 * 60 * 1000,
  });
}
