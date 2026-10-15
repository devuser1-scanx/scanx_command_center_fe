// features/fax-portal/hooks/use-board.ts

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getBoard } from "@/features/fax-portal/api/fax-portal-api";
import { FAX_PORTAL_POLL_MS } from "@/features/fax-portal/hooks/use-fax-portal-counts";
import type {
  BoardQuery,
  BoardResponse,
} from "@/features/fax-portal/types/fax-portal-types";
import { normalizeApiError } from "@/lib/api/api-error";

/**
 * The board is re-fetched in full at least this often even when the server
 * says nothing changed: cards also age out of finished columns
 * (hide_after_days) without anyone touching them.
 */
const FULL_REFRESH_MS = 5 * 60 * 1000;

export type BoardData = BoardResponse & {
  /** When the full board was last fetched (client clock). */
  fullAt: number;
};

export function boardQueryKey(query: BoardQuery) {
  return [
    "fax-portal",
    "board",
    query.assignee,
    query.q.trim(),
    [...query.showOlder].sort().join(","),
  ] as const;
}

/**
 * The Referral Board, polled every 15 s. A poll sends the previous response's
 * server time as ?since=; when nothing has changed the server answers with a
 * tiny changed=false body and the cached board is kept as is.
 */
export function useBoard(query: BoardQuery) {
  const queryClient = useQueryClient();
  const queryKey = boardQueryKey(query);

  return useQuery<BoardData, Error>({
    queryKey,

    queryFn: async () => {
      try {
        const previous = queryClient.getQueryData<BoardData>(queryKey);
        const canPoll =
          previous !== undefined &&
          Date.now() - previous.fullAt < FULL_REFRESH_MS;

        const response = await getBoard(
          query,
          canPoll ? previous.server_time : undefined,
        );

        if (!response.changed && previous) {
          return { ...previous, server_time: response.server_time };
        }

        return { ...response, fullAt: Date.now() };
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load the referral board.",
        );
      }
    },

    refetchInterval: FAX_PORTAL_POLL_MS,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
