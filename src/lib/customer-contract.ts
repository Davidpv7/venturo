import { prisma } from "@/lib/prisma";
import { isLeaseActive } from "@/lib/lease";

// Shared by the My Stay, My Money, and Documents tabs, which all need the
// same "what's the tenant's current lease" data. A tenant could in theory
// have more than one Contract (e.g. a past lease plus a current one) — the
// most recently signed one is treated as their active stay. Returns null
// once that lease has been terminated (endedAt set) or its fixed term has
// run out, so those tabs fall back to their "no lease" empty state instead
// of showing a stale room/rent.
export async function getCurrentContract(userId: string) {
  const contract = await prisma.contract.findFirst({
    where: { userId, endedAt: null },
    orderBy: { agreedAt: "desc" },
    include: {
      room: { include: { home: true } },
      invoices: { orderBy: { dueDate: "asc" } },
      checklistItems: true,
      rentPayments: { orderBy: { paidAt: "desc" } },
    },
  });

  return contract && isLeaseActive(contract) ? contract : null;
}

export type CurrentContract = NonNullable<Awaited<ReturnType<typeof getCurrentContract>>>;
