import type { RentDueStatus } from "@/lib/rent-status";

const STYLES: Record<RentDueStatus, string> = {
  ON_TRACK: "bg-venturo-olive/10 text-venturo-olive",
  DUE_SOON: "bg-amber-50 text-amber-700",
  OVERDUE: "bg-red-50 text-red-700",
  NO_DATE: "bg-foreground/10 text-foreground/70",
};

const LABELS: Record<RentDueStatus, string> = {
  ON_TRACK: "On track",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  NO_DATE: "No due date",
};

export function RentDueBadge({ status }: { status: RentDueStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
