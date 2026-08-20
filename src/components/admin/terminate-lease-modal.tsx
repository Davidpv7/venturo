"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";

// Bespoke rather than reusing ModalTrigger/ConfirmForm: this confirmation
// needs a form field (the termination reason) inside it, which a plain
// window.confirm() can't hold — the "Terminate Lease" button inside the
// dialog is itself the confirmation step.
export function TerminateLeaseModal({
  tenantName,
  contractId,
  rentOverdue,
  incompleteMoveOutItems,
  action,
  triggerClassName,
}: {
  tenantName: string;
  contractId: string;
  rentOverdue: boolean;
  incompleteMoveOutItems: string[];
  action: (formData: FormData) => void | Promise<void>;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeOnBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) e.currentTarget.close();
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => dialogRef.current?.showModal()}
      >
        Terminate Lease
      </button>
      <dialog
        ref={dialogRef}
        onClick={closeOnBackdropClick}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg rounded-xl border border-venturo-olive/15 bg-white p-0 shadow-lg backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-venturo-olive/10 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Terminate {tenantName}&apos;s lease
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="cursor-pointer text-xl leading-none text-foreground/40 hover:text-foreground"
          >
            &times;
          </button>
        </div>

        <form action={action} className="flex flex-col gap-4 px-6 py-5">
          <input type="hidden" name="contractId" value={contractId} />

          {rentOverdue && (
            <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
              This tenant&apos;s rent is currently overdue. Terminating the lease won&apos;t
              collect what&apos;s owed — chase that separately if needed.
            </p>
          )}

          {incompleteMoveOutItems.length > 0 && (
            <p className="rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              The move-out checklist isn&apos;t fully done yet: {incompleteMoveOutItems.join(", ")}.
              Terminating won&apos;t check these off automatically.
            </p>
          )}

          <p className="text-sm text-foreground/70">
            The room goes back on the market and all of {tenantName}&apos;s uploaded documents
            (ID, proof of income, etc.) will be permanently deleted. This cannot be undone.
          </p>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Reason (optional)
            <textarea
              name="reason"
              rows={3}
              placeholder="e.g. Lease ended early, tenant moved out..."
              className={inputClasses}
            />
          </label>

          <div className="mt-1 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Terminate Lease
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
