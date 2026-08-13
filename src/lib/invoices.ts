import type { Invoice } from "@/generated/prisma/client";

export type InvoiceDisplayStatus = "PAID" | "UPCOMING" | "OVERDUE";

// "Overdue" isn't a stored status — it's an UPCOMING invoice whose due date
// has passed. Deriving it here means nobody has to remember to flip a
// status, and it can never go stale relative to the current date.
export function getInvoiceDisplayStatus(
  invoice: Pick<Invoice, "status" | "dueDate">,
): InvoiceDisplayStatus {
  if (invoice.status === "PAID") return "PAID";
  return invoice.dueDate < new Date() ? "OVERDUE" : "UPCOMING";
}
