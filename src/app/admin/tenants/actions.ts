"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function markRentPaid(formData: FormData) {
  await requireAdmin();

  const contractId = formData.get("contractId") as string;
  const nextDueDate = formData.get("nextDueDate") as string;

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      rentLastPaidAt: new Date(),
      rentTenantConfirmedAt: null,
      nextRentDueDate: new Date(`${nextDueDate}T00:00:00.000Z`),
    },
  });

  revalidatePath("/admin/tenants");
  revalidatePath("/account/money");
}
