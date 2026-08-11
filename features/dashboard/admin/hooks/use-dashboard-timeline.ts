// features/dashboard/admin/hooks/use-dashboard-timeline.ts

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDashboardTimeline,
  mapTimelineAppointment,
  type TimelineAppointmentApiResponse,
} from "@/features/dashboard/admin/api/dashboard-api";
import type { TimelineAppointment } from "@/features/dashboard/admin/timeline-by-appointment";
import { normalizeApiError } from "@/lib/api/api-error";
import { toWebSocketUrl } from "@/lib/api/ws-url";
import { tokenManager } from "@/lib/auth/token-manager";

type UseDashboardTimelineParams = {
  clinicId: number | null;
  date: string;
  /**
   * Defaults to true. Pass false while the clinic id hasn't resolved yet
   * (e.g. still waiting on useClinics()) so this hook doesn't fetch or
   * open a socket with a temporarily-wrong filter.
   */
  enabled?: boolean;
};

type TimelineSocketMessage = {
  type: "timeline.snapshot" | "timeline.update";
  clinic_id: number | null;
  date: string;
  appointments: TimelineAppointmentApiResponse[];
};

const MIN_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 16000;

export function dashboardTimelineQueryKey(
  params: UseDashboardTimelineParams,
) {
  return [
    "dashboard",
    "timeline",
    params.clinicId,
    params.date,
  ] as const;
}

/**
 * Fetches today's timeline via react-query, then keeps it live by opening a
 * WebSocket subscription that pushes fresh snapshots straight into the
 * query cache (queryClient.setQueryData). The component only ever reads
 * from useQuery's return value - the socket is just another writer into
 * the same cache entry.
 */
export function useDashboardTimeline({
  enabled = true,
  ...params
}: UseDashboardTimelineParams) {
  const queryClient = useQueryClient();
  const queryKey = dashboardTimelineQueryKey(params);

  const query = useQuery<TimelineAppointment[], Error>({
    queryKey,
    enabled,

    queryFn: async () => {
      try {
        return await getDashboardTimeline(params);
      } catch (error) {
        throw normalizeApiError(
          error,
          "Unable to load today's appointments.",
        );
      }
    },

    staleTime: 30_000,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<
      typeof setTimeout
    > | null = null;
    let reconnectDelay = MIN_RECONNECT_DELAY_MS;
    let stopped = false;

    function connect() {
      if (stopped) {
        return;
      }

      const accessToken = tokenManager.getAccessToken();

      if (!accessToken) {
        /**
         * No session yet. The react-query fetch above will surface its
         * own 401; there is nothing useful to subscribe with here.
         */
        return;
      }

      const socketParams = new URLSearchParams();
      socketParams.set("token", accessToken);

      if (params.clinicId !== null) {
        socketParams.set(
          "clinic_id",
          String(params.clinicId),
        );
      }

      socket = new WebSocket(
        `${toWebSocketUrl("/ws/dashboard/timeline")}?${socketParams.toString()}`,
      );

      socket.onopen = () => {
        reconnectDelay = MIN_RECONNECT_DELAY_MS;
      };

      socket.onmessage = (event) => {
        try {
          const message: TimelineSocketMessage = JSON.parse(
            event.data,
          );

          queryClient.setQueryData(
            queryKey,
            message.appointments.map(
              mapTimelineAppointment,
            ),
          );
        } catch {
          /**
           * Malformed message - ignore it, the next broadcast (or the
           * next poll tick server-side) will resend a good one.
           */
        }
      };

      socket.onclose = () => {
        if (stopped) {
          return;
        }

        reconnectTimeout = setTimeout(() => {
          reconnectDelay = Math.min(
            reconnectDelay * 2,
            MAX_RECONNECT_DELAY_MS,
          );
          connect();
        }, reconnectDelay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      stopped = true;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, params.clinicId, params.date, queryClient]);

  return query;
}
