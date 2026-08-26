"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { truncateToWords } from "@/lib/format";

export async function createRoom(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  const title = formData.get("title") as string;
  const subtitleRaw = ((formData.get("subtitle") as string) ?? "").trim();
  const subtitle = truncateToWords(subtitleRaw, 15) || null;
  const description = formData.get("description") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const leaseLength3Months = formData.get("leaseLength3Months") === "on";
  const leaseLength6Months = formData.get("leaseLength6Months") === "on";
  const leaseLength12Months = formData.get("leaseLength12Months") === "on";

  if (!leaseLength3Months && !leaseLength6Months && !leaseLength12Months) {
    redirect(`/admin/homes/${homeId}/rooms/new?error=missing-lease-length`);
  }

  const room = await prisma.room.create({
    data: {
      homeId,
      title,
      subtitle,
      description,
      price,
      leaseLength3Months,
      leaseLength6Months,
      leaseLength12Months,
    },
  });

  revalidateRoomPaths();
  redirect(`/admin/homes/${homeId}/rooms/${room.id}`);
}
