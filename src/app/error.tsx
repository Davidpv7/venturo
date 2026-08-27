"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        Please try again, or contact support if the problem keeps happening.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/" className="text-sm font-medium text-venturo-olive hover:underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
