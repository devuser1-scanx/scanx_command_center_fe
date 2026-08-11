// lib/api/ws-url.ts

import { env } from "@/lib/env";

/**
 * Derives a ws:// or wss:// URL from the configured HTTP API base URL for
 * a given path (e.g. "/ws/dashboard/timeline").
 */
export function toWebSocketUrl(path: string): string {
  const baseUrl = env.apiBaseUrl.replace(/\/+$/, "");
  const wsBaseUrl = baseUrl.replace(/^http/, "ws");
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${wsBaseUrl}${normalizedPath}`;
}
