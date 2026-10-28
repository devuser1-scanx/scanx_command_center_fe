// features/calls/hooks/use-call-events.ts

"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CALLS_QUERY_KEY } from "@/features/calls/hooks/use-calls-queries";
import type { CallEvent } from "@/features/calls/types/calls-types";
import { toWebSocketUrl } from "@/lib/api/ws-url";
import { tokenManager } from "@/lib/auth/token-manager";

const MIN_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 16000;
const HEARTBEAT_MS = 25_000;

/**
 * Keeps the Calls screens live: while it is mounted, a socket to Command
 * Center's API tells the page when a call starts, changes or ends, and every
 * Calls query is refreshed. The server notices calls placed here and by the
 * standalone Web Dialer alike, so both show up.
 *
 * Like the dashboard timeline, the socket is authenticated with the access
 * token in the query string (a browser cannot send headers on a WebSocket) and
 * reconnects with a growing delay, using whatever token is current then.
 */
export function useCallEvents(enabled = true): { connected: boolean } {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnectDelay = MIN_RECONNECT_DELAY_MS;
    let stopped = false;

    function scheduleReconnect() {
      if (stopped) {
        return;
      }

      reconnectTimeout = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    }

    function connect() {
      if (stopped) {
        return;
      }

      const accessToken = tokenManager.getAccessToken();

      if (!accessToken) {
        // Not signed in yet: nothing to subscribe with.
        scheduleReconnect();
        return;
      }

      const params = new URLSearchParams({ token: accessToken });

      socket = new WebSocket(`${toWebSocketUrl("/ws/calls")}?${params.toString()}`);

      socket.onopen = () => {
        reconnectDelay = MIN_RECONNECT_DELAY_MS;
        setConnected(true);

        heartbeat = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, HEARTBEAT_MS);
      };

      socket.onmessage = (message) => {
        let event: CallEvent;

        try {
          event = JSON.parse(message.data as string) as CallEvent;
        } catch {
          return;
        }

        if (event.type === "calls.changed") {
          void queryClient.invalidateQueries({ queryKey: CALLS_QUERY_KEY });
        }
      };

      socket.onclose = () => {
        setConnected(false);

        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }

        scheduleReconnect();
      };

      // onclose always follows; it handles the reconnect.
      socket.onerror = () => setConnected(false);
    }

    connect();

    return () => {
      stopped = true;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      if (heartbeat) {
        clearInterval(heartbeat);
      }

      if (socket) {
        // Detach first: closing must not schedule a reconnect.
        socket.onclose = null;
        socket.close();
      }

      setConnected(false);
    };
  }, [enabled, queryClient]);

  return { connected };
}
