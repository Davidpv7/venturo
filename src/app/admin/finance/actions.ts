"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function parseCents(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return Math.round(parseFloat(value) * 100);
}

export async function updateHomeCosts(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  const weeklyCostCents = parseCents(formData.get("weeklyCost"));
  const weeklyServiceCostCents = parseCents(formData.get("weeklyServiceCost"));

  await prisma.home.update({
    where: { id: homeId },
    data: { weeklyCostCents, weeklyServiceCostCents },
  });

  revalidatePath("/admin/finance");
}
