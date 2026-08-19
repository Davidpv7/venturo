"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";

export async function confirmRentPayment() {
  const dbUser = await requireUser();
  const contract = await getCurrentContract(dbUser.id);
  if (!contract) return;

  await prisma.contract.update({
    where: { id: contract.id },
    data: { rentTenantConfirmedAt: new Date() },
  });

  revalidatePath("/account/money");
}
