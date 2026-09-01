"use client";

import { useCallback } from "react";
import { isNetworkError } from "@/lib/is-network-error";

// Wraps a form's Server Action so a brief connectivity blip (mobile network
// handoff, dead spot) doesn't fail the whole step — the identity/income
// steps upload files and are the slowest requests in the flow, so they're
// the most likely to span a network change. Retrying is safe here: every
// action this wraps either does a plain field update, document-replace, or
// re-checks draft status before acting, so a duplicate run converges to the
// same end state instead of double-applying.
export function RetryingForm({
  action,
  children,
  className,
  attempts = 2,
}: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  attempts?: number;
}) {
  const retryingAction = useCallback(
    async (formData: FormData) => {
      for (let attempt = 0; ; attempt++) {
        try {
          await action(formData);
          return;
        } catch (err) {
          if (attempt >= attempts || !isNetworkError(err)) throw err;
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
        }
      }
    },
    [action, attempts],
  );

  return (
    <form action={retryingAction} className={className}>
      {children}
    </form>
  );
}
