import type { InvoiceDisplayStatus } from "@/lib/invoices";

const STYLES: Record<InvoiceDisplayStatus, string> = {
  PAID: "bg-venturo-olive/10 text-venturo-olive",
  UPCOMING: "bg-foreground/10 text-foreground/70",
  OVERDUE: "bg-red-50 text-red-700",
};

const LABELS: Record<InvoiceDisplayStatus, string> = {
  PAID: "Paid",
  UPCOMING: "Upcoming",
  OVERDUE: "Overdue",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceDisplayStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
