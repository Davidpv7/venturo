"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CONFIRMATION_MESSAGE =
  "Thanks — you confirmed payment. We'll mark this paid once it's received.";
const TOAST_DURATION_MS = 5000;

export function RentPaymentStatus({
  rentTenantConfirmedAt,
  confirmAction,
}: {
  rentTenantConfirmedAt: Date | null;
  confirmAction: () => void | Promise<void>;
}) {
  const [showToast, setShowToast] = useState(false);
  const previousConfirmedAt = useRef(rentTenantConfirmedAt);

  useEffect(() => {
    if (!previousConfirmedAt.current && rentTenantConfirmedAt) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
      previousConfirmedAt.current = rentTenantConfirmedAt;
      return () => clearTimeout(timer);
    }
    previousConfirmedAt.current = rentTenantConfirmedAt;
  }, [rentTenantConfirmedAt]);

  return (
    <>
      {rentTenantConfirmedAt ? (
        <p className="text-xs font-medium text-venturo-olive">
          Payment confirmed {rentTenantConfirmedAt.toLocaleDateString("en-AU")} — pending review.
        </p>
      ) : (
        <form action={confirmAction} className="flex items-center gap-3">
          <Button type="submit" variant="secondary">
            I&apos;ve Paid
          </Button>
          <span className="text-xs text-foreground/50">
            Click once you&apos;ve sent the transfer above.
          </span>
        </form>
      )}

      {showToast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-lg border border-venturo-olive/15 bg-white p-4 text-sm text-foreground shadow-lg sm:right-6 sm:left-auto"
        >
          {CONFIRMATION_MESSAGE}
        </div>
      )}
    </>
  );
}
