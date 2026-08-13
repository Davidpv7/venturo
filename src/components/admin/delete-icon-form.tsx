"use client";

import type { FormEvent, ReactNode } from "react";
import { TrashIcon } from "@/components/ui/icons";

// A destructive action triggered straight from a listing row needs a
// confirm step — everything else in these tables is a single click. The
// server action itself still owns the real guardrails (FK-history checks
// etc.); this is just a "did you mean to" prompt.
export function DeleteIconForm({
  action,
  confirmMessage,
  label,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label: string;
  children?: ReactNode;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="inline-flex">
      {children}
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
