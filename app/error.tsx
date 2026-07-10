"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>

        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Error reference: {error.digest}
          </p>
        ) : null}

        <Button
          type="button"
          className="mt-6"
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    </main>
  );
}