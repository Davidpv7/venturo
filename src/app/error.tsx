"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isNetworkError } from "@/lib/is-network-error";
import { reportClientError } from "@/lib/report-client-error";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const networkError = isNetworkError(error);

  useEffect(() => {
    console.error("[error boundary]", error);
    reportClientError(window.location.pathname, error.message, error.digest).catch(() => {});
  }, [error]);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {networkError ? "Connection interrupted" : "Something went wrong"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        {networkError
          ? "Check your signal and try again."
          : "Please try again, or contact support if the problem keeps happening."}
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className="text-sm font-medium text-venturo-olive hover:underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
