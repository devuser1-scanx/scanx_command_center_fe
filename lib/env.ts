// lib/env.ts

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is missing. Add it to the .env file.",
  );
}

export const env = {
  apiBaseUrl,
} as const;