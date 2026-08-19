"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function updatePaymentSettings(formData: FormData) {
  await requireAdmin();

  const bankDetails = (formData.get("bankDetails") as string).trim();

  await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", bankDetails },
    update: { bankDetails },
  });

  revalidatePath("/admin/settings/payment");
  revalidatePath("/account/money");
}
