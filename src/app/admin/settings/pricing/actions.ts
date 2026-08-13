"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";

export async function updateRoomPrice(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);

  await prisma.room.update({ where: { id: roomId }, data: { price } });

  // Room.price also feeds the Overview income stat and the public listings,
  // not just this page.
  revalidateRoomPaths();
  revalidatePath("/admin/settings/pricing");
}

export async function setContractOverridePrice(formData: FormData) {
  await requireAdmin();

  const contractId = formData.get("contractId") as string;
  const overridePrice = Math.round(parseFloat(formData.get("overridePrice") as string) * 100);

  await prisma.contract.update({
    where: { id: contractId },
    data: { overridePriceCents: overridePrice },
  });

  revalidatePath("/admin/settings/pricing");
  revalidatePath("/admin/settings");
}

export async function clearContractOverridePrice(formData: FormData) {
  await requireAdmin();

  const contractId = formData.get("contractId") as string;

  await prisma.contract.update({
    where: { id: contractId },
    data: { overridePriceCents: null },
  });

  revalidatePath("/admin/settings/pricing");
  revalidatePath("/admin/settings");
}
