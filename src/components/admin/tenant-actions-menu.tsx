"use client";

import { useState } from "react";
import { ModalTrigger } from "@/components/ui/modal";
import { TerminateLeaseModal } from "@/components/admin/terminate-lease-modal";
import { APPLICATION_DOCUMENT_TYPE_LABEL } from "@/lib/application-labels";
import { formatCurrency } from "@/lib/format";
import type { ApplicationDocumentType } from "@/generated/prisma/client";

type TenantDocument = {
  id: string;
  type: ApplicationDocumentType;
  fileName: string;
  downloadUrl: string;
};

type RentPayment = {
  id: string;
  amountCents: number;
  paidAt: Date;
  dueDate: Date;
};

export function TenantActionsMenu({
  tenantName,
  contractId,
  documents,
  rentOverdue,
  incompleteMoveOutItems,
  rentPayments,
  nextRentDueDate,
  terminateAction,
}: {
  tenantName: string;
  contractId: string;
  documents: TenantDocument[];
  rentOverdue: boolean;
  incompleteMoveOutItems: string[];
  rentPayments: RentPayment[];
  nextRentDueDate: Date | null;
  terminateAction: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Tenant actions"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-venturo-olive/10 hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-outside catcher */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={close}
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-venturo-olive/15 bg-white py-1 shadow-lg">
            {/* Deliberately doesn't close this dropdown on click — the
                click-outside catcher is a sibling, not an ancestor, of the
                trigger button, so opening the dialog leaves `open` (and the
                already-open <dialog>) alone rather than unmounting it. */}
            <ModalTrigger
              label="See Documents"
              title={`${tenantName}'s documents`}
              triggerClassName="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground/80 hover:bg-venturo-olive/5"
            >
              {documents.length === 0 ? (
                <p className="text-sm text-foreground/60">No documents found for this tenant.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <a href={doc.downloadUrl} className="text-venturo-olive hover:underline">
                        {APPLICATION_DOCUMENT_TYPE_LABEL[doc.type]} — {doc.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </ModalTrigger>

            <ModalTrigger
              label="Pay History & Upcoming"
              title={`${tenantName}'s rent`}
              triggerClassName="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground/80 hover:bg-venturo-olive/5"
            >
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                  Upcoming
                </h3>
                <p className="mt-1 text-sm text-foreground">
                  {nextRentDueDate
                    ? `Next due ${nextRentDueDate.toLocaleDateString("en-AU")}`
                    : "No due date set yet"}
                </p>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                  History
                </h3>
                {rentPayments.length === 0 ? (
                  <p className="mt-1 text-sm text-foreground/60">No payments recorded yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2 text-sm">
                    {rentPayments.map((payment) => (
                      <li key={payment.id} className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {formatCurrency(payment.amountCents)} paid{" "}
                          {payment.paidAt.toLocaleDateString("en-AU")}
                        </span>
                        <span className="text-xs text-foreground/50">
                          For the period due {payment.dueDate.toLocaleDateString("en-AU")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ModalTrigger>

            <TerminateLeaseModal
              tenantName={tenantName}
              contractId={contractId}
              rentOverdue={rentOverdue}
              incompleteMoveOutItems={incompleteMoveOutItems}
              action={terminateAction}
              triggerClassName="block w-full cursor-pointer px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            />
          </div>
        </>
      )}
    </div>
  );
}
