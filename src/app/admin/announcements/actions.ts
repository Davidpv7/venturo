"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  await prisma.announcement.create({ data: { homeId, title, body } });

  revalidatePath("/admin/announcements");
  revalidatePath("/account/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  const announcementId = formData.get("announcementId") as string;

  await prisma.announcement.delete({ where: { id: announcementId } });

  revalidatePath("/admin/announcements");
  revalidatePath("/account/announcements");
}
