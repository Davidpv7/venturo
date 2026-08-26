"use client";

import type { FormEvent, ReactNode } from "react";

// Same "did you mean to" confirm step as admin/delete-icon-form.tsx's
// DeleteIconForm, but for actions that render their own button (e.g. a
// labelled "Delete Permanently" rather than a bare icon) instead of always
// rendering a trash icon.
export function ConfirmForm({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
