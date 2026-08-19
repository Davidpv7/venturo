export type RentDueStatus = "NO_DATE" | "ON_TRACK" | "DUE_SOON" | "OVERDUE";

const DUE_SOON_WINDOW_DAYS = 2;

// Derived at display time from nextRentDueDate rather than stored, same
// reasoning as getInvoiceDisplayStatus in src/lib/invoices.ts — nobody has
// to remember to flip a status, and it can never go stale.
export function getRentDueStatus(
  nextRentDueDate: Date | null,
  now: Date = new Date(),
): RentDueStatus {
  if (!nextRentDueDate) return "NO_DATE";
  if (nextRentDueDate < now) return "OVERDUE";

  const msUntilDue = nextRentDueDate.getTime() - now.getTime();
  const daysUntilDue = msUntilDue / (24 * 60 * 60 * 1000);
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return "DUE_SOON";

  return "ON_TRACK";
}
