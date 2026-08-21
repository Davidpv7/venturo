import { prisma } from "@/lib/prisma";

// Shared by the My Stay, My Money, and Documents tabs, which all need the
// same "what's the tenant's current lease" data. A tenant could in theory
// have more than one Contract (e.g. a past lease plus a current one) — the
// most recently signed one is treated as their active stay.
export function getCurrentContract(userId: string) {
  return prisma.contract.findFirst({
    where: { userId },
    orderBy: { agreedAt: "desc" },
    include: {
      room: { include: { home: true } },
      invoices: { orderBy: { dueDate: "asc" } },
      checklistItems: true,
      rentPayments: { orderBy: { paidAt: "desc" } },
    },
  });
}

export type CurrentContract = NonNullable<Awaited<ReturnType<typeof getCurrentContract>>>;
