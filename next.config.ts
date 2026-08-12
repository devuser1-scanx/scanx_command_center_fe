import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Next.js blocks cross-origin requests to the dev server by default.
   * These wildcards let an ngrok tunnel (or similar) reach it without
   * needing to update this file every time a new tunnel URL is generated.
   */
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app"],
};

export default nextConfig;
