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
  const leaseLengthMonths = parseInt(formData.get("leaseLengthMonths") as string, 10);

  const room = await prisma.room.create({
    data: { homeId, title, subtitle, description, price, leaseLengthMonths },
  });

  revalidateRoomPaths();
  redirect(`/admin/homes/${homeId}/rooms/${room.id}`);
}
