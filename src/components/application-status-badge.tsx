import type { ApplicationStatus } from "@/generated/prisma/client";

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Not successful",
};

const badgeClasses: Record<ApplicationStatus, string> = {
  DRAFT: "bg-foreground/5 text-foreground/40",
  SUBMITTED: "bg-foreground/10 text-foreground/70",
  UNDER_REVIEW: "bg-foreground/10 text-foreground/70",
  APPROVED: "bg-venturo-olive/10 text-venturo-olive",
  REJECTED: "bg-red-50 text-red-700",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[status]}`}>
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}
